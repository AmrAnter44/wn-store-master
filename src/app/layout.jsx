import "./globals.css";
import { MyContextProvider } from "../context/CartContext";
import { Outfit } from "next/font/google";
import Footer from "./Footer";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const outfit = Outfit({ subsets: ["latin"], weight: ["400","500","600","700","800","900"] });

export const metadata = {
  title: "Wn Store",
  description: "Shop the latest collection of elegant dresses – evening gowns, casual styles & chic outfits. High-quality fabrics, affordable prices & fast delivery.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.className}>
      <body className={`${outfit.className} antialiased flex flex-col min-h-screen`}>
        <MyContextProvider>
          <ClientLayoutWrapper>
            {children}
            <Footer />
          </ClientLayoutWrapper>
        </MyContextProvider>
      </body>
    </html>
  );
}
