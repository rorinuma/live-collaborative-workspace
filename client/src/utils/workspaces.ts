import { Workspace, WorkspaceApiResponse } from "@/types/workspaceTypes";
import axios from "axios";
import { format } from "date-fns";
import api from "./api";

export function normalizeWorkspace(data: WorkspaceApiResponse): Workspace {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    inviteToken: data.invite_token,
    createdAt: convertDate(data.created_at),
    imageUrl: data.image_url,
    memberCount: data.member_count,
  };
}

export function convertDate(date: string) {
  return format(date, "PPP");
}

export const currentWorkspaceFetch = async (currentWorkspaceId: string) => {
  try {
    const response = await api.get<WorkspaceApiResponse>(
      `workspaces/${currentWorkspaceId}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "error while trying to fetch the current workspace: ",
        error.stack,
      );
    } else {
      console.error(
        "error while trying to fetch the current workspace: ",
        error,
      );
    }
  }
};
