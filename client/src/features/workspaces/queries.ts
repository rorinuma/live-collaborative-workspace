import { Workspace, WorkspaceApiResponse } from "@/types/workspaceTypes";
import api from "@/utils/api";
import { normalizeWorkspace, normalizeWorkspaces } from "@/utils/workspaces";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentWorkspace = (currentWorkspaceId: string) => {
  return useQuery<Workspace>({
    queryKey: ["workspace", currentWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<WorkspaceApiResponse>(
        `workspaces/${currentWorkspaceId}`,
      );
      return normalizeWorkspace(data);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetUserWorkspaces = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } =
        await api.get<WorkspaceApiResponse[]>(`users/workspaces`);
      return normalizeWorkspaces(data);
    },
  });
};
