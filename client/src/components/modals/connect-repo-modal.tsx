import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Info, Link as LinkIcon, Loader2 } from "lucide-react";

interface ConnectRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectRepoModal({ open, onOpenChange }: ConnectRepoModalProps) {
  const [url, setUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connectRepoMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      const response = await apiRequest("POST", "/api/repositories", { url: repoUrl });
      return response.json();
    },
    onSuccess: () => {
      setUrl("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      toast({
        title: "Repository Connected",
        description: "Your repository is now being analyzed. This may take a few minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect repository. Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid GitHub repository URL.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    const githubUrlRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/;
    if (!githubUrlRegex.test(url.trim())) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository).",
        variant: "destructive",
      });
      return;
    }

    connectRepoMutation.mutate(url.trim());
  };

  const handleClose = () => {
    if (!connectRepoMutation.isPending) {
      setUrl("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="connect-repo-modal">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              type="url"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={connectRepoMutation.isPending}
              data-testid="input-repo-url"
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">Free Tier Limits</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Up to 3 repositories</li>
              <li>• 100 AI queries per month</li>
              <li>• Basic commit summaries</li>
              <li>• Repository must be accessible with your GitHub token</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit"
              disabled={connectRepoMutation.isPending}
              className="flex-1"
              data-testid="button-connect"
            >
              {connectRepoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Repository
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={connectRepoMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
