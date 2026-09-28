import '../Styles/AIResume.css';
import { ScoreCardUI } from '../components/scoreCard.tsx';
import { useState } from 'react';
import type { ResumeAnalysis, AnalyzeResumeResponse } from '../types/analysis.ts';
import { isResumeAnalysis } from '../types/analysis.ts';

export function AIResumeChecker() {

    const [resume, SetResume] = useState<File | null>(null);

    // ✅ Stores response.analysis from the backend
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    // ✅ Loading state while the AI analysis is being fetched
    const [loading, setLoading] = useState(false);
    // ✅ Basic error state if the API request fails
    const [error, setError] = useState<string | null>(null);

    const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Resume must be smaller than 5MB");
            return;
        }

        SetResume(file);
        // Selecting a new file clears the previous result/error
        setAnalysis(null);
        setError(null);
    };

    const handleAnalyse = async () => {
        if (!resume) {
            alert("Please select a resume first");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resume);

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch("http://localhost:3000/resume-extract", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message ?? `Request failed: ${response.status}`);
            }

            if (!data.analysis) {
                throw new Error("The server response did not include analysis");
            }

            // ✅ Runtime shape check — the backend must send the structured object,
            //    not a markdown string / partial object. Fails into the error UI
            //    instead of crashing ScoreCardUI with Object.entries(undefined).
            if (!isResumeAnalysis(data.analysis)) {
                console.error("Unexpected analysis payload:", data.analysis);
                throw new Error(
                    "The server returned an unexpected analysis format. " +
                    "Try restarting the backend so it picks up the latest AI layer code."
                );
            }

            // ✅ Keep the payload exactly as received — no reshaping
            setAnalysis((data as AnalyzeResumeResponse).analysis);
        } catch (err) {
            console.error("Resume analysis failed:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while analyzing your resume."
            );
        } finally {
            // ✅ Always stop the spinner
            setLoading(false);
        }
    }

    return (
        <>
            <div className="main-app">
                <h1 className="heading-title">AI Based Resume Checker</h1>

                <div className="Multer-DropDown">

                    <label className="upload-box">
                        <p>Drop your resume here or choose a file </p>
                        <span>PDF, DOC, or DOCX (max: 5mb)</span>

                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadFile} />
                    </label>
                    {resume && (
                        <div className="file-actions">
                            <p className="selected-file">
                                <span className="file-icon">📄</span>
                                {resume.name}
                            </p>
                            <button
                                onClick={handleAnalyse}
                                className="btn-analyse"
                                disabled={loading}
                            >
                                {loading ? "Analyzing…" : "Analyse Resume"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="heading-APP">

                <p className="inst-p">
                    Upload your resume and let our AI analyze it in seconds. Get a detailed report
                    on what recruiters and ATS software look for — common mistakes, missing keywords,
                    formatting issues, and actionable tips to improve your chances of landing an interview.
                </p>
            </div>

            <div className="compo-scoreCard">
                {/* ✅ LOADING */}
                {loading && (
                    <div className="analysis-status" role="status" aria-live="polite">
                        <span className="analysis-spinner" />
                        <p>Analyzing your resume…</p>
                    </div>
                )}

                {/* ✅ ERROR */}
                {!loading && error && (
                    <div className="analysis-status analysis-error" role="alert">
                        <p className="analysis-error-title">Analysis failed</p>
                        <p>{error}</p>
                        <button className="btn-analyse" onClick={handleAnalyse}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* ✅ RESULT — real backend data through props */}
                {!loading && !error && analysis && (
                    <ScoreCardUI analysis={analysis} />
                )}
            </div>
        </>
    )
}