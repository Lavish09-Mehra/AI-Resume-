import express from 'express';
import multer from 'multer';
export const AnRoute = express.Router();

const upload = multer({
    dest: 'uploads/'
});

// verifyToken removed for the same reasons documented in extract.js.
// Note: the argument ORDER here was already correct (path first) — only
// extract.js had it in the wrong slot — but the middleware still cannot
// succeed without JWT_SECRET + an Authorization header, so it is dropped
// for consistency across this backend.
AnRoute.post(
    '/resume-analyze',
    upload.single('resume'),
    (req, res) => {

        console.log(req.file);

        res.json({
            message: 'Resume received'
        });
    }
);