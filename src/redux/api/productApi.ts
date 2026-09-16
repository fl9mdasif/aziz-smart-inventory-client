import { TPaginatedList, TProduct, TProductMeta, TPublicProduct, TRestockRow, TVariantInput } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export interface TProductCreatePayload {
  modelNo: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  brand?: string;
  moq?: string;
  samplesAvailable?: boolean;
  transportPackage?: string;
  origin?: string;
  hsCode?: string;
  note?: string;
  variants: TVariantInput[];
}

const ProductApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProduct: build.mutation({
      query: (data: TProductCreatePayload) => ({
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

    // GET /products/restock-queue — admin/superAdmin only, PRD §2.6, one row
    // per low/out-of-stock variant (size), plain array (no pagination)
    getRestockQueue: build.query<TRestockRow[], void>({
      query: () => ({
        url: "/products/restock-queue",
        method: "GET",
      }),
      providesTags: [tagTypes.products],
    }),

    // GET /products/meta — distinct brand/transportPackage/origin values, for
    // the combobox-with-add-new fields on the product form.
    getProductMeta: build.query<TProductMeta, void>({
      query: () => ({
        url: "/products/meta",
        method: "GET",
      }),
    }),

    // Product-level fields, optionally replacing the whole variants array.
    updateProduct: build.mutation({
      query: ({ id, data }: { id: string; data: Partial<TProductCreatePayload> }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // One variant's price/stock/dimensions, without touching the rest of the product.
    updateVariant: build.mutation({
      query: ({
        productId,
        variantId,
        data,
      }: {
        productId: string;
        variantId: string;
        data: Partial<TVariantInput & { restockIgnored: boolean }>;
      }) => ({
        url: `/products/${productId}/variants/${variantId}`,
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
  useGetProductMetaQuery,
  useUpdateProductMutation,
  useUpdateVariantMutation,
  useDeleteProductMutation,
} = ProductApi;
