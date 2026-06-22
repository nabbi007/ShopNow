import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Field({ label, type = "text", value, onChange, ...rest }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none"
        {...rest}
      />
    </label>
  );
}

export default function Page() {
  const { cart, checkout } = useCart();
  const { user } = useAuth();
  const { items, total } = cart;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const placed = await checkout({
        customerName: form.name,
        customerEmail: form.email,
        shippingAddress: form.address,
      });
      setOrder(placed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Success screen ---
  if (order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <FiCheckCircle className="mx-auto mb-6 size-16 text-green-500" />
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mb-2 text-gray-600">
            Thank you, {order.customer_name}. Your order has been placed.
          </p>
          <p className="mb-8 text-gray-600">
            Order <span className="font-semibold">#{order.id}</span> ·{" "}
            <span className="font-semibold">
              ${order.total_amount.toFixed(2)}
            </span>{" "}
            · Status: {order.status}
          </p>
          <div className="mx-auto mb-8 max-w-md border border-gray-200 p-6 text-left">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
              Items
            </h2>
            {order.items.map((it) => (
              <div
                key={it.id}
                className="flex justify-between border-b border-gray-100 py-2 text-sm"
              >
                <span className="text-gray-700">
                  {it.product_name} × {it.quantity}
                </span>
                <span className="text-gray-900">
                  ${(it.unit_price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-block border border-gray-400 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Continue Shopping
          </button>
        </main>
        <Footer3 />
      </div>
    );
  }

  // --- Empty cart guard ---
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="mb-6 text-gray-500">
            Your cart is empty — nothing to check out.
          </p>
          <Link
            to="/"
            className="inline-block border border-gray-400 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer3 />
      </div>
    );
  }

  // --- Checkout form ---
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Checkout
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Shipping form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              Shipping Details
            </h2>
            <div className="space-y-5">
              <Field
                label="Full Name"
                value={form.name}
                onChange={update("name")}
                required
                placeholder="Jane Doe"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={update("email")}
                required
                placeholder="jane@example.com"
              />
              <Field
                label="Shipping Address"
                value={form.address}
                onChange={update("address")}
                required
                placeholder="123 Market Street, Sydney NSW 2000"
              />
            </div>

            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-500 md:w-auto md:px-12"
            >
              {submitting ? "Placing Order…" : "Place Order"}
            </button>
          </form>

          {/* Order summary */}
          <div className="h-fit border border-gray-200 p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Your Order</h2>
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between border-b border-gray-100 py-3 text-sm"
              >
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">Free</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 py-4 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer3 />
    </div>
  );
}
