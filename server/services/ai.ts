import { openaiService } from './openai';

export interface EmbeddingProvider { embed(text: string): Promise<number[]>; }
export interface RepoAnalysisProvider { analyzeRepository(files: Array<{ path: string; content: string; language?: string }>): Promise<any>; }
export interface CommitSummaryProvider { summarizeCommit(commit: { message: string; additions: number; deletions: number }): Promise<any>; }
export interface QAProvider { answer(question: string, relevantFiles: Array<{ path: string; content: string }>, repositoryContext: string): Promise<any>; }

export interface AIProvider extends EmbeddingProvider, RepoAnalysisProvider, CommitSummaryProvider, QAProvider {}

class OpenAIWrapper implements AIProvider {
  embed(text: string) { return openaiService.generateEmbedding(text); }
  analyzeRepository(files: Array<{ path: string; content: string; language?: string }>) { return openaiService.analyzeRepository(files); }
  summarizeCommit(commit: { message: string; additions: number; deletions: number }) { return openaiService.summarizeCommit(commit); }
  answer(question: string, relevantFiles: Array<{ path: string; content: string }>, repositoryContext: string) { return openaiService.answerCodeQuestion(question, relevantFiles, repositoryContext); }
}

// Future: gemini implementation decided via env AI_PROVIDER

export const aiProvider: AIProvider = new OpenAIWrapper();
