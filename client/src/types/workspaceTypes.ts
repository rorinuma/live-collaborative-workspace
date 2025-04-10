export interface Workspace {
  id: string;
  name: string;
  description: string;
  inviteToken: string;
  createdAt: string;
  imageUrl: string | null;
  memberCount: number;
}

export interface WorkspaceApiResponse {
  id: string;
  name: string;
  description: string;
  invite_token: string;
  created_at: string;
  image_url: string | null;
  member_count: number;
  error: string;
  message: string;
}
