"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout363() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Payment</p>
            <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              How you'll pay
            </h2>
            <p className="md:text-md">Choose card or PayPal below</p>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-2">
          <div className="grid grid-cols-1 items-start border border-border-primary sm:grid-cols-2">
            <div className="flex size-full items-center justify-center">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="flex h-full flex-col justify-center p-6">
              <p className="mb-2 text-sm font-semibold">Card</p>
              <h3 className="mb-2 text-xl font-bold md:text-2xl">
                Credit or debit card
              </h3>
              <p>Fast and secure every time</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 md:mt-6">
                <Button
                  title="Select"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start border border-border-primary sm:grid-cols-2">
            <div className="flex size-full items-center justify-center">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                className="size-full object-cover"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="flex h-full flex-col justify-center p-6">
              <p className="mb-2 text-sm font-semibold">PayPal</p>
              <h3 className="mb-2 text-xl font-bold md:text-2xl">
                Pay with your PayPal account
              </h3>
              <p>No card details needed here</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 md:mt-6">
                <Button
                  title="Select"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
