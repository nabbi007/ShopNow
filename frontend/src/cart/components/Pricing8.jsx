"use client";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@relume_io/relume-ui";
import React from "react";
import { BiCheck } from "react-icons/bi";

export function Pricing8() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg">
        <div className="mx-auto mb-8 max-w-lg text-center md:mb-10 lg:mb-12">
          <p className="mb-3 font-semibold md:mb-4">Order</p>
          <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Order summary
          </h1>
          <p className="md:text-md">
            Subtotal, shipping, and any discounts appear below. Free delivery on
            orders over $50.
          </p>
        </div>
        <Tabs defaultValue="monthly">
          <TabsList className="mx-auto mb-12 w-fit">
            <TabsTrigger value="monthly">Subtotal</TabsTrigger>
            <TabsTrigger value="yearly">Shipping</TabsTrigger>
          </TabsList>
          <TabsContent
            value="monthly"
            className="container max-w-md data-[state=active]:animate-tabs"
          >
            <div className="h-full border border-border-primary px-6 py-8 md:p-8">
              <h2 className="mb-1 text-md font-bold leading-[1.4] md:text-xl">
                Discount code
              </h2>
              <p>Enter a code if you have one</p>
              <div className="my-8 h-px w-full bg-border-primary" />
              <h3 className="my-2 text-6xl font-bold md:text-9xl lg:text-10xl">
                Total
              </h3>
              <div className="mt-6 md:mt-8">
                <Button title="Proceed to checkout" className="w-full">
                  Proceed to checkout
                </Button>
              </div>
              <div className="my-8 h-px w-full bg-border-primary" />
              <div className="grid grid-cols-1 gap-y-4 py-2">
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Fast delivery included</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Secure payment processing</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>30-day returns guaranteed</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Support available anytime</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Track your order live</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="yearly"
            className="container max-w-md data-[state=active]:animate-tabs"
          >
            <div className="h-full border border-border-primary px-6 py-8 md:p-8">
              <h2 className="mb-1 text-md font-bold leading-[1.4] md:text-xl">
                Discount code
              </h2>
              <p>Enter a code if you have one</p>
              <div className="my-8 h-px w-full bg-border-primary" />
              <h3 className="my-2 text-6xl font-bold md:text-9xl lg:text-10xl">
                Total
              </h3>
              <p className="mt-2 font-medium">Save with a discount code</p>
              <div className="mt-6 md:mt-8">
                <Button title="Proceed to checkout" className="w-full">
                  Proceed to checkout
                </Button>
              </div>
              <div className="my-8 h-px w-full bg-border-primary" />
              <div className="grid grid-cols-1 gap-y-4 py-2">
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Fast delivery included</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Secure payment processing</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>30-day returns guaranteed</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Support available anytime</p>
                </div>
                <div className="flex self-start">
                  <div className="mr-4 flex-none self-start">
                    <BiCheck className="size-6" />
                  </div>
                  <p>Track your order live</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
