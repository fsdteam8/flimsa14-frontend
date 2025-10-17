import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/provider/AppProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "video-react/dist/video-react.css";
import AuthProvider from "@/components/provider/AuthProvider";
import "video.js/dist/video-js.css";


const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Azlo | Home",
  description: "movie website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
            <ToastContainer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
