import { Response } from "express";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import { AuthRequest } from "../utils/authUtils";
import {
  addOwnerByWorkspaceId,
  addMemberByInviteToken,
  addWorkspace,
  workspaceByInviteToken,
  workspaceMembersCountByWorkspaceId,
  workspaceByWorkspaceId,
} from "../models/workspacesModel";
import { convertImagePath } from "../utils/imageUtils";

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const workspaceImage = req.file;

    const { name, description } = req.body;
    const descriptionNulled = description || null;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Workspace name is required" });
      return;
    }

    const workspaceId = uuidv4();
    const inviteToken = uuidv4();

    let workspaceImagePath;

    if (workspaceImage) {
      workspaceImagePath = workspaceImage.filename;
    } else {
      workspaceImagePath = null;
    }
    const addWorkspaceResult = await addWorkspace({
      workspaceId,
      workspaceImagePath,
      name,
      description: descriptionNulled,
      inviteToken,
    });

    if (addWorkspaceResult === 0) {
      res
        .status(500)
        .json({ error: "Failed to create a workspace in the database." });
      return;
    }

    const addMemberResult = await addOwnerByWorkspaceId({
      workspaceId,
      userId,
    });

    if (addMemberResult === 0) {
      res
        .status(500)
        .json({ error: "Failed to create a user in the database." });
      return;
    }

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: {
        id: workspaceId,
        name,
        description: descriptionNulled,
        inviteToken,
      },
    });
  } catch (error) {
    console.error("Error occured in addWorkspace: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyInviteToken = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const inviteToken = req.query.inviteToken;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (typeof inviteToken !== "string" || !isUUID(inviteToken)) {
    res.status(400).json({ error: "Invalid token format" });
    return;
  }

  try {
    const workspace = await workspaceByInviteToken(inviteToken);

    if (workspace.length === 0) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    const workspaceMembers = await workspaceMembersCountByWorkspaceId(
      workspace[0].id,
    );

    const workspaceImageUrl = workspace[0].image_url
      ? convertImagePath(workspace[0].image_url)
      : null;

    console.log(workspaceImageUrl);
    res.status(200).json({
      ...workspace[0],
      image_url: workspaceImageUrl,
      member_count: workspaceMembers,
    });
  } catch (error) {
    console.error("Error occured in verifyInviteToken: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinWorkspace = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { inviteToken } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (typeof inviteToken !== "string" || !isUUID(inviteToken)) {
    res.status(400).json({ error: "Invalid token format" });
    return;
  }

  try {
    const workspace = await workspaceByInviteToken(inviteToken);

    if (workspace.length === 0) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    const workspaceId = workspace[0].id;

    try {
      const result = await addMemberByInviteToken(workspaceId, userId);

      if (result === 0) {
        res
          .status(400)
          .json({ error: "Failed to add a member in the database" });
        return;
      }

      res.status(201).json(workspace[0]);
    } catch (error: any) {
      if (error.code === "23505") {
        // User is already a member — treat as success
        res.status(200).json(workspace[0]);
        return;
      }
      console.error("unknown db error", error); // rethrow unknown DB errors
    }
  } catch (error) {
    console.error("An error occurred in joinWorkspace:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const currentWorkspace = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { workspaceId } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!workspaceId) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  try {
    const workspace = await workspaceByWorkspaceId(workspaceId, userId);

    if (workspace.length === 0) {
      res.status(403).json({ error: "You're not a part of that workspace" });
      return;
    }

    const memberCount = await workspaceMembersCountByWorkspaceId(workspaceId);

    const workspaceImageUrl = workspace[0].image_url
      ? convertImagePath(workspace[0].image_url)
      : null;

    res.status(200).json({
      ...workspace[0],
      image_url: workspaceImageUrl,
      member_count: memberCount,
    });
  } catch (error) {
    console.error("Error in currentWorkspace: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
