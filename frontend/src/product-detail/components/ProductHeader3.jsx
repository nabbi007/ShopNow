"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@relume_io/relume-ui";
import React, { Fragment, useEffect, useState } from "react";
import { RxPlus } from "react-icons/rx";
import { BiSolidStar, BiSolidStarHalf, BiStar } from "react-icons/bi";
import clsx from "clsx";

const Star = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFullStar = i < fullStars;
        const isHalfStar = hasHalfStar && i === fullStars;

        return (
          <div key={i}>
            {isFullStar ? (
              <BiSolidStar />
            ) : isHalfStar ? (
              <BiSolidStarHalf />
            ) : (
              <BiStar />
            )}
          </div>
        );
      })}
    </div>
  );
};

const useCarousel = () => {
  const [mainApi, setMainApi] = useState();
  const [thumbApi, setThumbApi] = useState();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!mainApi || !thumbApi) {
      return;
    }
    mainApi.on("select", () => {
      const index = mainApi.selectedScrollSnap();
      setCurrent(index);
      thumbApi.scrollTo(index);
    });
  }, [mainApi, thumbApi]);
  const handleClick = (index) => () => {
    return mainApi?.scrollTo(index);
  };
  const getThumbStyles = (index) => {
    return clsx("block", current === index && "opacity-60");
  };
  return {
    setMainApi,
    setThumbApi,
    handleClick,
    getThumbStyles,
  };
};

