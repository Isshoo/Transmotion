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
    "Transmotion - Multilingual text classification platform using transformer models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${oxygen.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
