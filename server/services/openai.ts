import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

export interface CodeAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  primaryLanguage: string;
  framework?: string;
  buildTool?: string;
  dependencies?: number;
}

export interface CommitSummary {
  summary: string;
  impact: string;
  files_affected: string[];
}

export interface QueryResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export class OpenAIService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async analyzeRepository(files: Array<{ path: string; content: string; language?: string }>): Promise<CodeAnalysisResult> {
    try {
      const fileStructure = files.map(f => f.path).join('\n');
      const sampleFiles = files.slice(0, 10).map(f => `${f.path}:\n${f.content.substring(0, 500)}`).join('\n\n');

      const prompt = `Analyze this codebase and provide insights in JSON format:

File structure:
${fileStructure}

Sample file contents:
${sampleFiles}

Provide analysis in this JSON format:
{
  "summary": "Brief overview of the project",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "primaryLanguage": "Main programming language",
  "framework": "Primary framework if applicable",
  "buildTool": "Build tool if identifiable",
  "dependencies": estimated_dependency_count
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a senior software architect analyzing codebases. Provide accurate, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as CodeAnalysisResult;
    } catch (error) {
      console.error("Failed to analyze repository:", error);
      throw new Error("Failed to analyze repository");
    }
  }

  async summarizeCommit(commit: { message: string; additions: number; deletions: number }): Promise<CommitSummary> {
    try {
      const prompt = `Analyze this commit and provide a summary in JSON format:

Commit message: ${commit.message}
Lines added: ${commit.additions}
Lines deleted: ${commit.deletions}

Provide analysis in this JSON format:
{
  "summary": "Clear explanation of what this commit does",
  "impact": "High/Medium/Low - assessment of change impact",
  "files_affected": ["category of files likely affected"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a code reviewer analyzing git commits. Provide concise, accurate summaries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as CommitSummary;
    } catch (error) {
      console.error("Failed to summarize commit:", error);
      throw new Error("Failed to summarize commit");
    }
  }

  async answerCodeQuestion(
    question: string, 
    relevantFiles: Array<{ path: string; content: string }>,
    repositoryContext: string
  ): Promise<QueryResponse> {
    try {
      const context = relevantFiles.map(f => `File: ${f.path}\n${f.content}`).join('\n\n');
      
      const prompt = `Answer this question about the codebase using the provided context.

Repository context: ${repositoryContext}

Question: ${question}

Relevant files:
${context}

Provide your answer in JSON format:
{
  "answer": "Detailed answer to the question",
  "confidence": confidence_score_0_to_1,
  "sources": ["file1.js", "file2.ts", "etc"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert software engineer helping developers understand their codebase. Provide accurate, helpful answers based on the provided code context."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as QueryResponse;
    } catch (error) {
      console.error("Failed to answer question:", error);
      throw new Error("Failed to answer question");
    }
  }
}

export const openaiService = new OpenAIService();
