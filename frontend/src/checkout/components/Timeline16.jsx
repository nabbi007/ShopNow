"use client";

import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@relume_io/relume-ui";
import React, { useEffect, useState } from "react";
import { RxChevronRight } from "react-icons/rx";

const useCarousel = () => {
  const [api, setApi] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselPreviousClass = (index) => {
    return `z-30 size-12 ${index === 1 ? "hidden" : ""}`;
  };

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrentIndex(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return {
    api,
    setApi,
    carouselPreviousClass,
    currentIndex,
  };
};

export function Timeline16() {
  const useActive = useCarousel();
  return (
    <section
      id="relume"
      className="overflow-hidden px-[5%] py-16 md:py-24 lg:py-28"
    >
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Progress</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              You're almost there
            </h2>
            <p className="md:text-md">
              We've got your back every step of the way. Your order is secure
              and protected.
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
              <Button title="Back" variant="secondary">
                Back
              </Button>
              <Button
                title="Help"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
              >
                Help
              </Button>
            </div>
          </div>
        </div>
        <Carousel
          setApi={useActive.setApi}
          className="relative h-full overflow-hidden"
        >
          <div className="absolute left-0 top-1.5 z-20 h-1 w-16 bg-gradient-to-r from-background-primary to-transparent" />
          <CarouselContent className="ml-0">
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">Cart</h3>
                  <p>Review your items and confirm you're ready to proceed.</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Shipping
                  </h3>
                  <p>
                    Tell us where to send your order and how fast you need it.
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Payment
                  </h3>
                  <p>
                    Choose your payment method and enter your billing details
                    securely.
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Confirm
                  </h3>
                  <p>
                    Review everything one last time before we process your
                    order.
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">Done</h3>
                  <p>Your order is confirmed and on its way to you soon.</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full pl-0 sm:basis-1/2 md:basis-1/3">
              <div className="mb-4 flex w-full flex-col md:mb-0 md:w-auto">
                <div className="mb-4 flex w-full items-center">
                  <div className="h-[3px] w-full bg-neutral-black" />
                  <div className="z-20 size-[0.9375rem] flex-none rounded-full bg-neutral-black shadow-[0_0_0_8px_white]" />
                  <div className="h-[3px] w-full bg-neutral-black" />
                </div>
                <div className="px-8 text-center">
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">Track</h3>
                  <p>
                    Follow your package in real time from warehouse to your
                    door.
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious
            className={useActive.carouselPreviousClass(useActive.currentIndex)}
          />
          <CarouselNext className="size-12" />
          <div className="absolute right-0 top-1.5 z-20 h-1 w-16 bg-gradient-to-l from-background-primary to-transparent" />
        </Carousel>
      </div>
    </section>
  );
}
