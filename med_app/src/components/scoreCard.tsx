
import "../Styles/ScoreCard.css";
import type { ResumeAnalysis, ScoreBreakdown } from "../types/analysis.ts";

interface WaterTankProps {
    level?: number;
    label?: string;
}

const WaterTank = ({
    level = 65,
    label = "Overall Score",
}: WaterTankProps) => {
    const fillPercentage = Math.min(Math.max(level, 0), 100);

    return (
        <div className="tank-card">
            <div className="tank-outer">
                <div className="tank-inner">
                    {/* Liquid */}
                    <div
                        className="tank-liquid"
                        style={{ height: `${fillPercentage}%` }}
                    >
                        <div className="tank-wave" />
                    </div>

                    {/* Score */}
                    <span
                        className={`tank-readout ${
                            fillPercentage > 50 ? "dark" : ""
                        }`}
                    >
                        {fillPercentage}%
                    </span>
                </div>

                {/* Label */}
                <span className="tank-label">{label}</span>
            </div>
        </div>
    );
};

interface ScoreCardUIProps {
    analysis: ResumeAnalysis;
}

export function ScoreCardUI({ analysis }: ScoreCardUIProps) {
    // ✅ Real backend data — replaces the old hardcoded `result` object.
    //    `?? []` / `?? 0` keep this render-safe if a field is missing.
    const {
        overallScore,
        scoreBreakdown,
        resumeStrengths = [],
        issues = [],
        missingInformation = [],
        improvementSuggestions = [],
        verdict,
        companySuggestions = [],
    } = analysis ?? ({} as ResumeAnalysis);

    const maxPerCategory = 20;

    // Display labels for each key returned by the backend
    const breakdownLabels: Record<keyof ScoreBreakdown, string> = {
        atsCompatibility: "ATS Compatibility",
        keywords: "Keywords",
        impact: "Impact",
        formatting: "Formatting",
        clarity: "Clarity",
    };

    return (
        <div className="dashboard-UI">
            <h1 className="title-ofUI">Analyzed Report</h1>

            {/* ================= SCORE + BREAKDOWN ================= */}
            <div className="score-grid">
                <WaterTank level={overallScore} />

                <section className="card breakdown-card">
                    <h2 className="card-title">Score Breakdown</h2>

                    {/* Defensive: never Object.entries(undefined) */}
                    {(Object.entries(scoreBreakdown ?? {}) as [
                        keyof ScoreBreakdown,
                        number
                    ][]).map(([key, value]) => (
                        <div className="breakdown-row" key={key}>
                            <div className="breakdown-info">
                                <span className="breakdown-label">
                                    {breakdownLabels[key]}
                                </span>

                                <span className="breakdown-value">
                                    {value}/{maxPerCategory}
                                </span>
                            </div>

                            <div className="breakdown-track">
                                <div
                                    className="breakdown-fill"
                                    style={{
                                        width: `${
                                            (value / maxPerCategory) * 100
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* ================= RESUME STRENGTHS ================= */}
            <section className="card strengths-UI">
                <h2 className="card-title">Resume Strengths</h2>

                <ul className="strength-list">
                    {resumeStrengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </section>

            {/* ================= ISSUES ================= */}
            <section className="card issues-UI">
                <h2 className="card-title">Issues Found</h2>

                <ul className="issues-list">
                    {issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                    ))}
                </ul>
            </section>

            {/* ================= MISSING + SUGGESTIONS (side by side) ================= */}
            <div className="duo-grid">
                <section className="card missing-UI">
                    <h2 className="card-title">Missing Information</h2>

                    <ul className="missing-list">
                        {missingInformation.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="card suggestions-UI">
                    <h2 className="card-title">Improvement Suggestions</h2>

                    <p className="sub-title">Top 3 Fixes</p>

                    <ol className="top-fixes">
                        {improvementSuggestions.map((fix) => (
                            <li key={fix.rank}>
                                <span className="fix-rank">{fix.rank}</span>
                                <div className="fix-body">
                                    <span className="fix-title">{fix.title}</span>
                                    <span className="fix-desc">{fix.description}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            {/* ================= VERDICT ================= */}
            <section className="card verdict-UI">
                <h2 className="card-title">Verdict</h2>

                <p className="verdict-text">
                    {verdict}
                </p>
            </section>

            {/* ================= COMPANIES ================= */}
            <section className="card company-UI">
                <h2 className="card-title">Company Suggestions</h2>

                <div className="company-chips">
                    {companySuggestions.map((company) => (
                        <span
                            key={company}
                            className="company-chip"
                        >
                            {company}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}