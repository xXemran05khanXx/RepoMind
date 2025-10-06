import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GitHubAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    
    try {
      // Redirect to GitHub OAuth
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "your_github_client_id";
      const redirectUri = `${window.location.origin}/api/auth/github/callback`;
      const scope = "repo,user:email";
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error("GitHub auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGitHubAuth}
        disabled={isLoading}
        className="w-full"
        size="lg"
        data-testid="button-github-auth"
      >
        <Github className="mr-2 h-5 w-5" />
        {isLoading ? "Connecting..." : "Continue with GitHub"}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        By connecting your GitHub account, you agree to our Terms of Service and Privacy Policy.
        We only access the repositories you explicitly connect.
      </p>
    </div>
  );
}
