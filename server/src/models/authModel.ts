import sql from "../config/postgresql";
import bcrypt from "bcrypt";
import { User } from "../types/auth";

export const createUser = async (
  email: string,
  username: string,
  password: string,
): Promise<number> => {
  const hashedPassword: string = await bcrypt.hash(password, 10);

  const result = await sql`
    insert into users (email, username, password)
    values (${email}, ${username}, ${hashedPassword})
  `;
  return result.count;
};

export const findUser = async (
  email: string | null,
  username: string | null,
): Promise<User[]> => {
  const user = await sql<User[]>`
      select * from users 
      where email = ${email} or
      username = ${username}
  `;
  return user;
};

interface LoginResult {
  success: boolean;
  message?: string;
  user?: User[];
}

export const checkPasswordByUsernameQuery = async (
  username: string,
  password: string,
): Promise<LoginResult> => {
  const user = await sql<User[]>`
    select * from users where username = ${username}
  `;
  // null if the user is not found
  if (user.length === 0) {
    return { success: false, message: "User not found" };
  }

  const storedPassword = user[0].password;

  const isPasswordValid = await bcrypt.compare(password, storedPassword);

  if (isPasswordValid) {
    return { success: true, user: user };
  } else {
    return { success: false, message: "Incorrect password" };
  }
};
