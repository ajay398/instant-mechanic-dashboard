"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Car,
  User,
  Calendar,
  Hash,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface Customer {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  customer_id: number;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  vehicle_type: string;
  customer?: Customer | null;
}

interface VehicleResponse {
  data?: Vehicle[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD VEHICLES
  // ============================================================

  const loadVehicles = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);

        // IMPORTANT:
        // Clear the search box when Refresh is clicked.
        setSearch("");
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/vehicles?page=1&limit=100`,
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
          "Failed to load vehicles.";

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
          // Ignore invalid JSON
        }

        throw new Error(message);
      }

      const result: VehicleResponse =
        await response.json();

      let vehicleData: Vehicle[] = [];

      if (Array.isArray(result)) {
        vehicleData = result;
      } else if (
        Array.isArray(result.data)
      ) {
        vehicleData = result.data;
      }

      setVehicles(vehicleData);
    } catch (err) {
      console.error(
        "Failed to load vehicles:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load vehicles."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadVehicles();
  }, []);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const filteredVehicles = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const vehicleName =
        `${vehicle.make} ${vehicle.model}`
          .toLowerCase();

      const registration =
        String(
          vehicle.registration_number || ""
        ).toLowerCase();

      const customerName =
        String(
          vehicle.customer?.name || ""
        ).toLowerCase();

      const vehicleType =
        String(
          vehicle.vehicle_type || ""
        ).toLowerCase();

      const year =
        String(vehicle.year || "");

      return (
        vehicleName.includes(value) ||
        registration.includes(value) ||
        customerName.includes(value) ||
        vehicleType.includes(value) ||
        year.includes(value)
      );
    });
  }, [vehicles, search]);

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
              Vehicles
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage customer vehicles and vehicle
              information.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">

            <Car
              size={18}
              className="text-blue-600"
            />

            <span className="text-sm font-semibold text-blue-700">
              {vehicles.length} vehicles
            </span>

          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH + REFRESH */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">

          <div className="flex flex-1 items-center gap-3">

            <Search
              size={20}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search registration, vehicle, customer..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              loadVehicles(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={17}
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
                className="mt-0.5 text-red-600"
              />

              <div>

                <h2 className="text-sm font-semibold text-red-700">
                  Unable to load vehicles
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadVehicles(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
                Loading vehicles...
              </p>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* VEHICLES TABLE */}
        {/* ================================================== */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registration
                    </th>

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Year
                    </th>

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-7 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ID
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredVehicles.map(
                    (vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* VEHICLE */}
                        <td className="px-7 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                              <Car
                                size={20}
                                className="text-blue-600"
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {vehicle.make}{" "}
                                {vehicle.model}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Vehicle #
                                {vehicle.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* REGISTRATION */}
                        <td className="px-7 py-5">

                          <div className="flex items-center gap-2">

                            <Hash
                              size={17}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-semibold text-slate-700">
                              {
                                vehicle.registration_number
                              }
                            </span>

                          </div>

                        </td>

                        {/* CUSTOMER */}
                        <td className="px-7 py-5">

                          <div className="flex items-center gap-3">

                            <User
                              size={17}
                              className="text-slate-400"
                            />

                            <div>

                              <p className="text-sm text-slate-700">
                                {vehicle
                                  .customer
                                  ?.name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Customer #
                                {
                                  vehicle.customer_id
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* YEAR */}
                        <td className="px-7 py-5">

                          <div className="flex items-center gap-2">

                            <Calendar
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-700">
                              {vehicle.year}
                            </span>

                          </div>

                        </td>

                        {/* TYPE */}
                        <td className="px-7 py-5">

                          <span className="text-sm text-slate-600">
                            {vehicle.vehicle_type ||
                              "—"}
                          </span>

                        </td>

                        {/* ID */}
                        <td className="px-7 py-5">

                          <span className="text-sm text-slate-400">
                            #{vehicle.id}
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

            {filteredVehicles.length ===
              0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                  <Car
                    size={26}
                    className="text-slate-400"
                  />

                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-800">
                  No vehicles found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try changing your search criteria."
                    : "There are no vehicles available."}
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

            {filteredVehicles.length >
              0 && (
              <div className="border-t border-slate-100 px-7 py-4">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    {
                      filteredVehicles.length
                    }
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-slate-600">
                    {vehicles.length}
                  </span>{" "}

                  vehicles

                </p>

              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}