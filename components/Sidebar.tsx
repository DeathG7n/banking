"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import PlaidLink from "./PlaidLink";

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();

  const admin = {
    imgURL: "/icons/home.svg",
    route: "/users",
    label: "Users",
  };
  const isActiveForAdmin =
    pathname === admin.route || pathname.startsWith(`${admin.route}/`);

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-1">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
            className="size-[24px] max-xl:size-14"
          />
          <h1 className="sidebar-logo">Horizon</h1>
        </Link>

        {user.admin && <Link
          href={admin.route}
          key={admin.label}
          className={cn("sidebar-link", { "bg-bank-green-gradient": isActiveForAdmin })}
        >
          <div className="relative size-4">
            <Image
              src={admin.imgURL}
              alt={admin.label}
              fill
              className={cn({
                "brightness-[3] invert-0": isActiveForAdmin,
              })}
            />
          </div>
          <p className={cn("sidebar-label", { "!text-white": isActiveForAdmin })}>
            {admin.label}
          </p>
        </Link>}
        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("sidebar-link", {
                "bg-bank-green-gradient": isActive,
              })}
            >
              <div className="relative size-4">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    "brightness-[3] invert-0": isActive,
                  })}
                />
              </div>
              <p className={cn("sidebar-label", { "!text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          );
        })}

        {/* <PlaidLink user={user} /> */}
      </nav>

      <Footer user={user} />
    </section>
  );
};

export default Sidebar;
