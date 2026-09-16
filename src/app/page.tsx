"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Hero } from "@/components/public/Hero";
import { HowToBuy } from "@/components/public/HowToBuy";
import { CategoryFilter } from "@/components/public/CategoryFilter";
import { ProductCard } from "@/components/public/ProductCard";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { TPublicProduct } from "@/types";

export default function Home() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data: categories } = useGetAllCategoriesQuery();
  const {
    data: productList,
    isLoading,
    isError,
  } = useGetAllProductsQuery({
    search: debouncedSearch || undefined,
    category: categoryId || undefined,
    limit: 24,
  });

  // Anonymous requests get TPublicProduct[] from the server (see types/common.ts)
  const products = (productList?.items ?? []) as TPublicProduct[];

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <Hero productCount={productList?.meta?.total} />

      <main id="products" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Available now</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              activeId={categoryId}
              onSelect={setCategoryId}
            />
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Couldn&apos;t load products right now. Please try again shortly.
          </p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No products found{search ? ` for "${search}"` : ""}.
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <HowToBuy />
      <PublicFooter />
      <FloatingWhatsApp />
    </div>
  );
}
