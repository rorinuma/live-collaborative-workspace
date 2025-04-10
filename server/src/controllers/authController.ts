import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  checkPasswordByUsernameQuery,
  createUser,
  findUser,
} from "../models/authModel";
import { LoginUser, RegisterUser } from "../types/auth";
import { signupSchema } from "../schemas/authSchema";

export const registerUser = async (
  req: Request<{}, any, RegisterUser>,
  res: Response,
): Promise<void> => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    const result = signupSchema.safeParse({
      email,
      username,
      password,
      confirmPassword,
    });

    if (!result.success) {
      res.status(400).json({ error: "Bad credentials, cheater!" });
      return;
    }

    const existingUser = await findUser(email, username);

    if (existingUser.length > 0) {
      if (
        existingUser[0].email === email &&
        existingUser[0].username !== username
      ) {
        res.status(409).json({ error: "Email is taken" });
        return;
      } else if (
        existingUser[0].username === username &&
        existingUser[0].email !== email
      ) {
        res.status(409).json({ error: "Username is taken" });
        return;
      } else {
        res.status(409).json({ error: "Email and username are taken" });
        return;
      }
    }

    const rowsAffected = await createUser(email, username, password);
    if (rowsAffected === 1) {
      res
        .status(201)
        .json({ message: "User created successfully, now login!" });
      return;
    }
    res.status(500).json({ error: "Unexpected error during registration" });
  } catch (error: any) {
    console.error("Registration error: ", error);

    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already taken" });
      return;
    }

    res.status(500).json({ error: "Server error during registration" });
  }
};

export const loginUser = async (
  req: Request<{}, any, LoginUser>,
  res: Response,
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const comparePasswords = await checkPasswordByUsernameQuery(
      username,
      password,
    );

    if (comparePasswords.success && comparePasswords.user) {
      const userId = comparePasswords.user[0].id;
      const username = comparePasswords.user[0].username;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

      if (!refreshTokenSecret) {
        return console.error("No refresh token secret in .env");
      }
      if (!accessTokenSecret) {
        return console.error("No access token secret in .env");
      }

      const refreshToken = jwt.sign({ id: userId }, refreshTokenSecret, {
        expiresIn: "7d",
      });

      const accessToken = jwt.sign({ id: userId }, accessTokenSecret, {
        expiresIn: "15m",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // this is dubious
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: `Welcome, ${username}`,
        accessToken,
      });
    } else if (comparePasswords === null) {
      res.status(401).json({ error: "User not found" });
    } else {
      res.status(401).json({ error: "Password is incorrect" });
    }
  } catch (error) {
    console.error("Error in loginUser: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshTokenSecret) {
    return console.error("No refresh token secret in .env");
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret) as {
      id: number;
    };

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret) {
      return console.error("No refresh token secret in .env");
    }

    const accessToken = jwt.sign({ id: decoded.id }, accessTokenSecret, {
      expiresIn: "15m",
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};
