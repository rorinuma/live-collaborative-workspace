export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
}

export type RegisterUser = Pick<User, "email" | "username" | "password"> & {
  confirmPassword: string;
};

export type LoginUser = Pick<User, "username" | "password">;
export type PasswordQuery = Pick<User, "password">;
