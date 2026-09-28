/**
 * Types for the AI resume-analysis response coming from the backend.
 * Shapes mirror the API exactly — no invented fields.
 *
 * POST /resume-extract  ->  { "message": "...", "analysis": ResumeAnalysis }
 */

export interface ScoreBreakdown {
    atsCompatibility: number;
    keywords: number;
    impact: number;
    formatting: number;
    clarity: number;
}

export interface ImprovementSuggestion {
    rank: number;
    title: string;
    description: string;
}

/** The payload stored in React state (response.analysis) */
export interface ResumeAnalysis {
    overallScore: number;
    scoreBreakdown: ScoreBreakdown;
    resumeStrengths: string[];
    issues: string[];
    missingInformation: string[];
    improvementSuggestions: ImprovementSuggestion[];
    verdict: string;
    companySuggestions: string[];
}

/** Full API response envelope */
export interface AnalyzeResumeResponse {
    message: string;
    analysis: ResumeAnalysis;
}

/**
 * Runtime guard — TypeScript types are erased at runtime, so they cannot
 * protect us from a malformed/old backend payload.
 *
 * Guards against exactly the crash we hit:
 *   Object.entries(undefined)  <- analysis was a string / missing scoreBreakdown
 */
export function isResumeAnalysis(value: unknown): value is ResumeAnalysis {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    const v = value as Record<string, unknown>;

    if (typeof v.overallScore !== "number") return false;
    if (typeof v.verdict !== "string") return false;

    const bd = v.scoreBreakdown as Record<string, unknown> | null | undefined;
    if (typeof bd !== "object" || bd === null || Array.isArray(bd)) return false;
    for (const key of ["atsCompatibility", "keywords", "impact", "formatting", "clarity"]) {
        if (typeof bd[key] !== "number") return false;
    }

    const isStringArray = (a: unknown): a is string[] =>
        Array.isArray(a) && a.every((item) => typeof item === "string");

    if (!isStringArray(v.resumeStrengths)) return false;
    if (!isStringArray(v.issues)) return false;
    if (!isStringArray(v.missingInformation)) return false;
    if (!isStringArray(v.companySuggestions)) return false;

    const sugg = v.improvementSuggestions;
    if (!Array.isArray(sugg)) return false;
    for (const s of sugg) {
        if (typeof s !== "object" || s === null) return false;
        const o = s as Record<string, unknown>;
        if (typeof o.rank !== "number") return false;
        if (typeof o.title !== "string") return false;
        if (typeof o.description !== "string") return false;
    }

    return true;
}
