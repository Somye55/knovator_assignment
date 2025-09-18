'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

interface NavbarWrapperProps {
  children: React.ReactNode;
}

export default function NavbarWrapper({ children }: NavbarWrapperProps) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}