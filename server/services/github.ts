import { Octokit } from "@octokit/rest";

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  html_url: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  size: number;
  language?: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  stats?: {
    additions: number;
    deletions: number;
  };
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  }

  async getRepositoryFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    const files: GitHubFile[] = [];
    
    const getTree = async (sha?: string, path = "") => {
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: sha || "HEAD",
        recursive: "true",
      });

      for (const item of data.tree) {
        if (item.type === "blob" && item.path) {
          // Skip binary files and large files
          if (item.size && item.size > 100000) continue;
          
          // Only process text files
          const isTextFile = this.isTextFile(item.path);
          if (!isTextFile) continue;

          try {
            const { data: fileData } = await this.octokit.rest.repos.getContent({
              owner,
              repo,
              path: item.path,
            });

            if ("content" in fileData && fileData.content) {
              const content = Buffer.from(fileData.content, "base64").toString("utf-8");
              files.push({
                path: item.path,
                content,
                size: item.size || 0,
                language: this.getLanguageFromPath(item.path),
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch file ${item.path}:`, error);
          }
        }
      }
    };

    await getTree();
    return files;
  }

  async getCommits(owner: string, repo: string, page = 1, perPage = 50): Promise<GitHubCommit[]> {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      page,
      per_page: perPage,
    });

    // Get commit stats for each commit
    const commitsWithStats = await Promise.all(
      data.map(async (commit) => {
        try {
          const { data: commitData } = await this.octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });
          return {
            ...commit,
            stats: commitData.stats,
          };
        } catch (error) {
          return commit;
        }
      })
    );

    return commitsWithStats;
  }

  private isTextFile(path: string): boolean {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.rb', '.php', '.java', '.c', '.cpp', '.cs', '.go', '.rs',
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.json', '.xml', '.yaml', '.yml', '.toml', '.ini',
      '.md', '.txt', '.rst', '.tex',
      '.sh', '.bat', '.ps1',
      '.sql', '.graphql', '.gql',
      '.dockerfile', '.dockerignore', '.gitignore', '.gitattributes',
      '.env', '.env.example', '.env.local',
      '.config', '.conf', '.cfg',
    ];

    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    const filename = path.toLowerCase().split('/').pop() || '';
    
    return textExtensions.includes(extension) || 
           filename === 'dockerfile' ||
           filename === 'makefile' ||
           filename === 'readme' ||
           filename.startsWith('.env');
  }

  private getLanguageFromPath(path: string): string | undefined {
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.vue': 'vue',
      '.svelte': 'svelte',
      '.py': 'python',
      '.rb': 'ruby',
      '.php': 'php',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.html': 'html',
      '.htm': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.toml': 'toml',
      '.md': 'markdown',
      '.txt': 'text',
      '.sh': 'bash',
      '.sql': 'sql',
      '.graphql': 'graphql',
      '.gql': 'graphql',
    };

    return languageMap[extension];
  }

  static parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
    const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/;
    const match = url.match(githubUrlRegex);
    
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
    
    return null;
  }
}
