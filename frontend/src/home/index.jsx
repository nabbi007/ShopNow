import React from "react";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiChevronDown,
} from "react-icons/fi";
import { Layout375 } from "./components/Layout375";
import { Cta58 } from "./components/Cta58";
import { Footer3 } from "./components/Footer3";

const NEW_ARRIVALS = [
  { name: "T-Shirt And Jeans", price: 60, old: 60, badge: "-10%", img: "https://picsum.photos/seed/sweater/500/500" },
  { name: "T-Shirt And Jeans", price: 70, badge: "New", img: "https://picsum.photos/seed/backpack/500/500" },
  { name: "T-Shirt And Jeans", price: 40, old: 50, badge: "-10%", img: "https://picsum.photos/seed/sunglasses/500/500" },
  { name: "T-Shirt And Jeans", price: 80, badge: "New", img: "https://picsum.photos/seed/hat/500/500" },
  { name: "T-Shirt And Jeans", price: 30, old: 40, badge: "-10%", img: "https://picsum.photos/seed/watch/500/500" },
  { name: "T-Shirt And Jeans", price: 90, badge: "New", img: "https://picsum.photos/seed/belt/500/500" },
  { name: "T-Shirt And Jeans", price: 20, old: 30, badge: "-10%", img: "https://picsum.photos/seed/sneaker/500/500" },
  { name: "T-Shirt And Jeans", price: 50, badge: "New", img: "https://picsum.photos/seed/shorts/500/500" },
  { name: "T-Shirt And Jeans", price: 50, badge: "New", img: "https://picsum.photos/seed/headphones/500/500" },
  { name: "T-Shirt And Jeans", price: 50, badge: "New", img: "https://picsum.photos/seed/shoe/500/500" },
];

function Navbar() {
  const links = ["Home", "Shop", "Collection", "Pages", "Blog", "About", "Contact"];
  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Flone<span className="text-rose-500">.</span>
        </a>
        <ul className="hidden items-center gap-8 text-sm font-medium text-gray-700 lg:flex">
          {links.map((l) => (
            <li key={l}>
              <a
                href="#"
                className="flex items-center gap-1 transition-colors hover:text-rose-500"
              >
                {l}
                {["Home", "Shop", "Pages", "Blog"].includes(l) && (
                  <FiChevronDown className="size-3.5" />
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5 text-gray-700">
          <FiSearch className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
          <FiUser className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
          <FiHeart className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
          <div className="relative cursor-pointer">
            <FiShoppingBag className="size-5 transition-colors hover:text-rose-500" />
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
              02
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

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

function ProductCard({ name, price, old, badge, img }) {
  const isSale = badge?.includes("%");
  return (
    <div className="group">
      <div className="relative overflow-hidden bg-[#f4f4f4]">
        {badge && (
          <span
            className={`absolute right-3 top-3 z-10 text-xs font-semibold ${
              isSale ? "text-rose-500" : "text-purple-500"
            }`}
          >
            {badge}
          </span>
        )}
        <img
          src={img}
          alt={name}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button className="absolute bottom-0 left-0 right-0 translate-y-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-transform duration-300 group-hover:translate-y-0">
          Add to Cart
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm text-gray-800">{name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-gray-900">${price.toFixed(2)}</span>
            {old && (
              <span className="text-gray-400 line-through">
                - ${old.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <FiHeart className="size-4 cursor-pointer text-gray-400 transition-colors hover:text-rose-500" />
      </div>
    </div>
  );
}

function NewArrival() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {NEW_ARRIVALS.map((p, i) => (
          <ProductCard key={i} {...p} />
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
