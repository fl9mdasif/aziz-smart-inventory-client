import { TUser } from "@/types";
import { baseApi } from "./baseApi";

// jwtPayload the server signs into the token / returns from login
// (aziz-server/src/app/modules/auth/service.auth.ts)
export interface TJwtPayload {
  _id: string;
  username: string;
  email: string;
  role: TUser["role"];
}

interface TLoginResponse {
  user: TJwtPayload;
  accessToken: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<TLoginResponse, { email: string; password: string }>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
    }),

    getMe: build.query<TUser, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),

    updateProfile: build.mutation({
      query: (data: {
        username?: string;
        email?: string;
        contactNumber?: string;
        profilePicture?: string;
      }) => ({
        url: "/auth/update-profile",
        method: "PATCH",
        data,
      }),
    }),

    changePassword: build.mutation({
      query: (data: { oldPassword: string; newPassword: string }) => ({
        url: "/auth/change-password",
        method: "POST",
        data,
      }),
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
