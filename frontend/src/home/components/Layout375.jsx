"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

const CATEGORIES = [
  { tag: "Tech", title: "Electronics", count: "1,240 items in stock", img: "https://picsum.photos/seed/cat-electronics/600/400" },
  { tag: "Active", title: "Sportswear", count: "860 items in stock", img: "https://picsum.photos/seed/cat-sportswear/600/400" },
  { tag: "Women", title: "Female Wear", count: "1,520 items in stock", img: "https://picsum.photos/seed/cat-femalewear/600/400" },
  { tag: "Seasonal", title: "Summer Wear", count: "640 items in stock", img: "https://picsum.photos/seed/cat-summerwear/600/400" },
];

const FEATURED = {
  tag: "Curated",
  title: "Old Money",
  count: "320 items in stock",
  img: "https://picsum.photos/seed/cat-oldmoney/900/700",
};

export function Layout375() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Explore</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Shop by category
            </h2>
            <p className="md:text-md">
              Find exactly what you're looking for in seconds.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="flex flex-col border border-border-primary"
              >
                <div className="flex items-center justify-center">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <div>
                    <p className="mb-2 text-sm font-semibold">{cat.tag}</p>
                    <h3 className="mb-2 text-xl font-bold md:text-2xl">
                      {cat.title}
                    </h3>
                    <p>{cat.count}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-4 md:mt-6">
                    <Button
                      title="→"
                      variant="link"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col border border-border-primary sm:col-span-2 sm:col-start-1 sm:row-span-2 sm:row-start-3 lg:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-1">
              <div className="flex items-center justify-center">
                <img
                  src={FEATURED.img}
                  alt={FEATURED.title}
                  className="w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-6 md:p-8 lg:p-12">
                <div>
                  <p className="mb-2 text-sm font-semibold">{FEATURED.tag}</p>
                  <h3 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                    {FEATURED.title}
                  </h3>
                  <p>{FEATURED.count}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                  <Button title="→" variant="secondary">
                    →
                  </Button>
                  <Button
                    title="→"
                    variant="link"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
