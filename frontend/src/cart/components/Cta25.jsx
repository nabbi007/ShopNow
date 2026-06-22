"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Cta25() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
          Time moves fast here
        </h2>
        <p className="md:text-md">
          Stock runs low on the best items. Lock in your order now before they
          slip away.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button title="Checkout">Checkout</Button>
          <Button title="Browse" variant="secondary">
            Browse
          </Button>
        </div>
      </div>
    </section>
  );
}
