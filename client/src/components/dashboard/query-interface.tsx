import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Brain, Send, FileCode, User, Loader2, MessageSquare, Link as LinkIcon } from "lucide-react";
import { CitationPanel } from "@/components/dashboard/citation-panel";
import type { Repository, Query } from "@shared/schema";

type QueryApiShape = Omit<Query, 'context'> & {
  context: {
    sources?: string[];
    confidence?: number;
    [k: string]: any;
  } | null;
};

interface QueryInterfaceProps {
  repositories: Repository[];
  selectedRepository: string | null;
  onSelectRepository: (id: string) => void;
}

export default function QueryInterface({
  repositories,
  selectedRepository,
  onSelectRepository,
}: QueryInterfaceProps) {
  const [question, setQuestion] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get queries for selected repository
  const { data: queriesData, isLoading: queriesLoading } = useQuery<{ queries: QueryApiShape[] }>({
    queryKey: selectedRepository ? ["/api/repositories", selectedRepository, "queries"] : [],
    enabled: !!selectedRepository,
  });

  const queries: QueryApiShape[] = queriesData?.queries || [];
  const [openCitations, setOpenCitations] = useState<string | null>(null);

  // Submit query mutation
  const submitQueryMutation = useMutation({
    mutationFn: async ({ repositoryId, question }: { repositoryId: string; question: string }) => {
      const response = await apiRequest("POST", `/api/repositories/${repositoryId}/query`, {
        question,
      });
      return response.json();
    },
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/repositories", selectedRepository, "queries"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Query Submitted",
        description: "Your question has been processed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuery = async () => {
    if (!question.trim() || !selectedRepository) return;

    const repository = repositories.find(r => r.id === selectedRepository);
    if (!repository) return;

    if (repository.status !== "ready") {
      toast({
        title: "Repository Not Ready",
        description: "Please wait for the repository to finish processing before asking questions.",
        variant: "destructive",
      });
      return;
    }

    submitQueryMutation.mutate({
      repositoryId: selectedRepository,
      question: question.trim(),
    });
  };

  const readyRepositories = repositories.filter(r => r.status === "ready");

  return (
    <div className="space-y-6">
      {/* Query Interface */}
      <Card data-testid="query-interface">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ask AI about your code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {readyRepositories.length > 0 ? (
            <>
              <div className="flex items-center space-x-3">
                <Select 
                  value={selectedRepository || ""} 
                  onValueChange={onSelectRepository}
                >
                  <SelectTrigger className="w-64" data-testid="select-repository">
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {readyRepositories.map((repo) => (
                      <SelectItem key={repo.id} value={repo.id}>
                        {repo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">
                  Choose a repository to query
                </span>
              </div>
              
              <div className="flex space-x-3">
                <Input
                  placeholder="Ask about your codebase... e.g., 'How does authentication work?'"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitQuery();
                    }
                  }}
                  className="flex-1"
                  disabled={!selectedRepository || submitQueryMutation.isPending}
                  data-testid="input-question"
                />
                <Button 
                  onClick={handleSubmitQuery}
                  disabled={!selectedRepository || !question.trim() || submitQueryMutation.isPending}
                  data-testid="button-submit-query"
                >
                  {submitQueryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No repositories ready</h3>
              <p className="text-muted-foreground">
                Connect and process a repository before you can ask questions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query History */}
      {selectedRepository && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Query History</h3>
          
          {queriesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-20 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : queries.length > 0 ? (
            <div className="space-y-4">
              {queries.map((query) => (
                <Card key={query.id} data-testid={`query-${query.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-primary h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2" data-testid="query-question">
                          {query.question}
                        </p>
                        {query.answer && (
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-3">
                              <Brain className="text-primary h-4 w-4" />
                              <span className="text-sm font-medium">AI Response</span>
                              {typeof query.context?.confidence === 'number' && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round((query.context.confidence || 0) * 100)}% confidence
                                </Badge>
                              )}
                              {query.context?.sources && query.context.sources.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-[11px] ml-2"
                                  onClick={() => setOpenCitations(openCitations === query.id ? null : query.id)}
                                >
                                  <LinkIcon className="h-3 w-3 mr-1" />
                                  {openCitations === query.id ? 'Hide Sources' : 'Sources'}
                                </Button>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="query-answer">
                              {query.answer}
                            </p>
                            {openCitations === query.id && (
                              <CitationPanel 
                                sources={query.context?.sources || []}
                                confidence={query.context?.confidence}
                                repositoryId={query.repositoryId}
                              />
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2" data-testid="query-timestamp">
                          {new Date(query.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No queries yet</h3>
              <p className="text-muted-foreground">
                Ask your first question about this repository to get started!
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
