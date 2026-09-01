"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// TYPES
// ============================================================

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  booking_count: number;
  total_spent: number;
  created_at: string;
}

interface CustomerResponse {
  data?: Customer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value?: number | null) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// ============================================================
// GET INITIALS
// ============================================================

function getInitials(name?: string) {
  if (!name) {
    return "CU";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ============================================================
// PAGE
// ============================================================

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD CUSTOMERS
  // ============================================================

  async function loadCustomers(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/customers`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      // ========================================================
      // ERROR
      // ========================================================

      if (!response.ok) {
        let message =
          "Failed to load customers.";

        try {
          const errorData =
            await response.json();

          if (
            typeof errorData?.detail ===
            "string"
          ) {
            message =
              errorData.detail;
          }
        } catch {
          // Ignore invalid JSON.
        }

        throw new Error(message);
      }

      // ========================================================
      // RESPONSE
      // ========================================================

      const result: CustomerResponse =
        await response.json();

      const customerData =
        Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [];

      setCustomers(customerData);
    } catch (err) {
      console.error(
        "Failed to load customers:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    // ----------------------------------------------------------
    // Clear the search box immediately.
    // ----------------------------------------------------------

    setSearch("");

    // ----------------------------------------------------------
    // Load fresh customer data.
    // ----------------------------------------------------------

    await loadCustomers(true);
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredCustomers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          String(customer.name || "")
            .toLowerCase()
            .includes(value) ||

          String(customer.email || "")
            .toLowerCase()
            .includes(value) ||

          String(customer.phone || "")
            .toLowerCase()
            .includes(value) ||

          String(customer.city || "")
            .toLowerCase()
            .includes(value)
      );
    }, [customers, search]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Operations
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Customers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage customer information and activity.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">

            <Users
              size={17}
              className="text-blue-600"
            />

            <span className="text-sm font-semibold text-blue-700">
              {customers.length} customers
            </span>

          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH + REFRESH */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">

          {/* SEARCH */}

          <div className="flex flex-1 items-center gap-3">

            <Search
              size={19}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, email, phone or city..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>

                <h2 className="text-sm font-semibold text-red-700">
                  Unable to load customers
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >

                  <RefreshCw
                    size={15}
                  />

                  Try Again

                </button>

              </div>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col items-center">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading customers...
              </p>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* CUSTOMERS TABLE */}
        {/* ================================================== */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                {/* TABLE HEADER */}

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bookings
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total Spent
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>

                  </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody>

                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">

                              {getInitials(
                                customer.name
                              )}

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {customer.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Customer #
                                {customer.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4">

                          <div className="space-y-2">

                            <div className="flex items-center gap-2 text-xs text-slate-600">

                              <Mail
                                size={14}
                              />

                              <span>
                                {customer.email ||
                                  "—"}
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">

                              <Phone
                                size={14}
                              />

                              <span>
                                {customer.phone ||
                                  "—"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* LOCATION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin
                              size={15}
                            />

                            <span>
                              {customer.city ||
                                "—"}
                            </span>

                          </div>

                        </td>

                        {/* BOOKINGS */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

                            {Number(
                              customer.booking_count ||
                                0
                            )}

                          </span>

                        </td>

                        {/* TOTAL SPENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">

                            <IndianRupee
                              size={14}
                            />

                            {formatCurrency(
                              customer.total_spent
                            ).replace(
                              "₹",
                              ""
                            )}

                          </div>

                        </td>

                        {/* JOINED */}

                        <td className="px-5 py-4 text-sm text-slate-500">

                          {formatDate(
                            customer.created_at
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* ================================================== */}
            {/* EMPTY STATE */}
            {/* ================================================== */}

            {filteredCustomers.length ===
              0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                  <Users
                    size={25}
                    className="text-slate-400"
                  />

                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-800">
                  No customers found
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {search
                    ? "Try changing your search criteria."
                    : "There are no customers available."}

                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear Search
                  </button>
                )}

              </div>
            )}

            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            {filteredCustomers.length >
              0 && (
              <div className="border-t border-slate-100 px-5 py-4">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    {
                      filteredCustomers.length
                    }
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-slate-600">
                    {customers.length}
                  </span>{" "}

                  customers

                </p>

              </div>
            )}

          </div>
        )}

      </div>

    </main>
  );
}