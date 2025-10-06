import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Folder, 
  FileText, 
  GitCommit,
  Lightbulb,
  AlertTriangle,
  Github,
  FileCode,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import type { Repository, Commit, RepositoryFile } from "@shared/schema";

interface RepoAnalysisModalProps {
  repositoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RepoAnalysisModal({ 
  repositoryId, 
  open, 
  onOpenChange 
}: RepoAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch repository details
  const { data: repoData, isLoading } = useQuery({
    queryKey: ["/api/repositories", repositoryId],
    enabled: open && !!repositoryId,
  });

  const repository = repoData?.repository as Repository;
  const files = (repoData?.files || []) as RepositoryFile[];
  const commits = (repoData?.commits || []) as Commit[];

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0" data-testid="repo-analysis-modal">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : repository ? (
          <>
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Github className="h-6 w-6 text-primary" />
                <DialogTitle className="text-xl" data-testid="repo-analysis-title">
                  {repository.name}
                </DialogTitle>
                <Badge variant="secondary">{repository.language}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                data-testid="button-close-analysis"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            <div className="flex h-[600px]">
              {/* File Tree Sidebar */}
              <div className="w-1/3 border-r border-border p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Folder className="mr-2 h-4 w-4" />
                  File Structure
                </h3>
                <ScrollArea className="h-[520px]">
                  <div className="space-y-1 text-sm font-mono" data-testid="file-tree">
                    {files.length > 0 ? (
                      <FileTree files={files} />
                    ) : (
                      <p className="text-muted-foreground">No files available</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview" data-testid="tab-overview">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="commits" data-testid="tab-commits">
                      Commits
                    </TabsTrigger>
                    <TabsTrigger value="insights" data-testid="tab-insights">
                      AI Insights
                    </TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="h-[460px]">
                    <TabsContent value="overview" className="space-y-6" data-testid="overview-content">
                      <div>
                        <h4 className="font-semibold mb-3">Repository Summary</h4>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm leading-relaxed">
                              {repository.description || 
                                `This ${repository.language || 'code'} repository contains ${repository.fileCount || 0} files and provides various functionality for software development.`
                              }
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card data-testid="overview-language">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Primary Language</p>
                            <p className="font-medium">{repository.language || "Unknown"}</p>
                          </CardContent>
                        </Card>
                        <Card data-testid="overview-files">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Files</p>
                            <p className="font-medium">{repository.fileCount || 0}</p>
                          </CardContent>
                        </Card>
                        <Card data-testid="overview-visibility">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Visibility</p>
                            <p className="font-medium">{repository.isPrivate ? "Private" : "Public"}</p>
                          </CardContent>
                        </Card>
                        <Card data-testid="overview-status">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium capitalize">{repository.status}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="commits" className="space-y-4" data-testid="commits-content">
                      {commits.length > 0 ? (
                        commits.map((commit) => (
                          <Card key={commit.id} data-testid={`commit-${commit.sha}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-mono text-primary">
                                    {commit.sha.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium mb-1" data-testid="commit-message">
                                    {commit.message}
                                  </p>
                                  {commit.aiSummary && (
                                    <Card className="bg-muted">
                                      <CardContent className="p-3">
                                        <p className="text-muted-foreground mb-2 text-xs">AI Summary:</p>
                                        <p className="text-sm" data-testid="commit-ai-summary">
                                          {commit.aiSummary}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  )}
                                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <User className="mr-1 h-3 w-3" />
                                      {commit.author}
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {new Date(commit.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-green-400">
                                      +{commit.additions} -{commit.deletions}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card className="p-12 text-center">
                          <GitCommit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No commits available</h3>
                          <p className="text-muted-foreground">
                            Commit data is still being processed or unavailable.
                          </p>
                        </Card>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="insights" className="space-y-6" data-testid="insights-content">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Lightbulb className="text-yellow-400 mr-2 h-4 w-4" />
                            Key Insights
                          </h4>
                          <ul className="space-y-2 text-sm">
                            <li>• Repository uses modern {repository.language || 'programming'} patterns and conventions</li>
                            <li>• Well-structured file organization with clear separation of concerns</li>
                            <li>• {repository.fileCount || 0} files analyzed for comprehensive understanding</li>
                            <li>• Ready for AI-powered code analysis and question answering</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <AlertTriangle className="text-yellow-400 mr-2 h-4 w-4" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2 text-sm">
                            <li>• Use the AI assistant to understand complex code sections</li>
                            <li>• Ask specific questions about implementation details</li>
                            <li>• Review commit summaries to track project evolution</li>
                            <li>• Consider upgrading to Pro for unlimited analysis</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <p className="text-muted-foreground">Repository not found or failed to load.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// File Tree Component
interface FileTreeProps {
  files: RepositoryFile[];
}

function FileTree({ files }: FileTreeProps) {
  // Group files by directory
  const fileTree = files.reduce((acc, file) => {
    const parts = file.path.split('/');
    let current = acc;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const fileName = parts[parts.length - 1];
    current[fileName] = file;
    
    return acc;
  }, {} as any);

  const renderTree = (tree: any, level = 0): React.ReactNode[] => {
    return Object.entries(tree).map(([name, value]) => {
      const isFile = value && typeof value === 'object' && 'path' in value;
      
      return (
        <div key={name} style={{ marginLeft: `${level * 16}px` }}>
          <div className="flex items-center space-x-2 py-1 px-2 rounded hover:bg-accent cursor-pointer">
            {isFile ? (
              <>
                <FileText className="h-3 w-3 text-blue-400" />
                <span className="text-xs" data-testid={`file-${name}`}>{name}</span>
              </>
            ) : (
              <>
                <Folder className="h-3 w-3 text-yellow-400" />
                <span className="text-xs" data-testid={`folder-${name}`}>{name}/</span>
              </>
            )}
          </div>
          {!isFile && renderTree(value, level + 1)}
        </div>
      );
    });
  };

  return <div>{renderTree(fileTree)}</div>;
}
