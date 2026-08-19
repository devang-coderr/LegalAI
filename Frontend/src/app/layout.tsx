import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LegalAI — Next-Generation AI-Powered Legal Intelligence Platform",
  description:
    "Supreme Court inspired architecture meets modern AI technology. Legal research, case intelligence, document OCR, precedent matching, and citizen legal assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
  lang="en"
  suppressHydrationWarning
  className={`${sansFont.variable} ${serifFont.variable} scroll-smooth`}
>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased transition-colors duration-300 selection:bg-blue-500/30 selection:text-blue-200">
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("legalai-theme")||"dark";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=t}catch(e){}})()` }} />
        {children}
      </body>
    </html>
  );
}

