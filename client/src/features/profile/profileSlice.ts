import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  username: string;
  profilePicture: string;
  accountCreationDate: string;
}

const initialState: User = {
  username: "",
  profilePicture: "",
  accountCreationDate: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    userAuthorized(state, action: PayloadAction<User>) {
      const { username, accountCreationDate } = action.payload;
      state.username = username;
      state.accountCreationDate = accountCreationDate;
    },
  },
});

export const { userAuthorized } = profileSlice.actions;

export const getCurrentUser = (state: RootState) => state.profile;

export default profileSlice.reducer;
