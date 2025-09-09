import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MyContextProvider } from "../context/CartContext";
import { Poppins } from 'next/font/google';
import Footer from "./Footer";
import ClientLayoutWrapper from "./ClientLayoutWrapper"; // 🔹 ملف جديد

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wn Store",
  description: "Shop the latest collection of elegant dresses – evening gowns, casual styles & chic outfits. High-quality fabrics, affordable prices & fast delivery.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <MyContextProvider>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
          <Footer />
        </MyContextProvider>
      </body>
    </html>
  );
}
