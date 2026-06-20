import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us | Chain & Straps",
  description: "Get in touch with Chain & Straps. We're here to help with any questions about our luxury collections.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      {/* Hero */}
      <div className="border-b border-border-color">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Get In Touch</p>
          <h1 className="font-serif text-white text-5xl font-light mb-6">Contact Us</h1>
          <p className="text-text-muted text-sm leading-relaxed max-w-xl mx-auto">
            Our luxury concierge team is available to assist you with any inquiries — from product questions to bespoke styling advice.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Contact Info */}
          <div>
            <h2 className="font-serif text-white text-2xl mb-8">Our Details</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Email</p>
                  <a href="mailto:chainandstrap@gmail.com" className="text-text-muted text-sm hover:text-gold transition-colors">chainandstrap@gmail.com</a>
                  <p className="text-text-muted text-xs mt-1">We respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Business Hours</p>
                  <p className="text-text-muted text-sm">Monday – Friday: 9:00 AM – 7:00 PM</p>
                  <p className="text-text-muted text-sm">Saturday: 10:00 AM – 5:00 PM</p>
                  <p className="text-text-muted text-sm">Sunday: Closed</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Location</p>
                  <p className="text-text-muted text-sm">New York, USA</p>
                  <p className="text-text-muted text-sm">Worldwide Shipping Available</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-bg-secondary border border-border-color">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Pinterest</p>
              <p className="text-text-muted text-sm mb-4">Follow us for daily luxury inspiration and new arrivals.</p>
              <a href="https://pinterest.com/chainandstrap" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center text-gold text-xs tracking-widest uppercase hover:underline">
                @chainandstrap →
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            <h2 className="font-serif text-white text-2xl mb-8">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
