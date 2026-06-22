"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Faq13() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 w-full max-w-lg md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Help
          </h2>
          <p className="md:text-md">
            Quick answers to common questions about your order and returns
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              How do returns work?
            </h2>
            <p>
              We offer 30-day returns on all items. Pack them back up, print
              your label, and drop them off. Refunds process within five
              business days of arrival.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              What about shipping times?
            </h2>
            <p>
              Most orders ship within 24 hours. Delivery takes one to three
              business days depending on your location. Track everything in real
              time from your account.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Is payment secure here?
            </h2>
            <p>
              Yes. We use industry-standard encryption and partner with trusted
              payment processors. Your card details never touch our servers
              directly.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Can I modify my order?
            </h2>
            <p>
              If your order hasn't shipped yet, reach out within two hours of
              purchase. We'll do what we can to adjust it before it goes out the
              door.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Do you offer gift wrapping?
            </h2>
            <p>
              We do at checkout. Select the option when you review your cart and
              we'll wrap it with care. A personal message card is included free.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              What if something arrives damaged?
            </h2>
            <p>
              Contact us immediately with photos. We'll replace it or refund you
              right away. Damaged goods are on us, not you.
            </p>
          </div>
        </div>
        <div className="mt-12 md:mt-18 lg:mt-20">
          <h4 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            Need more help?
          </h4>
          <p className="md:text-md">Our team is here around the clock</p>
          <div className="mt-6 md:mt-8">
            <Button title="Contact us" variant="secondary">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
