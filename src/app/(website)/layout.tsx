import Footer from "@/components/shared/footer/Footer";
import Navbar from "@/components/shared/navbar/Navbar";
import React from "react";
import "@/app/globals.css";
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
