"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Wrench,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface Mechanic {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  specialization?: string | null;
  experience_years?: number | null;
  rating?: number | null;
  created_at?: string | null;
}

interface MechanicResponse {
  data?: Mechanic[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function getInitials(name?: string | null) {
  if (!name) {
    return "ME";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(status?: string | null) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status?: string | null) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  if (
    normalized === "available" ||
    normalized === "active" ||
    normalized === "online"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "busy" ||
    normalized === "assigned" ||
    normalized === "working" ||
    normalized === "on_job"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized === "offline" ||
    normalized === "inactive"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

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

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMechanics = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);

        // Clear existing search when Refresh is clicked.
        setSearch("");
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/mechanics?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message =
          "Failed to load mechanics.";

        try {
          const errorData =
            await response.json();

          if (
            typeof errorData?.detail ===
            "string"
          ) {
            message = errorData.detail;
          }
        } catch {
          // Ignore invalid JSON.
        }

        throw new Error(message);
      }

      const result: MechanicResponse =
        await response.json();

      const mechanicData =
        Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [];

      setMechanics(mechanicData);
    } catch (err) {
      console.error(
        "Failed to load mechanics:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load mechanics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMechanics();
  }, []);

  const filteredMechanics = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return mechanics;
    }

    return mechanics.filter((mechanic) => {
      return (
        String(mechanic.name || "")
          .toLowerCase()
          .includes(value) ||
        String(mechanic.email || "")
          .toLowerCase()
          .includes(value) ||
        String(mechanic.phone || "")
          .toLowerCase()
          .includes(value) ||
        String(mechanic.city || "")
          .toLowerCase()
          .includes(value) ||
        String(mechanic.status || "")
          .toLowerCase()
          .includes(value) ||
        String(mechanic.specialization || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [mechanics, search]);

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
              Mechanics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor mechanic availability and performance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">

            <Activity
              size={17}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              {mechanics.length} mechanics
            </span>

          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH + REFRESH */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">

          <div className="flex flex-1 items-center gap-3">

            <Search
              size={19}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search mechanic, city or status..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              loadMechanics(true)
            }
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

            Refresh

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
                  Unable to load mechanics
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadMechanics(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={15} />

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
                Loading mechanics...
              </p>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Mechanic
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Specialization
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Experience
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Added
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredMechanics.map(
                    (mechanic) => (
                      <tr
                        key={mechanic.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* Mechanic */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {getInitials(
                                mechanic.name
                              )}
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {mechanic.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Mechanic #
                                {mechanic.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Contact */}
                        <td className="px-5 py-5">

                          <div className="space-y-2">

                            <div className="flex items-center gap-2 text-xs text-slate-600">

                              <Mail size={14} />

                              <span>
                                {mechanic.email ||
                                  "—"}
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">

                              <Phone size={14} />

                              <span>
                                {mechanic.phone ||
                                  "—"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* Location */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin size={15} />

                            {mechanic.city ||
                              "—"}

                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                              mechanic.status
                            )}`}
                          >
                            {formatStatus(
                              mechanic.status
                            )}
                          </span>

                        </td>

                        {/* Specialization */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Wrench
                              size={15}
                              className="text-slate-400"
                            />

                            {mechanic.specialization ||
                              "General Mechanic"}

                          </div>

                        </td>

                        {/* Experience */}
                        <td className="px-5 py-5">

                          <span className="text-sm font-medium text-slate-700">

                            {mechanic.experience_years !=
                            null
                              ? `${mechanic.experience_years} years`
                              : "—"}

                          </span>

                        </td>

                        {/* Added */}
                        <td className="px-5 py-5 text-sm text-slate-500">

                          {formatDate(
                            mechanic.created_at
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

            {filteredMechanics.length ===
              0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                  <User
                    size={25}
                    className="text-slate-400"
                  />

                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-800">
                  No mechanics found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try changing your search criteria."
                    : "There are no mechanics available."}
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

            {filteredMechanics.length >
              0 && (
              <div className="border-t border-slate-100 px-5 py-4">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    {
                      filteredMechanics.length
                    }
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-slate-600">
                    {mechanics.length}
                  </span>{" "}

                  mechanics

                </p>

              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}