import "dotenv/config";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_KEY
});

export async function analyseResume(resumeText) {

    const completion = await groq.chat.completions.create({

        model: "openai/gpt-oss-20b",

        // Force Groq to return JSON matching our schema
        response_format: {
            type: "json_schema",

            json_schema: {
                name: "resume_analysis",

                strict: true,

                schema: {
                    type: "object",

                    properties: {

                        overallScore: {
                            type: "number"
                        },

                        scoreBreakdown: {
                            type: "object",

                            properties: {

                                atsCompatibility: {
                                    type: "number"
                                },

                                keywords: {
                                    type: "number"
                                },

                                impact: {
                                    type: "number"
                                },

                                formatting: {
                                    type: "number"
                                },

                                clarity: {
                                    type: "number"
                                }

                            },

                            required: [
                                "atsCompatibility",
                                "keywords",
                                "impact",
                                "formatting",
                                "clarity"
                            ],

                            additionalProperties: false
                        },

                        resumeStrengths: {
                            type: "array",

                            items: {
                                type: "string"
                            }
                        },

                        issues: {
                            type: "array",

                            items: {
                                type: "string"
                            }
                        },

                        missingInformation: {
                            type: "array",

                            items: {
                                type: "string"
                            }
                        },

                        improvementSuggestions: {
                            type: "array",

                            items: {
                                type: "object",

                                properties: {

                                    rank: {
                                        type: "number"
                                    },

                                    title: {
                                        type: "string"
                                    },

                                    description: {
                                        type: "string"
                                    }

                                },

                                required: [
                                    "rank",
                                    "title",
                                    "description"
                                ],

                                additionalProperties: false
                            }
                        },

                        verdict: {
                            type: "string"
                        },

                        companySuggestions: {
                            type: "array",

                            items: {
                                type: "string"
                            }
                        }

                    },

                    required: [
                        "overallScore",
                        "scoreBreakdown",
                        "resumeStrengths",
                        "issues",
                        "missingInformation",
                        "improvementSuggestions",
                        "verdict",
                        "companySuggestions"
                    ],

                    additionalProperties: false
                }
            }
        },

        messages: [

            {
                role: "system",

                content: `
You are an expert resume analyzer.

Analyze the provided resume carefully.

Return a complete resume analysis following the provided JSON schema.

Scoring:

- overallScore must be between 0 and 100.
- atsCompatibility must be between 0 and 20.
- keywords must be between 0 and 20.
- impact must be between 0 and 20.
- formatting must be between 0 and 20.
- clarity must be between 0 and 20.

Resume strengths:

Identify genuine strengths that are actually present in the resume.
Do not invent strengths.

Issues:

Identify specific weaknesses or problems in the resume.

Missing information:

Identify useful information that is genuinely missing.

Examples:
- quantified achievements
- GitHub
- LinkedIn
- portfolio
- certifications
- measurable results
- professional summary

Only mention something if it is actually missing.

Improvement suggestions:

Return exactly 3 suggestions.

Rank them:

1 = highest priority
2 = second priority
3 = third priority

Each suggestion must contain:
- rank
- title
- description

The suggestions must be practical and actionable.

Verdict:

Give a short overall assessment of the resume.

Company suggestions:

Suggest relevant companies based on the candidate's actual skills, experience, education, and career direction.

Do not invent candidate information.

Use only information supported by the resume.
`
            },

            {
                role: "user",

                content: resumeText
            }

        ],

        temperature: 0.3,

        max_completion_tokens: 3000,

        top_p: 1,

        stream: false,

        reasoning_effort: "medium"
    });


    // Get AI response
    const choice = completion.choices?.[0];

    const content = choice?.message?.content;


    // Make sure AI returned something
    if (
        typeof content !== "string" ||
        !content.trim()
    ) {

        console.error("Groq returned no content", {

            finishReason: choice?.finish_reason,

            messageKeys: Object.keys(
                choice?.message ?? {}
            ),

        });

        throw new Error(
            "Groq returned an empty response"
        );
    }


    // Convert JSON string → JavaScript object
    const analysis = JSON.parse(content);


    // Check the structured result
    console.log(
        "AI Analysis:",
        analysis
    );

    // Send structured object back
    return analysis;
}