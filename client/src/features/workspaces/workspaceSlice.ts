import { RootState } from "@/app/store";
import { Workspace } from "@/types/workspaceTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Workspace = {
  id: "",
  name: "",
  description: "",
  inviteToken: "",
  createdAt: "",
  imageUrl: "",
  memberCount: 0,
};

export const workspacesSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setCurrentWorkspace(state, action: PayloadAction<Workspace>) {
      const {
        id,
        name,
        description,
        inviteToken,
        createdAt,
        imageUrl,
        memberCount,
      } = action.payload;

      state.id = id;
      state.name = name;
      state.description = description;
      state.inviteToken = inviteToken;
      state.createdAt = createdAt;
      state.imageUrl = imageUrl;
      state.memberCount = memberCount;
    },
  },
});

export const selectCurrentWorkspace = (state: RootState) => state.workspaces;

export const { setCurrentWorkspace } = workspacesSlice.actions;
export default workspacesSlice.reducer;
