import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { Footer3 } from "../home/components/Footer3";
import { getProducts } from "../api/client";

export default function Page() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(searchParams.get("category") || "All");

  // Keep the active filter in sync when navigating in via a category link.
  useEffect(() => {
    setActive(searchParams.get("category") || "All");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  const visible =
    active === "All"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Shop All
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`border px-5 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                  active === cat
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-500">Loading products…</p>
        )}
        {error && (
          <p className="text-center text-rose-500">
            Couldn't load products: {error}
          </p>
        )}
        {!loading && !error && visible.length === 0 && (
          <p className="text-center text-gray-500">No products in this category.</p>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

      <Footer3 />
    </div>
  );
}
