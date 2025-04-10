export interface AuthUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

export type RegisterUser = Pick<AuthUser, "username" | "email" | "password"> & {
  confirmPassword: string;
};

export type LoginUser = Pick<AuthUser, "username" | "password">;
