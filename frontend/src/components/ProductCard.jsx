import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    setBusy(true);
    const ok = await addToCart(product.id, 1);
    setBusy(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const outOfStock = product.stock <= 0;

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-[#f4f4f4]">
        {product.category && (
          <span className="absolute right-3 top-3 z-10 text-xs font-semibold text-purple-500">
            {product.category}
          </span>
        )}
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={handleAdd}
          disabled={busy || outOfStock}
          className="absolute bottom-0 left-0 right-0 translate-y-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-transform duration-300 group-hover:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {outOfStock ? "Out of Stock" : added ? "Added ✓" : busy ? "Adding…" : "Add to Cart"}
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <Link
            to={`/products/${product.id}`}
            className="text-sm text-gray-800 transition-colors hover:text-rose-500"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-gray-900">${product.price.toFixed(2)}</span>
          </div>
        </div>
        <FiHeart className="size-4 cursor-pointer text-gray-400 transition-colors hover:text-rose-500" />
      </div>
    </div>
  );
}
