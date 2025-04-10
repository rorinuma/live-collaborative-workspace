import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface authState {
  accessToken: string;
}

const initialState: authState = {
  accessToken: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    tokenReceived(state, action: PayloadAction<authState>) {
      state.accessToken = action.payload.accessToken;
    },
  },
});

export const { tokenReceived } = authSlice.actions;

export default authSlice.reducer;
