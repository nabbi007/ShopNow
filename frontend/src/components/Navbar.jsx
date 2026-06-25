import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiChevronDown,
  FiPackage,
  FiLogOut,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Categories", to: "/products" },
  { label: "Deals", to: "/products", chevron: true },
];

function ProfileMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside the menu.
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-gray-700 transition-colors hover:text-rose-500"
      >
        <FiUser className="size-5" />
        <span className="hidden text-sm font-medium sm:inline">
          {user.name.split(" ")[0]}
        </span>
        <FiChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-52 border border-gray-100 bg-white py-2 shadow-lg">
          <div className="border-b border-gray-100 px-4 pb-2">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-rose-500"
          >
            <FiPackage className="size-4" /> My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-rose-500"
          >
            <FiLogOut className="size-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();

  // Highlight the first link whose route matches the current path (so the three
  // links pointing at /products don't all light up — only "Shop" does).
  const activeLabel = LINKS.find((l) =>
    l.to === "/" ? pathname === "/" : pathname === l.to
  )?.label;

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Shop<span className="text-rose-500">Now</span>
        </Link>
        <ul className="hidden items-center gap-8 text-sm font-medium text-gray-700 lg:flex">
          {LINKS.map((l) => {
            const active = l.label === activeLabel;
            return (
              <li key={l.label} className="relative">
                <Link
                  to={l.to}
                  className={`flex items-center gap-1 pb-1 transition-colors hover:text-rose-500 ${
                    active ? "text-rose-500" : "text-gray-700"
                  }`}
                >
                  {l.label}
                  {l.chevron && <FiChevronDown className="size-3.5" />}
                </Link>
                {active && (
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-rose-500" />
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-5 text-gray-700">
          <FiSearch className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
          {isAuthenticated ? (
            <ProfileMenu user={user} logout={logout} />
          ) : (
            <Link to="/login" aria-label="Sign in">
              <FiUser className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
            </Link>
          )}
          <FiHeart className="size-5 cursor-pointer transition-colors hover:text-rose-500" />
          <Link to="/cart" className="relative cursor-pointer">
            <FiShoppingBag className="size-5 transition-colors hover:text-rose-500" />
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
