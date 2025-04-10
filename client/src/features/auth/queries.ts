import { useAppDispatch } from "@/app/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { tokenReceived } from "./authSlice";

export const useRefreshToken = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return data.accessToken;
    },
    onSuccess: (accessToken) => {
      dispatch(tokenReceived({ accessToken }));
    },
    retry: false,
  });
};
