import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiChevronLeft } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { getProduct } from "../api/client";
import { useCart } from "../context/CartContext";

export default function Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await getProduct(id);
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAdd = async () => {
    setBusy(true);
    const ok = await addToCart(product.id, qty);
    setBusy(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16">
        {loading && <p className="text-center text-gray-500">Loading…</p>}
        {error && (
          <div className="text-center">
            <p className="mb-6 text-rose-500">Couldn't load product: {error}</p>
            <Link to="/products" className="text-gray-600 hover:text-rose-500">
              ← Back to shop
            </Link>
          </div>
        )}

        {product && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500"
            >
              <FiChevronLeft className="size-4" /> Back
            </button>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Image */}
              <div className="bg-[#f4f4f4]">
                <img
                  src={
                    product.image_url ||
                    "https://placehold.co/600x600?text=No+Image"
                  }
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              </div>

              {/* Details */}
              <div>
                {product.category && (
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-500">
                    {product.category}
                  </p>
                )}
                <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900">
                  {product.name}
                </h1>
                <p className="mb-6 text-2xl font-light text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                {product.description && (
                  <p className="mb-8 leading-relaxed text-gray-600">
                    {product.description}
                  </p>
                )}

                <p className="mb-6 text-sm text-gray-500">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Quantity */}
                  <div className="inline-flex items-center border border-gray-300">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="flex size-11 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="size-4" />
                    </button>
                    <span className="w-12 text-center">{qty}</span>
                    <button
                      onClick={() =>
                        setQty((q) => Math.min(product.stock || 1, q + 1))
                      }
                      className="flex size-11 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="size-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={busy || product.stock <= 0}
                    className="bg-gray-900 px-10 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-500"
                  >
                    {product.stock <= 0
                      ? "Out of Stock"
                      : added
                      ? "Added ✓"
                      : busy
                      ? "Adding…"
                      : "Add to Cart"}
                  </button>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <Link
                    to="/cart"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-rose-500"
                  >
                    View Cart →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer3 />
    </div>
  );
}
