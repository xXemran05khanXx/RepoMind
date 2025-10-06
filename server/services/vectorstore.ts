import { openaiService } from './openai';

export interface VectorMetadata {
  path: string;
  language?: string;
  startLine?: number;
  endLine?: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: VectorMetadata;
  embedding: number[];
}

export interface SearchResult { document: DocumentChunk; similarity: number; }

export interface IVectorStore {
  addDocument(id: string, content: string, metadata: { path: string; language?: string }): Promise<void>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  getRelevantContext(query: string, repositoryId: string): Promise<Array<{ path: string; content: string }>>;
  clearRepository(repositoryId: string): void;
}

class InMemoryVectorStore implements IVectorStore {
  private documents: Map<string, DocumentChunk> = new Map();

  async addDocument(id: string, content: string, metadata: { path: string; language?: string }): Promise<void> {
    const chunks = this.splitIntoChunks(content, 1000);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${id}_chunk_${i}`;
      const embedding = await openaiService.generateEmbedding(chunk.content);
      this.documents.set(chunkId, {
        id: chunkId,
        content: chunk.content,
        metadata: { ...metadata, startLine: chunk.startLine, endLine: chunk.endLine },
        embedding,
      });
    }
  }

  async search(query: string, limit = 5): Promise<SearchResult[]> {
    const queryEmbedding = await openaiService.generateEmbedding(query);
    const results: SearchResult[] = [];
    for (const doc of this.documents.values()) {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ document: doc, similarity });
    }
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  async getRelevantContext(query: string, _repositoryId: string): Promise<Array<{ path: string; content: string }>> {
    const searchResults = await this.search(query, 3);
    return searchResults.map(r => ({ path: r.document.metadata.path, content: r.document.content }));
  }

  clearRepository(repositoryId: string): void {
    for (const id of [...this.documents.keys()]) {
      if (id.startsWith(repositoryId)) this.documents.delete(id);
    }
  }

  private splitIntoChunks(content: string, maxLength: number) {
    const lines = content.split('\n');
    const chunks: Array<{ content: string; startLine: number; endLine: number }> = [];
    let currentChunk = '';
    let startLine = 1;
    let currentLine = 1;
    for (const line of lines) {
      const potential = currentChunk ? currentChunk + '\n' + line : line;
      if (potential.length > maxLength && currentChunk) {
        chunks.push({ content: currentChunk, startLine, endLine: currentLine - 1 });
        currentChunk = line;
        startLine = currentLine;
      } else {
        currentChunk = potential;
      }
      currentLine++;
    }
    if (currentChunk) chunks.push({ content: currentChunk, startLine, endLine: currentLine - 1 });
    return chunks;
  }

  private cosineSimilarity(a: number[], b: number[]) {
    if (a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }
}

// Export concrete instance (later can switch to Pinecone based on env)
export const vectorStore: IVectorStore = new InMemoryVectorStore();
