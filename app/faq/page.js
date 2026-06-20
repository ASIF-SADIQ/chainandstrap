"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "How long does shipping take?", a: "Standard international shipping takes 15–25 business days. Express shipping (7–12 days) is also available. You will receive a tracking number once your order is dispatched." },
  { q: "Do you ship worldwide?", a: "Yes! We ship to 180+ countries including the US, UK, Canada, Australia, UAE, Pakistan, and Europe. Some remote locations may have longer delivery times." },
  { q: "Are your products authentic?", a: "All products on Chain & Straps are 100% authentic luxury goods. We source directly from verified suppliers and guarantee the authenticity of every item." },
  { q: "Can I return or exchange an item?", a: "Yes. We accept returns within 7 days of delivery, provided the item is unused, in original packaging, and with all tags intact. Please email chainandstrap@gmail.com to initiate a return." },
  { q: "How do I track my order?", a: "Once your order ships, you will receive a confirmation email with a tracking number. Use this to monitor your shipment in real time." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, and other secure payment methods. All transactions are SSL encrypted for your security." },
  { q: "How do I create an account?", a: "Click 'Register' and fill in your name, email, and password. You will receive a 6-digit OTP to verify your email before your account is activated." },
  { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a reset OTP. Use it to set a new password within 10 minutes." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 12 hours of placement. Contact us immediately at chainandstrap@gmail.com with your order number." },
  { q: "How do I contact customer support?", a: "Email us at chainandstrap@gmail.com. We respond within 24 hours on business days (Mon–Fri, 9AM–7PM)." },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Help Center</p>
          <h1 className="font-serif text-white text-5xl font-light mb-4">Frequently Asked Questions</h1>
          <p className="text-text-muted text-sm">Everything you need to know about Chain &amp; Straps</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`border transition-colors ${open === i ? 'border-gold' : 'border-border-color'} bg-bg-secondary`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center px-6 py-5 text-left">
                <span className={`text-sm font-semibold tracking-wide ${open === i ? 'text-gold' : 'text-white'}`}>{faq.q}</span>
                {open === i ? <ChevronUp size={18} className="text-gold flex-shrink-0" /> : <ChevronDown size={18} className="text-text-muted flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <div className="h-px bg-border-color mb-4" />
                  <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16 bg-bg-secondary border border-gold/30 p-8 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-3">Still have questions?</p>
          <p className="text-white font-serif text-xl mb-2">We&apos;re Here to Help</p>
          <p className="text-text-muted text-sm mb-6">Our luxury concierge team responds within 24 hours.</p>
          <a href="mailto:chainandstrap@gmail.com" className="inline-block bg-gold text-black px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors">
            CONTACT US
          </a>
        </div>
      </div>
    </div>
  );
}
