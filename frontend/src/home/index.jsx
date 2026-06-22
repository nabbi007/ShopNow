import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { Layout375 } from "./components/Layout375";
import { Cta58 } from "./components/Cta58";
import { Footer3 } from "./components/Footer3";
import { getProducts } from "../api/client";

function Hero() {
  return (
    <section className="bg-[#f4f4f4]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-6 lg:grid-cols-2">
        <div className="order-2 flex justify-center self-end lg:order-1">
          <img
            src="/download%20(13).jpeg"
            alt="Stylish male clothing"
            className="max-h-[580px] w-auto object-contain"
          />
        </div>
        <div className="order-1 py-12 text-center text-gray-900 lg:order-2 lg:py-24">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gray-900" />
            <span className="text-lg">Stylish</span>
            <span className="h-px w-12 bg-gray-900" />
          </div>
          <h1 className="mb-3 text-5xl font-light leading-tight md:text-6xl lg:text-7xl">
            Male Clothes
          </h1>
          <p className="mb-8 text-base text-gray-600">30% off Summer Vacation</p>
          <a
            href="#"
            className="inline-block border border-gray-400 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
}

function NewArrival() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
          New Arrival
        </h2>
        <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading products…</p>
      )}
      {error && (
        <p className="text-center text-rose-500">
          Couldn't load products: {error}
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500">No products available.</p>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <NewArrival />
      <Layout375 />
      <Cta58 />
      <Footer3 />
    </div>
  );
}
