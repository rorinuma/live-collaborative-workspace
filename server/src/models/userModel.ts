import sql from "../config/postgresql";
import { UserData } from "../controllers/userController";

export const profileInfo = async (userId: string): Promise<UserData[]> => {
  const myselfInfo = await sql<UserData[]>`
    select username, created_at 
    from users
    where id = ${userId}
  `;
  return myselfInfo;
};
