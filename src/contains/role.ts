// Must mirror the server's USER_ROLE exactly (aziz-server/src/app/modules/auth/const.auth.ts)
export const USER_ROLE = {
  STAFF: "staff",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
} as const;
