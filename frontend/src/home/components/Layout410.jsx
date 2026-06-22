"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout410() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Reliable</p>
          <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Why we're different
          </h1>
          <p className="md:text-md">Built for speed and trust</p>
        </div>
        <div className="relative grid auto-cols-fr grid-cols-1 gap-6 md:gap-0">
          <div
            className="grid grid-cols-1 content-center overflow-hidden border border-border-primary bg-neutral-white md:sticky md:mb-[15vh] md:h-[70vh] md:grid-cols-2"
            style={{ top: "15%" }}
          >
            <div className="order-first flex flex-col justify-center p-6 md:p-8 lg:p-12 md:order-last">
              <p className="mb-2 font-semibold">Fast</p>
              <h2 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                Free shipping on orders
              </h2>
              <p>
                Get your items delivered without extra charges. No minimum
                purchase required on select items.
              </p>
              <div className="mt-6 flex items-center gap-x-4 md:mt-8">
                <Button variant="secondary">Learn</Button>
                <Button
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="order-last flex flex-col items-center justify-center md:order-first">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 1"
              />
            </div>
          </div>
          <div
            className="grid grid-cols-1 content-center overflow-hidden border border-border-primary bg-neutral-white md:sticky md:mb-[15vh] md:h-[70vh] md:grid-cols-2"
            style={{ top: "18%" }}
          >
            <div className="order-first flex flex-col justify-center p-6 md:p-8 lg:p-12 md:order-first">
              <p className="mb-2 font-semibold">Fast</p>
              <h2 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                Free shipping on orders
              </h2>
              <p>
                Get your items delivered without extra charges. No minimum
                purchase required on select items.
              </p>
              <div className="mt-6 flex items-center gap-x-4 md:mt-8">
                <Button variant="secondary">Learn</Button>
                <Button
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="order-last flex flex-col items-center justify-center md:order-last">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 2"
              />
            </div>
          </div>
          <div
            className="grid grid-cols-1 content-center overflow-hidden border border-border-primary bg-neutral-white md:sticky md:mb-[15vh] md:h-[70vh] md:grid-cols-2"
            style={{ top: "21%" }}
          >
            <div className="order-first flex flex-col justify-center p-6 md:p-8 lg:p-12 md:order-last">
              <p className="mb-2 font-semibold">Fast</p>
              <h2 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                Free shipping on orders
              </h2>
              <p>
                Get your items delivered without extra charges. No minimum
                purchase required on select items.
              </p>
              <div className="mt-6 flex items-center gap-x-4 md:mt-8">
                <Button variant="secondary">Learn</Button>
                <Button
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="order-last flex flex-col items-center justify-center md:order-first">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 3"
              />
            </div>
          </div>
          <div
            className="grid grid-cols-1 content-center overflow-hidden border border-border-primary bg-neutral-white md:sticky md:mb-[15vh] md:h-[70vh] md:grid-cols-2"
            style={{ top: "24%" }}
          >
            <div className="order-first flex flex-col justify-center p-6 md:p-8 lg:p-12 md:order-first">
              <p className="mb-2 font-semibold">Fast</p>
              <h2 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                Free shipping on orders
              </h2>
              <p>
                Get your items delivered without extra charges. No minimum
                purchase required on select items.
              </p>
              <div className="mt-6 flex items-center gap-x-4 md:mt-8">
                <Button variant="secondary">Learn</Button>
                <Button
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="order-last flex flex-col items-center justify-center md:order-last">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 4"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
