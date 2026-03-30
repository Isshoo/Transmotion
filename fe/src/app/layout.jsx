import { Oxygen } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Transmotion",
    default: "Transmotion",
  },
  description:
    "Transmotion App - Website deteksi emosi berbasis teks menggunakan model transformer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${oxygen.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
