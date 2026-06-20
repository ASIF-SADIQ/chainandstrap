"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Order Inquiry",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;

    const mailtoUrl = `mailto:chainandstrap@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    // Optional: Clear form after opening mail client
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subject: "Order Inquiry",
      message: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-text-muted text-xs tracking-widest uppercase mb-2 block">First Name</label>
          <input required name="firstName" type="text" placeholder="John" value={formData.firstName} onChange={handleChange}
            className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="text-text-muted text-xs tracking-widest uppercase mb-2 block">Last Name</label>
          <input required name="lastName" type="text" placeholder="Doe" value={formData.lastName} onChange={handleChange}
            className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
        </div>
      </div>
      <div>
        <label className="text-text-muted text-xs tracking-widest uppercase mb-2 block">Email Address</label>
        <input required name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange}
          className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
      </div>
      <div>
        <label className="text-text-muted text-xs tracking-widest uppercase mb-2 block">Subject</label>
        <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors">
          <option>Order Inquiry</option>
          <option>Product Question</option>
          <option>Return / Refund</option>
          <option>Shipping Issue</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="text-text-muted text-xs tracking-widest uppercase mb-2 block">Message</label>
        <textarea required name="message" rows={5} placeholder="How can we help you?" value={formData.message} onChange={handleChange}
          className="w-full bg-bg-secondary border border-border-color text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
      </div>
      <button type="submit"
        className="w-full bg-gold text-black py-4 text-center text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors">
        SEND MESSAGE
      </button>
    </form>
  );
}
