import type { LucideIcon } from "lucide-react";

export type TApiResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
  meta?: TMeta;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  // totalPage: number;
};

export type ResponseSuccessType = {
  data: unknown;
  meta?: TMeta;
}

export type IGenericErrorMessage = {
  path?: string | number;
  message?: string;
  statusCode?: number;
  errorMessages?: string
};

export type TApiError = {
  status?: number | string;
  data?: {
    message?: string;
    errorMessages?: IGenericErrorMessage[];
    stack?: string;
  } | string;
  message?: string;
};


export interface TCategory {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TProductStatus = 'active' | 'out_of_stock' | 'low_stock';

// A variant is one sellable size of a product — price/stock live here, not
// on the product. sku/sizeLabel/status are always server-derived, never
// editable/typed directly on the client.
export interface TVariant {
  _id?: string;
  sku: string;
  thickness: number;         // mm
  width: number;              // mm
  length: number;              // mm
  sizeLabel: string;            // e.g. "0.4mm x 6000mm", server-derived
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: TProductStatus;
  restockIgnored: boolean;
}

// Fields the client sends when creating/replacing a variant — sku/sizeLabel/
// status/restockIgnored are server-computed, never accepted from a form.
export type TVariantInput = Pick<TVariant, 'thickness' | 'width' | 'length' | 'price'> &
  Partial<Pick<TVariant, 'stockQuantity' | 'minStockThreshold'>>;

export interface TProduct {
  _id?: string;
  modelNo: string;
  name: string;
  slug: string;
  description: string;
  category: string | TCategory;
  thumbnail: string;
  brand?: string;
  moq?: string;
  samplesAvailable?: boolean;
  transportPackage?: string;
  origin?: string;
  hsCode?: string;
  note?: string;
  variants: TVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export type TAvailability = 'in stock' | 'low stock' | 'out of stock';

// Shape returned by GET /products for an anonymous (unauthenticated) caller —
// see aziz-server product service's `toPublicShape`. Deliberately thinner
// than TProduct — no description/modelNo/variants detail, just a price
// range (a product can have several sizes at different prices) and an
// overall availability rolled up from all variants' statuses.
export interface TPublicProduct {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: { _id: string; name: string; slug: string } | string;
  priceFrom: number;
  priceTo: number;
  availability: TAvailability;
}

// GET /products/restock-queue — one row per low/out-of-stock variant (size),
// carrying its parent product's identity fields (see server's aggregation
// in service.product.ts's getRestockQueue).
export interface TRestockRow {
  productId: string;
  modelNo: string;
  name: string;
  thumbnail: string;
  category: { _id: string; name: string; slug: string } | null;
  variantId: string;
  sku: string;
  sizeLabel: string;
  thickness: number;
  width: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: TProductStatus;
  priority: 'High' | 'Medium' | 'Low';
}

// GET /products/meta — distinct values in use, feeding the brand/
// transportPackage/origin combobox-with-add-new fields.
export interface TProductMeta {
  brand: string[];
  transportPackage: string[];
  origin: string[];
}


// An order is an offline sale record: staff/admin type it in after the
// customer has already paid in person. No shipping, no online payment,
// no multi-step lifecycle — a sale either happened or was voided.
export type TOrderStatus = 'completed' | 'cancelled';

// GET /orders and GET /orders/:id populate these two refs (see
// service.order.ts's .populate() calls) — a plain string only when you
// construct the POST /orders payload yourself.
export type TOrderProductRef =
  | string
  | { _id: string; name: string; slug: string; thumbnail: string; status: TProductStatus; stockQuantity: number };
export type TOrderPerformedByRef = string | { _id: string; username: string; email: string; role: UserRole };

export interface TOrder {
  _id?: string;
  productId: TOrderProductRef;
  variantId: string;         // which size was sold — Product.variants[]._id
  productName: string;       // snapshot of Product.name at time of sale
  sizeLabel: string;         // snapshot of the variant's sizeLabel at time of sale
  quantity: number;
  unitPrice: number;         // snapshot of the variant's price at time of sale
  discount?: number;
  totalAmount: number;       // (unitPrice * quantity) - discount
  customerName?: string;     // optional, free text — walk-in customer's name
  customerContact?: string;  // optional, free text — phone number
  note?: string;
  status?: TOrderStatus;
  cancelledAt?: string;
  cancelReason?: string;
  performedBy?: TOrderPerformedByRef;
  createdAt?: string;
  updatedAt?: string;
}

export type TActivityType = "order" | "product" | "user" | "system";

export interface TActivity {
  _id: string;
  type: TActivityType;
  message: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = "staff" | "admin" | "superAdmin";

export interface TUser {
  _id?: string;
  username: string;
  email: string;
  contactNumber: string;
  profilePicture?: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrawerItem {
  title: string;
  path: string;
  group: "General" | "Tracking" | "Management";
  icon: LucideIcon;
}

export interface TChartDataItem {
  name: string;
  revenue: number;
}

// A paginated list endpoint's server response is doubly-nested: the outer
// envelope's `data` field IS the service's `{ meta, data }` return value
// (aziz-server controllers pass `data: result` where `result` already has
// this shape). RTK Query endpoints for /products and /orders normalize this
// into { items, meta } via transformResponse — consume that shape, not a raw array.
export interface TPaginatedList<T> {
  items: T[];
  meta: TMeta;
}

export interface TRestockProduct extends TProduct {
  priority: 'High' | 'Medium' | 'Low';
}

// GET /orders/analytics/sales
export interface TSalesAnalyticsItem {
  date: string; // format depends on `period`: 'YYYY-MM-DD' | ISO week | 'YYYY-MM' | 'YYYY'
  revenue: number;
  orders: number;
}

// GET /orders/analytics/top-products
export interface TTopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

// GET /orders/analytics/by-category
export interface TSalesByCategoryItem {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
}
