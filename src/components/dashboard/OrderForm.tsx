"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TProduct, TVariant } from "@/types";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import { useCreateOrderMutation } from "@/redux/api/orderApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// A sale is recorded against one specific size of a product — flatten
// product+variant into a single pickable option (a product with multiple
// sizes shows multiple entries here).
interface VariantOption {
  productId: string;
  productName: string;
  variant: TVariant;
}

export function OrderForm() {
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebouncedValue(productSearch, 250);
  const [selectedKey, setSelectedKey] = useState(""); // `${productId}:${variantId}`
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [note, setNote] = useState("");

  const { data: productList } = useGetAllProductsQuery({
    search: debouncedSearch || undefined,
    status: "active",
    limit: 30,
  });
  const products = (productList?.items ?? []) as TProduct[];
  const options: VariantOption[] = products.flatMap((p) =>
    (p.variants ?? [])
      .filter((v) => v.status !== "out_of_stock")
      .map((variant) => ({ productId: p._id as string, productName: p.name, variant })),
  );
  const selected = options.find(
    (o) => `${o.productId}:${o.variant._id}` === selectedKey,
  );

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const resetForm = () => {
    setSelectedKey("");
    setProductSearch("");
    setQuantity("1");
    setDiscount("");
    setCustomerName("");
    setCustomerContact("");
    setNote("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      toast.error("Select a product size");
      return;
    }
    const qty = Number(quantity);
    if (qty > selected.variant.stockQuantity) {
      toast.error(`Only ${selected.variant.stockQuantity} in stock`);
      return;
    }
    try {
      await createOrder({
        productId: selected.productId,
        variantId: selected.variant._id,
        quantity: qty,
        discount: discount ? Number(discount) : undefined,
        customerName: customerName || undefined,
        customerContact: customerContact || undefined,
        note: note || undefined,
      }).unwrap();
      toast.success("Sale recorded");
      resetForm();
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't record sale");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Record a sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Product &amp; size</Label>
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="mb-2"
            />
            <Select value={selectedKey} onValueChange={(v) => setSelectedKey(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a product size" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={`${o.productId}:${o.variant._id}`} value={`${o.productId}:${o.variant._id}`}>
                    {o.productName} — {o.variant.sizeLabel} — ৳{o.variant.price.toLocaleString()} (
                    {o.variant.stockQuantity} in stock)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="order-qty">Quantity</Label>
              <Input
                id="order-qty"
                type="number"
                min={1}
                max={selected?.variant.stockQuantity ?? undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-discount">Discount (৳, optional)</Label>
              <Input
                id="order-discount"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="order-customer">Customer name (optional)</Label>
              <Input
                id="order-customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-contact">Contact (optional)</Label>
              <Input
                id="order-contact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order-note">Note (optional)</Label>
            <Input id="order-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {selected && (
            <p className="text-sm text-muted-foreground">
              Total: ৳
              {(
                selected.variant.price * Number(quantity || 0) - Number(discount || 0)
              ).toLocaleString()}
            </p>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Recording..." : "Record sale"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
