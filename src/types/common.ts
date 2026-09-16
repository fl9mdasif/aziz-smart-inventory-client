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

export interface TProduct {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string | TCategory;
  thumbnail: string;
  price: number;
  status?: TProductStatus;
  stockQuantity?: number;
  minStockThreshold?: number;
  restockIgnored?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TAvailability = 'in stock' | 'low stock' | 'out of stock';

// Shape returned by GET /products for an anonymous (unauthenticated) caller —
// see aziz-server product service's `toPublicShape`. Deliberately thinner than
// TProduct: no description/stockQuantity/minStockThreshold/restockIgnored,
// and `status` is pre-derived into `availability` server-side.
export interface TPublicProduct {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: { _id: string; name: string; slug: string } | string;
  price: number;
  availability: TAvailability;
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
  productName: string;       // snapshot of Product.name at time of sale
  quantity: number;
  unitPrice: number;         // snapshot of Product.price at time of sale
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
