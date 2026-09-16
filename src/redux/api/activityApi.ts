import { TActivity } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // NOTE: aziz-server's ActivityService.getRecentActivities() ignores query
    // params entirely today — always returns the last 10, no `type` filter.
    // PRD §2.7 wants a type filter + pagination; until the server supports it,
    // any filtering on the Inventory Activity page must happen client-side
    // over these 10 items, which is a real UX gap worth flagging back.
    getRecentActivities: builder.query<TActivity[], void>({
      query: () => ({
        url: "/activity",
        method: "GET",
      }),
      providesTags: [tagTypes.activity],
    }),
  }),
});

export const { useGetRecentActivitiesQuery } = activityApi;
