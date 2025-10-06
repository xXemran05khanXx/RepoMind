import { useState } from "react";
import { useRepositories } from "@/hooks/use-repositories";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RepositoryCard from "@/components/dashboard/repository-card";
import QueryInterface from "@/components/dashboard/query-interface";
import { CommitTimeline } from "@/components/dashboard/commit-timeline";
import { useCommits } from "@/hooks/use-commits";
import ConnectRepoModal from "@/components/modals/connect-repo-modal";
import RepoAnalysisModal from "@/components/modals/repo-analysis-modal";
import { 
  Menu, 
  Bell, 
  Settings, 
  LogOut, 
  Github, 
  Plus,
  Brain,
  FileCode,
  Clock,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Query as QueryType } from "@shared/schema";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { repositories, isLoading: reposLoading } = useRepositories();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

  const { commits, summarize, summarizing } = useCommits({ repositoryId: selectedRepository });

  // Get recent queries
  const { data: queriesData } = useQuery<{ queries: QueryType[] }>({
    queryKey: ["/api/queries"],
    enabled: !!user,
  });

  const recentQueries: QueryType[] = queriesData?.queries?.slice(0, 5) || [];

  const handleLogout = async () => {
    await logout();
  };

  const stats = {
    repositories: repositories?.length || 0,
    queries: user?.queryCount || 0,
    files: repositories?.reduce((acc, repo) => acc + (repo.fileCount || 0), 0) || 0,
    remaining: Math.max(0, 100 - (user?.queryCount || 0)),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        repositories={repositories || []}
        selectedRepository={selectedRepository}
        onSelectRepository={setSelectedRepository}
        onConnectRepo={() => setConnectModalOpen(true)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border p-4" data-testid="dashboard-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeSection === "overview" && (
            <div data-testid="section-overview">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card data-testid="stat-repositories">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Connected Repos</p>
                        <p className="text-2xl font-bold">{stats.repositories}</p>
                      </div>
                      <Github className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-queries">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">AI Queries</p>
                        <p className="text-2xl font-bold">{stats.queries}</p>
                      </div>
                      <Brain className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-files">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Files Analyzed</p>
                        <p className="text-2xl font-bold">{stats.files}</p>
                      </div>
                      <FileCode className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-remaining">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Remaining Queries</p>
                        <p className="text-2xl font-bold">{stats.remaining}</p>
                      </div>
                      <Clock className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card data-testid="recent-queries">
                  <CardHeader>
                    <CardTitle>Recent Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentQueries.length > 0 ? (
                      <div className="space-y-4">
                        {recentQueries.map((query: QueryType) => (
                          <div key={query.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                            <Brain className="text-primary mt-1 h-4 w-4" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{query.question}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(query.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No queries yet. Connect a repository and start asking questions!</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card data-testid="repository-insights">
                  <CardHeader>
                    <CardTitle>Repository Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                      alt="Code repository visualization" 
                      className="rounded-lg w-full h-32 object-cover mb-4 border border-border"
                    />
                    
                    {repositories && repositories.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Most Active Files</span>
                          <span className="text-sm text-muted-foreground">src/components/</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Last Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            {repositories[0].lastAnalyzed 
                              ? new Date(repositories[0].lastAnalyzed).toLocaleString()
                              : "Never"
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Primary Language</span>
                          <span className="text-sm text-green-400">
                            {repositories[0].language || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Connect a repository to see insights.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "repositories" && (
            <div data-testid="section-repositories">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Repositories</h2>
                <Button onClick={() => setConnectModalOpen(true)} data-testid="button-connect-repository">
                  <Github className="mr-2 h-4 w-4" />
                  Connect Repository
                </Button>
              </div>

              {reposLoading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="grid grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-3 bg-muted rounded"></div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : repositories && repositories.length > 0 ? (
                <div className="grid gap-6">
                  {repositories.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repository={repo}
                      onAnalyze={() => {
                        setSelectedRepository(repo.id);
                        setAnalysisModalOpen(true);
                      }}
                      onAskQuestion={() => {
                        setSelectedRepository(repo.id);
                        setActiveSection("queries");
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your first GitHub repository to start analyzing your code with AI.
                  </p>
                  <Button onClick={() => setConnectModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Repository
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeSection === "queries" && (
            <div data-testid="section-queries">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">AI Queries</h2>
              </div>

              {selectedRepository && (
                <CommitTimeline 
                  commits={commits} 
                  onSummarize={summarize} 
                  summarizing={summarizing} 
                />
              )}

              <QueryInterface 
                repositories={repositories || []}
                selectedRepository={selectedRepository}
                onSelectRepository={setSelectedRepository}
              />
            </div>
          )}

          {activeSection === "analytics" && (
            <div data-testid="section-analytics">
              <h2 className="text-2xl font-bold mb-6">Analytics</h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Query Patterns</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                      alt="Bar chart showing query analytics patterns" 
                      className="rounded-lg w-full h-48 object-cover border border-border"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Repository Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                      alt="Line graph showing repository activity over time" 
                      className="rounded-lg w-full h-48 object-cover border border-border"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConnectRepoModal 
        open={connectModalOpen} 
        onOpenChange={setConnectModalOpen}
      />
      
      {selectedRepository && (
        <RepoAnalysisModal
          repositoryId={selectedRepository}
          open={analysisModalOpen}
          onOpenChange={setAnalysisModalOpen}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
