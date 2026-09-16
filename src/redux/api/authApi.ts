import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (data: { email: string; password: string }) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
    }),

    register: build.mutation({
      query: (data: {
        username: string;
        email: string;
        password: string;
        role?: string;
        contactNumber: string;
        profilePicture?: string;
      }) => ({
        url: "/auth/register",
        method: "POST",
        data,
      }),
    }),

    getMe: build.query({
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

    logout: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
