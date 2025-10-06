import { openaiService } from './openai';

// Placeholder Gemini service interface (future real implementation)
interface GeminiServiceLike {
  generateEmbedding(text: string): Promise<number[]>;
  analyzeRepository(files: Array<{ path: string; content: string; language?: string }>): Promise<any>;
  summarizeCommit(commit: { message: string; additions: number; deletions: number }): Promise<any>;
  answerCodeQuestion(question: string, relevantFiles: Array<{ path: string; content: string }>, repositoryContext: string): Promise<any>;
}

class GeminiStub implements GeminiServiceLike {
  async generateEmbedding(text: string) { return openaiService.generateEmbedding(text); }
  async analyzeRepository(files: Array<{ path: string; content: string; language?: string }>) {
    return {
      summary: 'Gemini (stub) repository analysis not yet implemented.',
      insights: [],
      recommendations: [],
      primaryLanguage: 'unknown'
    };
  }
  async summarizeCommit(commit: { message: string; additions: number; deletions: number }) {
    return { summary: 'Gemini (stub) commit summary not implemented.', impact: 'n/a', files_affected: [] };
  }
  async answerCodeQuestion(question: string, relevantFiles: Array<{ path: string; content: string }>, repositoryContext: string) {
    return { answer: 'Gemini (stub) answer placeholder.', confidence: 0.0, sources: relevantFiles.slice(0,3).map(f=>f.path) };
  }
}

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

class GeminiWrapper implements AIProvider {
  private gemini: GeminiServiceLike;
  constructor() { this.gemini = new GeminiStub(); }
  embed(text: string) { return this.gemini.generateEmbedding(text); }
  analyzeRepository(files: Array<{ path: string; content: string; language?: string }>) { return this.gemini.analyzeRepository(files); }
  summarizeCommit(commit: { message: string; additions: number; deletions: number }) { return this.gemini.summarizeCommit(commit); }
  answer(question: string, relevantFiles: Array<{ path: string; content: string }>, repositoryContext: string) { return this.gemini.answerCodeQuestion(question, relevantFiles, repositoryContext); }
}

const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
let selected: AIProvider;
switch (provider) {
  case 'gemini':
    selected = new GeminiWrapper();
    break;
  case 'openai':
  default:
    selected = new OpenAIWrapper();
}

export const aiProvider: AIProvider = selected;
