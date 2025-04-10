import api from "@/utils/api";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { User } from "./profileSlice";

export const useGetProfile = (options?: Partial<UseQueryOptions<User>>) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get<User>("/users/myself");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
};
