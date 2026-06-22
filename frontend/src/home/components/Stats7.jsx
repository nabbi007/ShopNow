"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Stats7() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 max-w-lg md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Trusted</p>
          <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Why customers choose us
          </h2>
          <p className="md:text-md">
            Real people, real results. See what makes ShopNow different.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-8 lg:gap-x-12 lg:gap-y-16">
          <div className="border-l-2 border-border-primary pl-8">
            <p className="mb-2 text-10xl font-bold leading-[1.3] md:text-[4rem] lg:text-[5rem]">
              50,000+
            </p>
            <h3 className="text-md font-bold leading-[1.4] md:text-xl">
              Happy customers
            </h3>
          </div>
          <div className="border-l-2 border-border-primary pl-8">
            <p className="mb-2 text-10xl font-bold leading-[1.3] md:text-[4rem] lg:text-[5rem]">
              200+
            </p>
            <h3 className="text-md font-bold leading-[1.4] md:text-xl">
              Trusted brands
            </h3>
          </div>
          <div className="border-l-2 border-border-primary pl-8">
            <p className="mb-2 text-10xl font-bold leading-[1.3] md:text-[4rem] lg:text-[5rem]">
              $50
            </p>
            <h3 className="text-md font-bold leading-[1.4] md:text-xl">
              Free delivery minimum
            </h3>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4 md:mt-14 lg:mt-16">
          <Button variant="secondary">Learn more</Button>
          <Button variant="link" size="link" iconRight={<RxChevronRight />}>
            →
          </Button>
        </div>
      </div>
    </section>
  );
}
