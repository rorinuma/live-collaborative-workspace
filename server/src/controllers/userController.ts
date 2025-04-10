import { Response } from "express";
import { profileInfo } from "../models/userModel";
import { AuthRequest } from "../utils/authUtils";

export interface UserData {
  username: string;
  created_at: string;
}
export const myself = async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user || !user.id) {
    res.status(401).json({ error: "no user?" });
    return;
  }

  try {
    const userData = await profileInfo(user.id.toString());

    if (!userData || userData.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { username, created_at } = userData[0];

    res.status(200).json({ username, accountCreationDate: created_at });
    return;
  } catch (error) {
    console.error("Error while getting profile info:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
