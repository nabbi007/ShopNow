import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const CATEGORIES = [
  { title: "Electronics", img: "/headphones.jpeg" },
  { title: "Footwear", img: "/shoes.jpeg" },
  { title: "Sports", img: "/yogamat.jpeg" },
  { title: "Home", img: "/lamp.jpeg" },
];

export function Layout375() {
  return (
    <section className="px-[5%] py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-500">
            Explore
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Shop by Category
          </h2>
          <span className="mx-auto mb-4 block h-0.5 w-16 bg-gray-900" />
          <p className="text-sm text-gray-500">
            Find exactly what you're looking for in seconds.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              to={`/products?category=${encodeURIComponent(cat.title)}`}
              className="group relative block aspect-[4/5] overflow-hidden"
            >
              <img
                src={cat.img}
                alt={cat.title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <h3 className="text-lg font-semibold">{cat.title}</h3>
                <FiArrowRight className="size-5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
