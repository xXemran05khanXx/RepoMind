import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Home, 
  Github, 
  MessageSquare, 
  BarChart3, 
  Plus,
  FolderGit2,
  Server,
  Smartphone
} from "lucide-react";
import type { User, Repository } from "@shared/schema";

interface SidebarProps {
  user: User | null;
  repositories: Repository[];
  selectedRepository: string | null;
  onSelectRepository: (id: string) => void;
  onConnectRepo: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Sidebar({
  user,
  repositories,
  selectedRepository,
  onSelectRepository,
  onConnectRepo,
  activeSection,
  onSectionChange,
  open,
}: SidebarProps) {
  const getRepositoryIcon = (language: string | null) => {
    switch (language?.toLowerCase()) {
      case "javascript":
      case "typescript":
        return <FolderGit2 className="text-blue-400 h-4 w-4" />;
      case "python":
        return <Server className="text-green-400 h-4 w-4" />;
      case "java":
      case "kotlin":
        return <Smartphone className="text-purple-400 h-4 w-4" />;
      default:
        return <FolderGit2 className="text-gray-400 h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 z-30",
      !open && "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <Brain className="text-primary h-6 w-6" />
          <span className="text-lg font-bold">RepoMind</span>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-3 mb-6 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user.username}</div>
              <div className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {user.plan === "free" ? "Free Plan" : "Pro Plan"}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="space-y-1 mb-8">
          <Button
            variant={activeSection === "overview" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("overview")}
            data-testid="nav-overview"
          >
            <Home className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeSection === "repositories" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("repositories")}
            data-testid="nav-repositories"
          >
            <Github className="mr-2 h-4 w-4" />
            Repositories
          </Button>
          <Button
            variant={activeSection === "queries" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("queries")}
            data-testid="nav-queries"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Queries
          </Button>
          <Button
            variant={activeSection === "analytics" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("analytics")}
            data-testid="nav-analytics"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </nav>
        
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Projects
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onConnectRepo}
              data-testid="button-add-project"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {repositories.map((repo) => (
              <Button
                key={repo.id}
                variant={selectedRepository === repo.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm h-8"
                onClick={() => onSelectRepository(repo.id)}
                data-testid={`project-${repo.name}`}
              >
                {getRepositoryIcon(repo.language)}
                <span className="ml-2 truncate">{repo.name}</span>
                {repo.status === "processing" && (
                  <div className="ml-auto animate-spin rounded-full h-3 w-3 border-b border-primary" />
                )}
              </Button>
            ))}
            
            {repositories.length === 0 && (
              <p className="text-xs text-muted-foreground p-2">
                No repositories connected yet.
              </p>
            )}
          </div>
        </div>
        
        {/* Usage Stats */}
        {user && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Monthly Usage</div>
            <div className="flex justify-between text-sm">
              <span>Queries</span>
              <span>{user.queryCount}/{user.plan === "free" ? "100" : "∞"}</span>
            </div>
            {user.plan === "free" && (
              <>
                <div className="w-full bg-background rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (user.queryCount / 100) * 100)}%` }}
                  />
                </div>
                {user.queryCount >= 80 && (
                  <p className="text-xs text-yellow-500 mt-2">
                    {100 - user.queryCount} queries remaining
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