export function ProductHeader3() {
  const useActive = useCarousel();
  return (
    <header id="relume" className="px-[5%] py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-8 md:gap-y-10 lg:grid-cols-[1fr_1.25fr] lg:gap-x-20">
          <div>
            <Breadcrumb className="mb-6 flex flex-wrap items-center text-sm">
              <BreadcrumbList>
                <Fragment>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Shop all</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
                <Fragment>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Electronics</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
                <Fragment>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Premium headphones</BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              </BreadcrumbList>
            </Breadcrumb>
            <div>
              <h1 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl">
                Premium headphones
              </h1>
              <div className="mb-5 flex flex-col flex-wrap sm:flex-row sm:items-center md:mb-6">
                <p className="text-xl font-bold md:text-2xl">$129</p>
                <div className="mx-4 hidden w-px self-stretch bg-background-alternative sm:block" />
                <div className="flex flex-wrap items-center gap-3">
                  <Star rating={3.5} />
                  <p className="text-sm">4.8 stars • 247 reviews</p>
                </div>
              </div>
              <p className="mb-5 md:mb-6">
                Crystal-clear sound meets all-day comfort. These headphones
                deliver studio-quality audio with active noise cancellation that
                blocks out the world. Perfect for work, travel, or just getting
                lost in your music.
              </p>
              <form className="mb-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col">
                    <Label className="mb-2">Warranty</Label>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href="#"
                        className="focus-visible:ring-border-primary inline-flex gap-3 items-center justify-center whitespace-nowrap ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border-primary bg-background-alternative text-text-alternative px-4 py-2"
                      >
                        Midnight black
                      </a>
                      <a
                        href="#"
                        className="focus-visible:ring-border-primary inline-flex gap-3 items-center justify-center whitespace-nowrap ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border-primary text-text-primary bg-background-primary px-4 py-2"
                      >
                        Silver
                      </a>
                      <a
                        href="#"
                        className="focus-visible:ring-border-primary inline-flex gap-3 items-center justify-center whitespace-nowrap ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border-primary text-text-primary bg-background-primary px-4 py-2 pointer-events-none opacity-25"
                      >
                        Rose gold
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_4rem] gap-x-4">
                    <div className="flex flex-col">
                      <Label className="mb-2">Warranty</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-choice">
                            Option One
                          </SelectItem>
                          <SelectItem value="second-choice">
                            Option Two
                          </SelectItem>
                          <SelectItem value="third-choice">
                            Option Three
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="quantity" className="mb-2">
                        Qty
                      </Label>
                      <Input
                        type="number"
                        id="quantity"
                        placeholder="1"
                        className="w-16"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4 mt-8 flex flex-col gap-y-4">
                  <Button title="Add to cart">Add to cart</Button>
                  <Button title="Buy now" variant="secondary">
                    Buy now
                  </Button>
                </div>
                <p className="text-center text-xs">Free shipping over $50</p>
              </form>
              <Accordion type="multiple">
                <AccordionItem value="item-0">
                  <AccordionTrigger
                    className="py-4 font-semibold md:text-md"
                    icon={
                      <RxPlus className="size-6 shrink-0 text-text-primary transition-transform duration-300" />
                    }
                  >
                    Details
                  </AccordionTrigger>
                  <AccordionContent className="md:pb-6">
                    Not happy? Return it within 30 days for a full refund. No
                    questions asked. We cover return shipping on orders over
                    $50.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1">
                  <AccordionTrigger
                    className="py-4 font-semibold md:text-md"
                    icon={
                      <RxPlus className="size-6 shrink-0 text-text-primary transition-transform duration-300" />
                    }
                  >
                    Shipping
                  </AccordionTrigger>
                  <AccordionContent className="md:pb-6">
                    Not happy? Return it within 30 days for a full refund. No
                    questions asked. We cover return shipping on orders over
                    $50.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger
                    className="py-4 font-semibold md:text-md"
                    icon={
                      <RxPlus className="size-6 shrink-0 text-text-primary transition-transform duration-300" />
                    }
                  >
                    Returns
                  </AccordionTrigger>
                  <AccordionContent className="md:pb-6">
                    Not happy? Return it within 30 days for a full refund. No
                    questions asked. We cover return shipping on orders over
                    $50.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="order-first lg:order-none">
            <div className="order-first flex flex-col gap-y-4 md:order-none">
              <div className="overflow-hidden">
                <Carousel
                  setApi={useActive.setMainApi}
                  opts={{ loop: true, align: "start" }}
                  className="m-0"
                >
                  <CarouselContent className="m-0">
                    <CarouselItem className="basis-full pl-0">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                        alt="Relume placeholder image 1"
                        className="aspect-[5/4] size-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="basis-full pl-0">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                        alt="Relume placeholder image 2"
                        className="aspect-[5/4] size-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="basis-full pl-0">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                        alt="Relume placeholder image 3"
                        className="aspect-[5/4] size-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="basis-full pl-0">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                        alt="Relume placeholder image 4"
                        className="aspect-[5/4] size-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="basis-full pl-0">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                        alt="Relume placeholder image 5"
                        className="aspect-[5/4] size-full object-cover"
                      />
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
              <div className="hidden overflow-y-auto md:block">
                <Carousel
                  setApi={useActive.setThumbApi}
                  opts={{
                    align: "start",
                    containScroll: "keepSnaps",
                    dragFree: true,
                  }}
                  className="m-0"
                >
                  <CarouselContent className="gap-y-4">
                    <CarouselItem className="basis-1/5">
                      <button
                        onClick={useActive.handleClick(0)}
                        className={useActive.getThumbStyles(0)}
                      >
                        <img
                          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                          alt="Relume placeholder image 1"
                          className="aspect-[5/4] size-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                    <CarouselItem className="basis-1/5">
                      <button
                        onClick={useActive.handleClick(1)}
                        className={useActive.getThumbStyles(1)}
                      >
                        <img
                          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                          alt="Relume placeholder image 2"
                          className="aspect-[5/4] size-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                    <CarouselItem className="basis-1/5">
                      <button
                        onClick={useActive.handleClick(2)}
                        className={useActive.getThumbStyles(2)}
                      >
                        <img
                          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                          alt="Relume placeholder image 3"
                          className="aspect-[5/4] size-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                    <CarouselItem className="basis-1/5">
                      <button
                        onClick={useActive.handleClick(3)}
                        className={useActive.getThumbStyles(3)}
                      >
                        <img
                          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                          alt="Relume placeholder image 4"
                          className="aspect-[5/4] size-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                    <CarouselItem className="basis-1/5">
                      <button
                        onClick={useActive.handleClick(4)}
                        className={useActive.getThumbStyles(4)}
                      >
                        <img
                          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                          alt="Relume placeholder image 5"
                          className="aspect-[5/4] size-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
