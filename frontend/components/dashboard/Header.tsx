"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  CalendarCheck,
  Wrench,
  Users,
  Car,
  BarChart3,
  LayoutDashboard,
  X,
  CheckCircle2,
  Clock3,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

interface SearchItem {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const searchItems: SearchItem[] = [
  {
    label: "Dashboard",
    description: "Operations overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    description: "Manage service bookings",
    href: "/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Mechanics",
    description: "Manage mechanics",
    href: "/mechanics",
    icon: Wrench,
  },
  {
    label: "Customers",
    description: "Manage customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Vehicles",
    description: "Manage vehicles",
    href: "/vehicles",
    icon: Car,
  },
  {
    label: "Analytics",
    description: "View business analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showAdminMenu, setShowAdminMenu] =
    useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  /*
   * ---------------------------------------------------------
   * Search results
   * ---------------------------------------------------------
   */

  const filteredSearchItems = searchItems.filter(
    (item) =>
      item.label
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  /*
   * ---------------------------------------------------------
   * Close dropdowns when clicking outside
   * ---------------------------------------------------------
   */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setShowSearchResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }

      if (
        adminRef.current &&
        !adminRef.current.contains(target)
      ) {
        setShowAdminMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Search navigation
   * ---------------------------------------------------------
   */

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query = search.trim().toLowerCase();

    if (!query) {
      return;
    }

    const exactMatch = searchItems.find(
      (item) =>
        item.label.toLowerCase() === query
    );

    if (exactMatch) {
      router.push(exactMatch.href);
      setSearch("");
      setShowSearchResults(false);
      return;
    }

    const partialMatch = searchItems.find(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description
          .toLowerCase()
          .includes(query)
    );

    if (partialMatch) {
      router.push(partialMatch.href);
      setSearch("");
      setShowSearchResults(false);
    }
  }

  function handleSearchItemClick(
    href: string
  ) {
    router.push(href);
    setSearch("");
    setShowSearchResults(false);
  }

  /*
   * ---------------------------------------------------------
   * Notification
   * ---------------------------------------------------------
   */

  const notifications = [
    {
      id: 1,
      title: "New booking received",
      message:
        "A new service booking requires attention.",
      time: "Just now",
      icon: CalendarCheck,
    },
    {
      id: 2,
      title: "Mechanic update",
      message:
        "A mechanic has changed their job status.",
      time: "10 min ago",
      icon: Wrench,
    },
    {
      id: 3,
      title: "Booking completed",
      message:
        "A service booking was marked completed.",
      time: "25 min ago",
      icon: CheckCircle2,
    },
  ];

  /*
   * ---------------------------------------------------------
   * Logout
   * ---------------------------------------------------------
   */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");

    setShowAdminMenu(false);

    router.push("/login");
  }

  /*
   * ---------------------------------------------------------
   * Navigation helper
   * ---------------------------------------------------------
   */

  function navigateTo(href: string) {
    router.push(href);
    setShowAdminMenu(false);
    setShowNotifications(false);
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Operations Dashboard
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Monitor your service operations in real time
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex items-center gap-2 md:gap-4">

        {/* ===================================================
            SEARCH
        ==================================================== */}

        <div
          ref={searchRef}
          className="relative hidden md:block"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100"
          >
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => {
                setShowSearchResults(true);
              }}
              placeholder="Search..."
              className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-40 lg:w-48"
              aria-label="Search dashboard"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setShowSearchResults(false);
                }}
                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Search dropdown */}

          {showSearchResults && search && (
            <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {filteredSearchItems.length > 0 ? (
                <div className="p-2">

                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Navigation
                  </p>

                  {filteredSearchItems.map(
                    (item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() =>
                            handleSearchItemClick(
                              item.href
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Icon size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.label}
                            </p>

                            <p className="text-xs text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">

                  <Search
                    size={24}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try Dashboard, Bookings, Mechanics,
                    Customers or Analytics.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setShowNotifications(
                !showNotifications
              );
              setShowAdminMenu(false);
            }}
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* Notification header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500">
                    Recent activity
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                  3 new
                </span>
              </div>

              {/* Notifications */}

              <div className="max-h-80 overflow-y-auto">

                {notifications.map(
                  (notification) => {
                    const Icon =
                      notification.icon;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          navigateTo(
                            "/bookings"
                          )
                        }
                        className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {notification.message}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateTo("/bookings")
                }
                className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <Clock3 size={14} />
                View booking activity
              </button>
            </div>
          )}
        </div>

        {/* Divider */}

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* ===================================================
            ADMIN MENU
        ==================================================== */}

        <div
          ref={adminRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setShowAdminMenu(!showAdminMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
            aria-label="Open admin menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              AD
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Admin
              </p>

              <p className="text-xs text-slate-500">
                Operations
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform sm:block ${
                showAdminMenu
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {showAdminMenu && (
            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* User information */}

              <div className="border-b border-slate-100 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    AD
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Admin
                    </p>

                    <p className="text-xs text-slate-500">
                      Operations Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={() =>
                    navigateTo("/")
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <LayoutDashboard
                    size={17}
                    className="text-slate-500"
                  />

                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo("/analytics")
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <BarChart3
                    size={17}
                    className="text-slate-500"
                  />

                  Analytics
                </button>
              </div>

              {/* Logout */}

              <div className="border-t border-slate-100 p-2">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                    />
                  </svg>

                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}