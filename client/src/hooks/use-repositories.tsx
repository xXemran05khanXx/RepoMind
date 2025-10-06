import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { Repository } from "@shared/schema";

interface RepositoriesData {
  repositories: Repository[];
}

export function useRepositories() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<RepositoriesData>({
    queryKey: ["/api/repositories"],
    enabled: !!user,
  });

  return {
    repositories: data?.repositories || [],
    isLoading,
    error,
    refetch,
  };
}
