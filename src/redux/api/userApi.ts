import { TPaginatedList, TUser } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // admin/superAdmin — promoting to 'admin' is superAdmin-only, enforced server-side
    createStaff: build.mutation({
      query: (data: Partial<TUser> & { password: string }) => ({
        url: "/users",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.users],
    }),

    getAllUsers: build.query({
      query: (params?: Record<string, unknown>) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      // see productApi's getAllProducts comment — same double-nesting quirk
      transformResponse: (
        response: { meta: TPaginatedList<TUser>["meta"]; data: TUser[] },
      ): TPaginatedList<TUser> => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.users],
    }),

    getUserById: build.query({
      query: (userId: string) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      providesTags: [tagTypes.users],
    }),

    // role changes are superAdmin-only, enforced server-side
    updateUser: build.mutation({
      query: ({ id, data }: { id: string; data: Partial<TUser> }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.users],
    }),

    deactivateUser: build.mutation({
      query: (id: string) => ({
        url: `/users/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const {
  useCreateStaffMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} = userApi;
