import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { getMyOrders } from "../api/client";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyOrders();
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            My Orders
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        {loading && <p className="text-center text-gray-500">Loading orders…</p>}
        {error && (
          <p className="text-center text-rose-500">
            Couldn't load orders: {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-16 text-center">
            <FiPackage className="mx-auto mb-6 size-14 text-gray-300" />
            <p className="mb-6 text-gray-500">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-block border border-gray-400 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Start Shopping
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Order #{order.id}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    Ship to: {order.shipping_address}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="px-6 py-4">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex justify-between border-b border-gray-50 py-2 text-sm last:border-0"
                  >
                    <span className="text-gray-700">
                      {it.product_name} × {it.quantity}
                    </span>
                    <span className="text-gray-900">
                      ${(it.unit_price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer3 />
    </div>
  );
}
