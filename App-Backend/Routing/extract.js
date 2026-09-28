import express from 'express';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { analyseResume } from '../AiLayer.js'
import multer from 'multer';
import crypto from 'crypto';                    // crypto.randomUUID()
import { redisClient } from '../redis.js';      // temporary resume storage
export const ExRoute = express.Router();

const upload = multer({
    dest: 'uploads/'
});

// verifyToken (copied from med_learn/backend/server.js) was REMOVED here.
// Why it was wrong:
//   1. ARGUMENT ORDER — ExRoute.post() expects (path, ...handlers). verifyToken
//      was passed first, so Express treated the FUNCTION as the route path and
//      the string '/resume-extract' as a handler. Route never worked.
//   2. No JWT_SECRET in this backend's .env -> jwt.verify() always throws -> 401.
//   3. The frontend never sends an Authorization header -> always "Token missing".
//   4. The token is issued by med_learn's server, which also binds port 3000,
//      so both backends cannot run at once to sign and verify a token.
ExRoute.post(
    '/resume-extract',
    upload.single('resume'),
    async (req, res) => {

        try{
            
            if(!req.file){
                return res.status(400).json({
                    message: "You have to upload the Resume First"
                });
            }

            let ResumeText = "";
            // PDF
            if(req.file.mimetype === "application/pdf"){
                const fileBuffer = await fs.readFile(req.file.path);

                const parse = new PDFParse({
                    data: fileBuffer
                });

                const result = await parse.getText();
                ResumeText = result.text;
                await parse.destroy();
            }
            // DOCX
            else if(req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                const result = await mammoth.extractRawText({
                    path: req.file.path
                });
                ResumeText = result.value
            }

            else{
                return res.status(400).json({
                    message: "Only PDF and DOCX Supported.."
                });
            }

            await fs.unlink(req.file.path);

            // ------------------------------------------------
            // 4) Unique id for this upload
            //    Keys: resume:<uuid>  and  analysis:<uuid>
            // ------------------------------------------------
            const resumeId = crypto.randomUUID();
            const resumeKey = `resume:${resumeId}`;
            const analysisKey = `analysis:${resumeId}`;
            const TTL_SECONDS = 3600;   // 1 hour — Redis purges it automatically

            // ------------------------------------------------
            // 5) Store the extracted text in Redis for 1 hour.
            //    On failure we return a backend error and log it
            //    loudly — the server keeps running, nothing is
            //    silently ignored.
            // ------------------------------------------------
            try {
                await redisClient.setEx(resumeKey, TTL_SECONDS, ResumeText);
            }
            catch (err) {
                console.error('[Redis] Failed to WRITE resume text:', err.message);
                return res.status(503).json({
                    message: "Resume storage failed - Redis is unavailable"
                });
            }

            // ------------------------------------------------
            // 6) The AI step reads the text BACK from Redis,
            //    so Redis is the source of truth for analysis.
            // ------------------------------------------------
            let textForAI;
            try {
                textForAI = await redisClient.get(resumeKey);
            }
            catch (err) {
                console.error('[Redis] Failed to READ resume text:', err.message);
                return res.status(503).json({
                    message: "Resume could not be read back from Redis"
                });
            }

            if (textForAI === null) {
                return res.status(503).json({
                    message: "Resume text is no longer available in Redis"
                });
            }

            const analysis = await analyseResume(textForAI);

            // ------------------------------------------------
            // 6b) Keep the analysis for 1 hour too
            // ------------------------------------------------
            try {
                await redisClient.setEx(analysisKey, TTL_SECONDS, JSON.stringify(analysis));
            }
            catch (err) {
                console.error('[Redis] Failed to WRITE analysis:', err.message);
                return res.status(503).json({
                    message: "Analysis storage failed - Redis is unavailable"
                });
            }

            // ------------------------------------------------
            // 9) Frontend contract is unchanged: React still reads
            //    data.analysis. resumeId is only ADDED so the key
            //    can be looked up with redis-cli.
            // ------------------------------------------------
            res.status(200).json({
                message: "Resume Text Successfully Extracted",
                analysis: analysis,
                resumeId: resumeId
            });
        }
        catch(err){
            console.error("Oops.. something went wrong", err);

            res.status(500).json({
                message: "Failed to extract the file Data"
            });
        }
    }
);