import { TAvailability, TOrderStatus, TProductStatus } from "@/types";

export type StatusVariant = "good" | "warning" | "bad" | "neutral";

export const availabilityToVariant = (availability: TAvailability): StatusVariant => {
  if (availability === "out of stock") return "bad";
  if (availability === "low stock") return "warning";
  return "good";
};

export const productStatusToVariant = (status?: TProductStatus): StatusVariant => {
  if (status === "out_of_stock") return "bad";
  if (status === "low_stock") return "warning";
  return "good";
};

export const orderStatusToVariant = (status?: TOrderStatus): StatusVariant => {
  if (status === "cancelled") return "bad";
  return "good";
};

export const productStatusLabel = (status?: TProductStatus): string => {
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "low_stock") return "Low Stock";
  return "Active";
};
