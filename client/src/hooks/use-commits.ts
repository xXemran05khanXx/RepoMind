import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Commit } from "@shared/schema";

interface UseCommitsOptions {
  repositoryId: string | null;
}

export function useCommits({ repositoryId }: UseCommitsOptions) {
  const queryClient = useQueryClient();

  const commitsQuery = useQuery<{ commits: Commit[] }>({
    queryKey: ["/api/repositories", repositoryId, "commits"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/repositories/${repositoryId}/commits`);
      return res.json();
    },
    enabled: !!repositoryId,
    staleTime: 60_000,
  });

  const summarizeMutation = useMutation({
    mutationFn: async (commitId: string) => {
      const res = await apiRequest("POST", `/api/commits/${commitId}/summary`);
      return res.json() as Promise<{ commit: Commit; cached: boolean }>;
    },
    onSuccess: (data) => {
      // Update cache with new commit summary
      queryClient.setQueryData<{ commits: Commit[] }>(["/api/repositories", repositoryId, "commits"], (old) => {
        if (!old) return old;
        return {
          commits: old.commits.map(c => c.id === data.commit.id ? data.commit : c)
        };
      });
    }
  });

  return {
    commits: commitsQuery.data?.commits || [],
    isLoading: commitsQuery.isLoading,
    refetch: commitsQuery.refetch,
    summarize: summarizeMutation.mutate,
    summarizing: summarizeMutation.isPending,
  };
}
