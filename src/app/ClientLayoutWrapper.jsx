"use client";

import { usePathname } from "next/navigation";
import NavT from "./NavT";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // الصفحات اللي مش عايز يظهر فيها NavT
  const hiddenRoutes = ["/"];
  const hideNav = hiddenRoutes.includes(pathname);

  return (
    <>
      {!hideNav && <NavT />}
      <main className="flex-grow">{children}</main>
    </>
  );
}
