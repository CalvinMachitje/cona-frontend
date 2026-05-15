// frontend/src/components/Footer.tsx
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 mt-32">
      <div className="container mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="font-display text-3xl tracking-[0.2em] mb-4">
            CO<span className="text-primary">NA</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where the night comes alive. A premium lounge experience crafted
            for unforgettable moments, exclusive vibes, and elevated nightlife.
          </p>

          <div className="flex gap-3 mt-6">
            <a
              href="#"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
            >
              <Instagram size={16} />
            </a>

            <a
              href="#"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Navigate
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-foreground">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/booking" className="hover:text-foreground">
                Booking
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-foreground">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Hours
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              Mon – Sun: 10AM – 2AM
            </li>
            <li className="text-xs text-muted-foreground/70 pl-6">
              Open daily for bookings, dining & nightlife
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin size={14} className="text-primary mt-1" />
              <span>
                Coligny, 2725
              </span>
            </li>

            <li className="flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              083 200 2516
            </li>

            <li className="flex items-center gap-2">
              <Mail size={14} className="text-primary" />
              info@conalounge.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CONA Lounge. All rights reserved.</p>

          <Link
            to="/contact"
            className="uppercase tracking-[0.2em] hover:text-primary"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}