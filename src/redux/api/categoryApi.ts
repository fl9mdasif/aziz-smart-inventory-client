import { TCategory } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCategory: build.mutation({
      query: (data: Partial<TCategory>) => ({
        url: "/categories",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),

    getAllCategories: build.query<TCategory[], { isActive?: boolean } | void>({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: [tagTypes.categories],
    }),

    updateCategory: build.mutation({
      query: ({ id, data }: { id: string; data: Partial<TCategory> }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),

    toggleCategoryStatus: build.mutation<TCategory, string>({
      query: (id) => ({
        url: `/categories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.categories],
    }),

    deleteCategory: build.mutation({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
} = categoryApi;
