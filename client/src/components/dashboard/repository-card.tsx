import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  MessageSquare, 
  GitCommit, 
  FileText,
  Github,
  Loader2
} from "lucide-react";
import type { Repository } from "@shared/schema";

interface RepositoryCardProps {
  repository: Repository;
  onAnalyze: () => void;
  onAskQuestion: () => void;
}

export default function RepositoryCard({ 
  repository, 
  onAnalyze, 
  onAskQuestion 
}: RepositoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/10 text-green-400";
      case "processing":
        return "bg-yellow-500/10 text-yellow-400";
      case "error":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Active";
      case "processing":
        return "Processing";
      case "error":
        return "Error";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getLanguageIcon = (language: string | null) => {
    // You can add more specific icons based on language
    return <Github className="h-5 w-5" />;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md" data-testid={`repo-card-${repository.name}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getLanguageIcon(repository.language)}
            <div>
              <h3 className="font-semibold text-lg" data-testid="repo-name">
                {repository.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="repo-description">
                {repository.description || "No description available"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(repository.status)} data-testid="repo-status">
              {getStatusText(repository.status)}
            </Badge>
            {repository.status === "ready" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onAnalyze}
                data-testid="button-analyze-repo"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
          <div data-testid="repo-file-count">
            <p className="text-muted-foreground">Files</p>
            <p className="font-medium">{repository.fileCount || 0}</p>
          </div>
          <div data-testid="repo-language">
            <p className="text-muted-foreground">Language</p>
            <p className="font-medium">{repository.language || "Unknown"}</p>
          </div>
          <div data-testid="repo-last-updated">
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {repository.lastAnalyzed 
                ? new Date(repository.lastAnalyzed).toLocaleDateString()
                : "Never"
              }
            </p>
          </div>
          <div data-testid="repo-privacy">
            <p className="text-muted-foreground">Visibility</p>
            <p className="font-medium">{repository.isPrivate ? "Private" : "Public"}</p>
          </div>
        </div>
        
        {repository.status === "processing" && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Processing Progress</span>
              <span>Analyzing files and generating embeddings...</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}
        
        <div className="flex space-x-3">
          {repository.status === "ready" ? (
            <>
              <Button 
                size="sm" 
                onClick={onAskQuestion}
                data-testid="button-ask-ai"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onAnalyze}
                data-testid="button-view-analysis"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Analysis
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(repository.url, '_blank')}
                data-testid="button-view-github"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </>
          ) : repository.status === "processing" ? (
            <Button size="sm" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : repository.status === "error" ? (
            <Button size="sm" variant="destructive" disabled>
              Processing Failed
            </Button>
          ) : (
            <Button size="sm" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Queued for Processing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
