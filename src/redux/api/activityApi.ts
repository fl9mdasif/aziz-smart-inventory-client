import { TActivity, TActivityType, TPaginatedList } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /activity — server-side type filter + pagination (see
    // aziz-server's ActivityService.getRecentActivities). Omit params for
    // the dashboard's "last 10" widget; pass page/limit/type for the
    // Inventory Activity page's real pager.
    getRecentActivities: builder.query<
      TPaginatedList<TActivity>,
      { type?: TActivityType; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/activity",
        method: "GET",
        params: params ?? undefined,
      }),
      // see productApi's getAllProducts comment — same double-nesting quirk
      transformResponse: (
        response: { meta: TPaginatedList<TActivity>["meta"]; data: TActivity[] },
      ): TPaginatedList<TActivity> => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.activity],
    }),
  }),
});

export const { useGetRecentActivitiesQuery } = activityApi;
