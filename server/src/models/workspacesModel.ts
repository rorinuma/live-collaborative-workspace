import sql from "../config/postgresql";
import { Workspace } from "../types/workspace";

interface AddWorkspaceArgs {
  workspaceId: string;
  workspaceImagePath: string | null;
  name: string;
  description: string | null;
  inviteToken: string;
}

export const addWorkspace = async ({
  workspaceId,
  workspaceImagePath,
  name,
  description,
  inviteToken,
}: AddWorkspaceArgs): Promise<number> => {
  const workspace = await sql`
    insert into workspaces (id, name, description, image_url, invite_token)
    values (${workspaceId}, ${name}, ${description}, ${workspaceImagePath}, ${inviteToken})
  `;

  return workspace.count;
};

interface addOwner {
  userId: number;
  workspaceId: string;
}
export const addOwnerByWorkspaceId = async ({
  userId,
  workspaceId,
}: addOwner): Promise<number> => {
  const owner = "owner";
  const member = await sql`
    insert into workspace_members (user_id, workspace_id, role)
    values (${userId}, ${workspaceId}, ${owner})
  `;
  return member.count;
};

export const workspaceByInviteToken = async (
  token: string,
): Promise<Workspace[]> => {
  const workspace = await sql<Workspace[]>`
    select * from workspaces
    where invite_token = ${token}
  `;
  return workspace;
};

export const workspaceMembersCountByWorkspaceId = async (
  workspaceId: string,
): Promise<number> => {
  const result = await sql`
    select count(*) as count
    from workspace_members
    where workspace_id = ${workspaceId}
  `;
  return Number(result[0].count);
};

export const addMemberByInviteToken = async (
  workspaceId: string,
  userId: number,
): Promise<number> => {
  const member = "member";
  const result = await sql`
    insert into workspace_members (workspace_id, user_id, role) 
    values (${workspaceId}, ${userId}, ${member})
  `;
  return result.count;
};

export const workspaceByWorkspaceId = async (
  workspaceId: string,
  userId: number,
): Promise<Workspace[]> => {
  const workspace = await sql<Workspace[]>`
    select w.*,
    (
      select count(*)
      from workspace_members wm2
      where wm.workspace_id = w.id
    ) as member_count
    from workspaces w
    join workspace_members wm on wm.workspace_id = w.id
    where w.id = ${workspaceId}
    and wm.user_id = ${userId}
  `;
  return workspace;
};
