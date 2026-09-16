import { TOrder, TPaginatedList, TSalesAnalyticsItem, TTopProduct, TSalesByCategoryItem } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation({
      query: (data: Partial<TOrder>) => ({
        url: "/orders",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.orders, tagTypes.products, tagTypes.activity],
    }),

    getAllOrders: build.query({
      query: (params?: Record<string, unknown>) => ({
        url: "/orders",
        method: "GET",
        params,
      }),
      // see productApi's getAllProducts comment — same double-nesting quirk
      transformResponse: (
        response: { meta: TPaginatedList<TOrder>["meta"]; data: TOrder[] },
      ): TPaginatedList<TOrder> => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.orders],
    }),

    getOrderById: build.query({
      query: (orderId: string) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: [tagTypes.orders],
    }),

    // admin/superAdmin only — enforced server-side too
    cancelOrder: build.mutation({
      query: ({ id, cancelReason }: { id: string; cancelReason?: string }) => ({
        url: `/orders/${id}/cancel`,
        method: "PATCH",
        data: { cancelReason },
      }),
      invalidatesTags: [tagTypes.orders, tagTypes.products, tagTypes.activity],
    }),

    deleteOrder: build.mutation({
      query: (id: string) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.orders],
    }),

    // ── Sales analytics (PRD §2.5) — admin/superAdmin only, plain arrays ────────
    getSalesAnalytics: build.query<TSalesAnalyticsItem[], { period: "daily" | "weekly" | "monthly" | "yearly"; from?: string; to?: string }>({
      query: (params) => ({
        url: "/orders/analytics/sales",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.orders],
    }),

    getTopProducts: build.query<TTopProduct[], { limit?: number } | void>({
      query: (params) => ({
        url: "/orders/analytics/top-products",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: [tagTypes.orders],
    }),

    getSalesByCategory: build.query<TSalesByCategoryItem[], void>({
      query: () => ({
        url: "/orders/analytics/by-category",
        method: "GET",
      }),
      providesTags: [tagTypes.orders],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useDeleteOrderMutation,
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetSalesByCategoryQuery,
} = orderApi;
