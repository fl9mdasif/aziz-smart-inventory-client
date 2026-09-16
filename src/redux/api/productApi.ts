import { TPaginatedList, TProduct, TPublicProduct, TRestockProduct } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const ProductApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProduct: build.mutation({
      query: (data: Partial<TProduct>) => ({
        url: "/products",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // Authenticated callers get the full TProduct[]; anonymous callers get
    // TPublicProduct[] (see types/common.ts) — the server decides based on
    // whether a Bearer token was sent, not on anything the client passes.
    getAllProducts: build.query({
      query: (params?: Record<string, unknown>) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      // baseQuery's `data` is already the unwrapped server payload, which for
      // this endpoint is itself `{ meta, data }` — see TPaginatedList's doc comment.
      transformResponse: (
        response: { meta: TPaginatedList<TProduct>["meta"]; data: (TProduct | TPublicProduct)[] },
      ): TPaginatedList<TProduct | TPublicProduct> => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.products],
    }),

    getSingleProduct: build.query({
      query: (productId: string) => ({
        url: `/products/${productId}`,
        method: "GET",
      }),
      providesTags: [tagTypes.products],
    }),

    // GET /products/restock-queue — admin/superAdmin only, PRD §2.6, plain array (no pagination)
    getRestockQueue: build.query<TRestockProduct[], void>({
      query: () => ({
        url: "/products/restock-queue",
        method: "GET",
      }),
      providesTags: [tagTypes.products],
    }),

    updateProduct: build.mutation({
      query: ({ id, data }: { id: string; data: Partial<TProduct> }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    deleteProduct: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.products],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useGetRestockQueueQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = ProductApi;
