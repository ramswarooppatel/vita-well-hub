
import { NavLink } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Summary */}
          <div className="md:col-span-1">
            <NavLink
              to="/"
              className="flex items-center gap-2 font-semibold text-lg"
            >
              <span className="health-gradient rounded-md text-white font-bold p-1">
                VWH
              </span>
              <span>VitaWellHub</span>
            </NavLink>
            <p className="mt-4 text-sm text-muted-foreground">
              Comprehensive healthcare at your fingertips. Book appointments, consult
              specialists, and manage your health journey all in one place.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-medium mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/appointments" className="text-muted-foreground hover:text-primary">
                  Appointments
                </NavLink>
              </li>
              <li>
                <NavLink to="/telemedicine" className="text-muted-foreground hover:text-primary">
                  Telemedicine
                </NavLink>
              </li>
              <li>
                <NavLink to="/symptoms" className="text-muted-foreground hover:text-primary">
                  Symptom Checker
                </NavLink>
              </li>
              <li>
                <NavLink to="/records" className="text-muted-foreground hover:text-primary">
                  Health Records
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Health Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  123 Health Street, Medical District, City, 12345
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground">contact@vitawellhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VitaWellHub. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
