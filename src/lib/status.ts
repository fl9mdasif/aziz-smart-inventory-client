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

export type RestockPriority = "High" | "Medium" | "Low";

// Mirrors aziz-server's getRestockQueue priority logic (service.product.ts)
// so staff (who can't call the admin-only /restock-queue endpoint) can see
// an equivalent priority when we fall back to GET /products?lowStockOnly=true.
export const computeRestockPriority = (
  stockQuantity: number,
  minStockThreshold: number,
): RestockPriority => {
  if (stockQuantity === 0) return "High";
  if (stockQuantity <= Math.ceil(minStockThreshold * 0.5)) return "Medium";
  return "Low";
};

export const productStatusLabel = (status?: TProductStatus): string => {
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "low_stock") return "Low Stock";
  return "Active";
};
