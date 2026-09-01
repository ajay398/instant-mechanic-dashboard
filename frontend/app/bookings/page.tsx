"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  IndianRupee,
  User,
  Wrench,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// TYPES
// ============================================================

interface Booking {
  id: number;
  booking_number?: string | null;

  customer?: string | null;
  customer_id?: number | null;

  vehicle?: string | null;
  vehicle_id?: number | null;

  mechanic?: string | null;
  mechanic_id?: number | null;

  service?: string | null;
  service_category?: string | null;

  status?: string | null;

  amount?: number | null;

  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

interface BookingResponse {
  data?: Booking[];

  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "MECHANIC_ON_THE_WAY",
  "COMPLETED",
  "CANCELLED",
];

// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(status?: string | null) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

// ============================================================
// STATUS STYLE
// ============================================================

function getStatusClass(
  status?: string | null
) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "MECHANIC_ON_THE_WAY":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "ASSIGNED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
  value?: number | null
) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// ============================================================
// PAGE
// ============================================================

export default function BookingsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  const loadBookings = async (
    isRefresh = false,
    searchOverride?: string,
    statusOverride?: string
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // --------------------------------------------------------
      // IMPORTANT
      // --------------------------------------------------------
      // When Refresh is clicked, we can explicitly pass:
      //
      // searchOverride = ""
      // statusOverride = "ALL"
      //
      // This prevents the old search/filter from being sent
      // to the backend.
      // --------------------------------------------------------

      const currentSearch =
        searchOverride !== undefined
          ? searchOverride
          : search;

      const currentStatus =
        statusOverride !== undefined
          ? statusOverride
          : status;

      const params =
        new URLSearchParams();

      params.set("page", "1");
      params.set("limit", "100");

      // Add status only when it is not ALL.
      if (
        currentStatus &&
        currentStatus !== "ALL"
      ) {
        params.set(
          "status",
          currentStatus
        );
      }

      // Add search only when it is not empty.
      if (currentSearch.trim()) {
        params.set(
          "search",
          currentSearch.trim()
        );
      }

      const response = await fetch(
        `${API_URL}/api/bookings?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      // --------------------------------------------------------
      // ERROR RESPONSE
      // --------------------------------------------------------

      if (!response.ok) {
        let message =
          "Failed to load bookings.";

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

      // --------------------------------------------------------
      // RESPONSE DATA
      // --------------------------------------------------------

      const result: BookingResponse =
        await response.json();

      setBookings(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load bookings:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    // ----------------------------------------------------------
    // FIRST CLEAR THE UI FILTERS
    // ----------------------------------------------------------

    setSearch("");
    setStatus("ALL");

    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // We explicitly pass "" and "ALL" to loadBookings().
    //
    // We do NOT wait for React state to update because
    // setState() is asynchronous.
    // ----------------------------------------------------------

    await loadBookings(
      true,
      "",
      "ALL"
    );
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadBookings();
  }, [status]);

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredBookings =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return bookings;
      }

      return bookings.filter(
        (booking) => {
          return (
            String(
              booking.booking_number ||
                ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              booking.customer || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              booking.vehicle || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              booking.mechanic || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              booking.service || ""
            )
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [bookings, search]);

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
              Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor and manage customer service
              bookings.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">

            <CalendarDays
              size={17}
              className="text-blue-600"
            />

            <span className="text-sm font-semibold text-blue-700">
              {bookings.length} bookings
            </span>

          </div>

        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">

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
              placeholder="Search booking, customer, vehicle..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          >

            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "ALL"
                    ? "All Statuses"
                    : formatStatus(item)}
                </option>
              )
            )}

          </select>

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
        {/* ERROR STATE */}
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
                  Unable to load bookings
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
                Loading bookings...
              </p>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                {/* ================================================== */}
                {/* TABLE HEADER */}
                {/* ================================================== */}

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Mechanic
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Scheduled
                    </th>

                  </tr>

                </thead>

                {/* ================================================== */}
                {/* TABLE BODY */}
                {/* ================================================== */}

                <tbody>

                  {filteredBookings.map(
                    (booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* BOOKING */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                              <CalendarDays
                                size={18}
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">

                                {booking.booking_number ||
                                  `#${booking.id}`}

                              </p>

                              <p className="text-xs text-slate-400">

                                ID #{booking.id}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <User
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-700">

                              {booking.customer ||
                                "—"}

                            </span>

                          </div>

                        </td>

                        {/* VEHICLE */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-700">

                            {booking.vehicle ||
                              "—"}

                          </span>

                        </td>

                        {/* SERVICE */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="text-sm font-medium text-slate-700">

                              {booking.service ||
                                "—"}

                            </p>

                            {booking.service_category && (
                              <p className="mt-1 text-xs text-slate-400">

                                {
                                  booking.service_category
                                }

                              </p>
                            )}

                          </div>

                        </td>

                        {/* MECHANIC */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <Wrench
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-700">

                              {booking.mechanic ||
                                "Unassigned"}

                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >

                            {formatStatus(
                              booking.status
                            )}

                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">

                            <IndianRupee
                              size={14}
                            />

                            {formatCurrency(
                              booking.amount
                            ).replace(
                              "₹",
                              ""
                            )}

                          </div>

                        </td>

                        {/* SCHEDULED */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-500">

                            {formatDate(
                              booking.scheduled_at
                            )}

                          </span>

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

            {filteredBookings.length ===
              0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                  <CalendarDays
                    size={25}
                    className="text-slate-400"
                  />

                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-800">
                  No bookings found
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {search
                    ? "Try changing your search criteria."
                    : status !== "ALL"
                    ? `There are no ${formatStatus(
                        status
                      ).toLowerCase()} bookings.`
                    : "There are no bookings available."}

                </p>

                {(search ||
                  status !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus("ALL");
                    }}
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )}

            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            {filteredBookings.length >
              0 && (
              <div className="border-t border-slate-100 px-5 py-4">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    {
                      filteredBookings.length
                    }
                  </span>{" "}

                  bookings

                </p>

              </div>
            )}

          </div>
        )}

      </div>

    </main>
  );
}