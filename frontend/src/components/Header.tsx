// frontend/src/components/Header.tsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/Cona images/logo.webp";

const links = [
  { to: "/", label: "HOME" },
  { to: "/menu", label: "MENU" },
  { to: "/booking", label: "BOOKING" },
  { to: "/gallery", label: "GALLERY" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-500/20 bg-black/70 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Cona Logo"
            className="h-10 w-10 object-contain"
          />

          <div className="flex items-center gap-1">
            <span className="font-display text-3xl tracking-[0.25em] text-white">
              CO
            </span>
            <span className="font-display text-3xl tracking-[0.25em] text-blue-400">
              NA
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-blue-400 transition-colors ${
                location.pathname === link.to
                  ? "text-blue-400"
                  : "text-gray-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Reserve Button */}
        <Link
          to="/booking"
          className="hidden md:block bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-semibold tracking-widest rounded transition-all shadow-[0_0_15px_rgb(59,130,246)] hover:shadow-[0_0_25px_rgb(59,130,246)]"
        >
          RESERVE
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-blue-500/20">
          <div className="px-6 py-6 flex flex-col gap-6 text-sm uppercase tracking-widest">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-blue-400"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="bg-blue-600 text-center py-4 rounded font-semibold tracking-widest"
            >
              RESERVE TABLE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}