"use client";

import { Button, Input } from "@relume_io/relume-ui";
import React from "react";

export function Cta26() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <div>
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Where it goes
          </h2>
          <p className="md:text-md">
            Enter your shipping address and preferred delivery speed
          </p>
          <div className="mx-auto mt-6 w-full max-w-sm md:mt-8">
            <form className="rb-4 mb-4 grid max-w-sm grid-cols-1 gap-y-3 sm:grid-cols-[1fr_max-content] sm:gap-4">
              <Input id="email" type="email" placeholder="Full name" />
              <Button
                title="Ship it"
                variant="primary"
                size="sm"
                className="items-center justify-center px-6 py-3"
              >
                Ship it
              </Button>
            </form>
            <p className="text-xs">
              We protect your address with bank-level encryption always
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
