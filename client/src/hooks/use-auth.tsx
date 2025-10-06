import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/api";
import type { User } from "@shared/schema";

interface AuthData {
  user: User;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get current user
  const { data: authData, isLoading, error } = useQuery<AuthData | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
    },
  });

  return {
    user: authData?.user || null,
    isLoading,
    isAuthenticated: !!authData?.user,
    error,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
