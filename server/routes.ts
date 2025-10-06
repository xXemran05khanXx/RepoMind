/// <reference types="node" />
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GitHubService } from "./services/github";
import { aiProvider } from "./services/ai";
import { vectorStore } from "./services/vectorstore";
import { requireAuth } from "./middleware/auth";
import type { Request, Response } from 'express';
import { insertUserSchema, insertRepositorySchema, insertQuerySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub OAuth callback
  app.get("/api/auth/github/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: "Authorization code required" });
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return res.status(400).json({ error: tokenData.error_description });
      }

      const githubService = new GitHubService(tokenData.access_token);
      const githubUser = await githubService.getUser();

      // Check if user exists
      let user = await storage.getUserByGithubId(githubUser.id.toString());
      
      if (!user) {
        // Create new user
        const userData = insertUserSchema.parse({
          githubId: githubUser.id.toString(),
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
          accessToken: tokenData.access_token,
        });
        
        user = await storage.createUser(userData);
      } else {
        // Update access token
        user = await storage.updateUser(user.id, {
          accessToken: tokenData.access_token,
        });
      }

      // Store user session
      req.session.userId = user.id;
      
      res.json({ user, success: true });
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err: unknown) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Get repositories
  app.get("/api/repositories", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const repositories = await storage.getRepositories(userId);
      res.json({ repositories });
    } catch (error) {
      console.error("Get repositories error:", error);
      res.status(500).json({ error: "Failed to get repositories" });
    }
  });

  // Connect repository
  app.post("/api/repositories", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "Repository URL required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check free tier limits
      if (user.plan === "free") {
        const existingRepos = await storage.getRepositories(userId);
        if (existingRepos.length >= 3) {
          return res.status(403).json({ error: "Free tier limited to 3 repositories" });
        }
      }

      const repoInfo = GitHubService.parseRepositoryUrl(url);
      if (!repoInfo) {
        return res.status(400).json({ error: "Invalid GitHub repository URL" });
      }

      const githubService = new GitHubService(user.accessToken);
      const githubRepo = await githubService.getRepository(repoInfo.owner, repoInfo.repo);

      const repositoryData = insertRepositorySchema.parse({
        userId,
        githubId: githubRepo.id.toString(),
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        description: githubRepo.description,
        language: githubRepo.language,
        isPrivate: githubRepo.private,
        url: githubRepo.html_url,
        status: "processing",
      });

      const repository = await storage.createRepository(repositoryData);

      // Start processing repository in background
      processRepositoryAsync(repository.id, user.accessToken, repoInfo.owner, repoInfo.repo);

      res.json({ repository });
    } catch (error) {
      console.error("Connect repository error:", error);
      res.status(500).json({ error: "Failed to connect repository" });
    }
  });

  // Get repository details
  app.get("/api/repositories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const files = await storage.getRepositoryFiles(id);
      const commits = await storage.getRepositoryCommits(id);

      res.json({ repository, files, commits });
    } catch (error) {
      console.error("Get repository error:", error);
      res.status(500).json({ error: "Failed to get repository" });
    }
  });

  // Delete repository
  app.delete("/api/repositories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }

      await storage.deleteRepository(id);
      vectorStore.clearRepository(id);

      res.json({ success: true });
    } catch (error) {
      console.error("Delete repository error:", error);
      res.status(500).json({ error: "Failed to delete repository" });
    }
  });

  // Ask question about repository
  app.post("/api/repositories/:id/query", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check query limits for free tier
      if (user.plan === "free" && user.queryCount >= 100) {
        return res.status(403).json({ error: "Monthly query limit reached. Upgrade to Pro for unlimited queries." });
      }

      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }

      if (repository.status !== "ready") {
        return res.status(400).json({ error: "Repository is still being processed" });
      }

      // Get relevant context using vector search
      const relevantFiles = await vectorStore.getRelevantContext(question, id);
      
      // Generate AI response
      const response = await aiProvider.answer(
        question,
        relevantFiles,
        `Repository: ${repository.fullName} (${repository.language})`
      );

      // Save query
      const queryData = insertQuerySchema.parse({
        userId,
        repositoryId: id,
        question,
        answer: response.answer,
        context: { sources: response.sources, confidence: response.confidence },
      });

      const query = await storage.createQuery(queryData);
      await storage.incrementQueryCount(userId);

      res.json({ query, response });
    } catch (error) {
      console.error("Query repository error:", error);
      res.status(500).json({ error: "Failed to process query" });
    }
  });

  // Get queries for repository
  app.get("/api/repositories/:id/queries", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const queries = await storage.getQueries(userId, id);
      res.json({ queries });
    } catch (error) {
      console.error("Get queries error:", error);
      res.status(500).json({ error: "Failed to get queries" });
    }
  });

  // List commits for a repository (lightweight list without re-processing)
  app.get("/api/repositories/:id/commits", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { id } = req.params;
      const repository = await storage.getRepository(id);
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }
      const commits = await storage.getRepositoryCommits(id);
      res.json({ commits });
    } catch (error) {
      console.error("Get commits error:", error);
      res.status(500).json({ error: "Failed to get commits" });
    }
  });

  // Get / refresh a commit AI summary (id is commit record id, not SHA)
  app.post("/api/commits/:id/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { id } = req.params;
      // We need to ensure commit belongs to a repository owned by user
      // Simpler: fetch commit, then repository
  const repoCommit = await storage.getCommit(id);
      if (!repoCommit) {
        return res.status(404).json({ error: "Commit not found" });
      }
      const repository = await storage.getRepository(repoCommit.repositoryId);
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }
      // If already has aiSummary and client did not request refresh, return cached
      const force = req.query.force === 'true';
      if (repoCommit.aiSummary && !force) {
        return res.json({ commit: repoCommit, cached: true });
      }
      const aiSummary = await aiProvider.summarizeCommit({
        message: repoCommit.message,
        additions: repoCommit.additions || 0,
        deletions: repoCommit.deletions || 0,
      });
      const updated = await storage.updateCommit(repoCommit.id, { aiSummary: aiSummary.summary });
      res.json({ commit: updated, cached: false });
    } catch (error) {
      console.error("Commit summary error:", error);
      res.status(500).json({ error: "Failed to summarize commit" });
    }
  });

  // Get all user queries
  app.get("/api/queries", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const queries = await storage.getQueries(userId);
      res.json({ queries });
    } catch (error) {
      console.error("Get all queries error:", error);
      res.status(500).json({ error: "Failed to get queries" });
    }
  });

  // Streaming query endpoint (SSE prototype)
  app.get("/api/repositories/:id/query/stream", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    const { id } = req.params;
    const question = req.query.q as string | undefined;
    if (!question) {
      return res.status(400).json({ error: "Question (q) required" });
    }
    try {
      const repository = await storage.getRepository(id);
      if (!repository || repository.userId !== userId) {
        return res.status(404).json({ error: "Repository not found" });
      }
      if (repository.status !== "ready") {
        return res.status(400).json({ error: "Repository is still being processed" });
      }
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      // Fetch relevant context
      const relevantFiles = await vectorStore.getRelevantContext(question, id);
      // Get full answer once (simulate tokenization for now)
      const full = await aiProvider.answer(question, relevantFiles, `Repository: ${repository.fullName}`);
      const answer: string = full.answer || "";
      const tokens = answer.split(/(\s+)/); // keep whitespace tokens
      for (let i = 0; i < tokens.length; i++) {
        const chunk = tokens[i];
        res.write(`event: token\n`);
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        await new Promise(r => setTimeout(r, 15));
      }
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({ sources: full.sources, confidence: full.confidence })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Streaming query error:", error);
      try {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
        res.end();
      } catch {}
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background repository processing
async function processRepositoryAsync(
  repositoryId: string,
  accessToken: string,
  owner: string,
  repo: string
): Promise<void> {
  try {
    const githubService = new GitHubService(accessToken);
    
    // Update status
    await storage.updateRepository(repositoryId, { status: "processing" });
    
    // Get repository files
    const files = await githubService.getRepositoryFiles(owner, repo);
    
    // Clear existing files
    await storage.deleteRepositoryFiles(repositoryId);
    vectorStore.clearRepository(repositoryId);
    
    // Process files
    let processedFiles = 0;
    for (const file of files) {
      try {
        // Store file
        await storage.createRepositoryFile({
          repositoryId,
          path: file.path,
          content: file.content,
          language: file.language ?? null,
          size: file.size,
          embedding: null,
        });
        
        // Add to vector store
        await vectorStore.addDocument(
          `${repositoryId}_${file.path}`,
          file.content,
          { path: file.path, language: file.language }
        );
        
        processedFiles++;
      } catch (error) {
        console.error(`Failed to process file ${file.path}:`, error);
      }
    }
    
    // Get and process commits
    const commits = await githubService.getCommits(owner, repo, 1, 20);
    
    for (const commit of commits) {
      try {
        const aiSummary = await aiProvider.summarizeCommit({
          message: commit.commit.message,
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0,
        });
        
        await storage.createCommit({
          repositoryId,
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          authorEmail: commit.commit.author.email,
          date: new Date(commit.commit.author.date),
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0,
          aiSummary: aiSummary.summary,
        });
      } catch (error) {
        console.error(`Failed to process commit ${commit.sha}:`, error);
      }
    }
    
    // Generate repository analysis
  const analysis = await aiProvider.analyzeRepository(files);
    
    // Update repository status
    await storage.updateRepository(repositoryId, {
      status: "ready",
      fileCount: processedFiles,
      lastAnalyzed: new Date(),
    });
    
    console.log(`Repository ${repositoryId} processed successfully`);
  } catch (error) {
    console.error(`Failed to process repository ${repositoryId}:`, error);
    await storage.updateRepository(repositoryId, { status: "error" });
  }
}
