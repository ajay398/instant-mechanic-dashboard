// frontend/components/dashboard/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Users,
  Car,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    name: "Mechanics",
    href: "/mechanics",
    icon: Wrench,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Vehicles",
    href: "/vehicles",
    icon: Car,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Instant
              <span className="text-blue-500">
                Mechanic
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Operations Center
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Menu */}
        <div className="px-4 pt-8">
          <p className="mb-4 px-5 text-xs font-bold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      item.href
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                  />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="mt-auto border-t border-slate-800 px-4 py-5">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-medium transition-all ${
              pathname.startsWith("/settings")
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Settings
              size={22}
              strokeWidth={1.8}
            />

            <span>Settings</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "access_token"
              );

              window.location.href =
                "/login";
            }}
            className="mt-2 flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-base font-medium text-slate-400 transition-all hover:bg-slate-900 hover:text-red-400"
          >
            <LogOut
              size={22}
              strokeWidth={1.8}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}