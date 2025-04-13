import sql from "../config/postgresql";
import { UserData } from "../controllers/userController";
import { Workspace } from "../types/workspace";

export const profileInfo = async (userId: string): Promise<UserData[]> => {
  const myselfInfo = await sql<UserData[]>`
    select username, created_at 
    from users
    where id = ${userId}
  `;
  return myselfInfo;
};
export const userWorkspaces = async (userId: number): Promise<Workspace[]> => {
  const workspaces = await sql<Workspace[]>`
    select w.*,
    (
      select count(*)
      from workspace_members wm2
      where wm2.workspace_id = w.id
    ) as "member_count"
    from workspaces w
    join workspace_members wm on wm.workspace_id = w.id
    where wm.user_id = ${userId} and wm.role = 'owner'
    limit 4
  `;
  return workspaces;
};
