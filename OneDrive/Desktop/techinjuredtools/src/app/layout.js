import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisableInspect from "./DisableInspect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tech Injured Tools",
  description: "Cinematic Video Studio Generator",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <DisableInspect />
        {children}
      </body>
    </html>
  );
}
