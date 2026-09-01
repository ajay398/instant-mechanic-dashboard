// frontend/components/dashboard/BookingTable.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  X,
  UserCog,
  RefreshCw,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface Booking {
  id: number;
  booking_number: string;
  customer: string | null;
  customer_id?: number;
  vehicle: string | null;
  vehicle_id?: number;
  mechanic: string | null;
  mechanic_id?: number | null;
  service: string | null;
  service_category?: string | null;
  status: string;
  amount: number;
  scheduled_at: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

interface Mechanic {
  id: number;
  name: string;
  phone?: string;
  status?: string;
  rating?: number;
}

interface BookingTableProps {
  bookings: Booking[];
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  pages: number;
}

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getStatusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "ASSIGNED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "PENDING":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 size={13} />;

    case "IN_PROGRESS":
      return <Clock3 size={13} />;

    case "CANCELLED":
      return <XCircle size={13} />;

    case "PENDING":
      return <AlertCircle size={13} />;

    default:
      return <CheckCircle2 size={13} />;
  }
}

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function BookingTable({
  bookings,
  search,
  setSearch,
  status,
  setStatus,
  page,
  setPage,
  pages,
}: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [mechanics, setMechanics] =
    useState<Mechanic[]>([]);

  const [mechanicsLoading, setMechanicsLoading] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [assigningMechanic, setAssigningMechanic] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [localSearch, setLocalSearch] =
    useState(search);

  const [localStatus, setLocalStatus] =
    useState(status);


  useEffect(() => {
    setLocalSearch(search);
  }, [search]);


  useEffect(() => {
    setLocalStatus(status);
  }, [status]);


  useEffect(() => {
    async function loadMechanics() {
      try {
        setMechanicsLoading(true);

        const response = await fetch(
          `${API_URL}/api/mechanics`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load mechanics"
          );
        }

        const data = await response.json();

        const mechanicData =
          Array.isArray(data)
            ? data
            : data.data || [];

        setMechanics(mechanicData);
      } catch (err) {
        console.error(err);
      } finally {
        setMechanicsLoading(false);
      }
    }

    loadMechanics();
  }, []);


  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchValue =
        localSearch.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        booking.booking_number
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.customer
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.vehicle
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.mechanic
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.service
          ?.toLowerCase()
          .includes(searchValue)
      );
    });
  }, [bookings, localSearch]);


  function handleSearch(
    value: string
  ) {
    setLocalSearch(value);

    setSearch(value);

    setPage(1);
  }


  function handleStatusFilter(
    value: string
  ) {
    const newStatus =
      value === "ALL"
        ? ""
        : value;

    setLocalStatus(newStatus);

    setStatus(newStatus);

    setPage(1);
  }


  async function updateStatus(
    bookingId: number,
    newStatus: string
  ) {
    try {
      setUpdatingStatus(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
            data?.detail ||
            "Failed to update booking status"
        );
      }

      setMessage(
        "Booking status updated successfully."
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(
          data.data
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "booking-updated",
          {
            detail: data,
          }
        )
      );

    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Failed to update booking."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }


  async function assignMechanic(
    bookingId: number,
    mechanicId: string
  ) {
    try {
      setAssigningMechanic(true);
      setMessage("");
      setError("");

      const selectedId =
        mechanicId === ""
          ? null
          : Number(mechanicId);

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/mechanic`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            mechanic_id: selectedId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
            data?.detail ||
            "Failed to assign mechanic"
        );
      }

      setMessage(
        "Mechanic assignment updated successfully."
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(
          data.data
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "booking-updated",
          {
            detail: data,
          }
        )
      );

    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Failed to assign mechanic."
      );
    } finally {
      setAssigningMechanic(false);
    }
  }


  function openBooking(
    booking: Booking
  ) {
    setMessage("");
    setError("");
    setSelectedBooking(
      booking
    );
  }


  function closeBooking() {
    setSelectedBooking(null);
    setMessage("");
    setError("");
  }


  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage bookings, statuses and mechanic assignments.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw size={15} />

              {filteredBookings.length} bookings
            </div>

          </div>


          {/* Search + Filter */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                value={localSearch}
                onChange={(event) =>
                  handleSearch(
                    event.target.value
                  )
                }
                placeholder="Search booking, customer, vehicle, mechanic..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

            </div>


            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">

              <Filter
                size={17}
                className="text-slate-400"
              />

              <select
                value={
                  localStatus || "ALL"
                }
                onChange={(event) =>
                  handleStatusFilter(
                    event.target.value
                  )
                }
                className="bg-transparent py-3 text-sm font-medium text-slate-700 outline-none"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option === "ALL"
                        ? "All Statuses"
                        : formatStatus(
                            option
                          )}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

        </div>


        {/* Messages */}
        {(message || error) && (
          <div className="px-5 pt-4">

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

          </div>
        )}


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

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

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredBookings.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-20 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <Search
                        size={32}
                        className="text-slate-300"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        No bookings found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filter.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredBookings.map(
                  (booking) => (

                    <tr
                      key={booking.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      {/* Booking */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-800">
                          {booking.booking_number}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          #{booking.id}
                        </p>

                      </td>


                      {/* Customer */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-slate-700">
                          {booking.customer ||
                            "-"}
                        </p>

                      </td>


                      {/* Vehicle */}
                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-600">
                          {booking.vehicle ||
                            "-"}
                        </p>

                      </td>


                      {/* Service */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-slate-700">
                          {booking.service ||
                            "-"}
                        </p>

                        {booking.service_category && (
                          <p className="mt-1 text-xs text-slate-400">
                            {
                              booking.service_category
                            }
                          </p>
                        )}

                      </td>


                      {/* Mechanic */}
                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-600">
                          {booking.mechanic ||
                            "Unassigned"}
                        </p>

                      </td>


                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(
                            booking.status
                          )}

                          {formatStatus(
                            booking.status
                          )}
                        </span>

                      </td>


                      {/* Amount */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-800">
                          ₹
                          {Number(
                            booking.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </td>


                      {/* Action */}
                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openBooking(
                              booking
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye
                            size={14}
                          />

                          View
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">

          <p className="text-xs text-slate-500">
            Page {page} of{" "}
            {Math.max(pages, 1)}
          </p>


          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  Math.max(
                    1,
                    page - 1
                  )
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>


            <button
              type="button"
              disabled={
                page >= pages
              }
              onClick={() =>
                setPage(
                  Math.min(
                    pages,
                    page + 1
                  )
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>

        </div>

      </div>


      {/* Booking Details Modal */}
      {selectedBooking && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Booking Details
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {
                    selectedBooking.booking_number
                  }
                </h3>

              </div>

              <button
                type="button"
                onClick={
                  closeBooking
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>


            <div className="space-y-6 p-6">

              {/* Basic Information */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      selectedBooking.customer ||
                      "-"
                    }
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Vehicle
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      selectedBooking.vehicle ||
                      "-"
                    }
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Service
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      selectedBooking.service ||
                      "-"
                    }
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    ₹
                    {Number(
                      selectedBooking.amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>


              {/* Schedule */}
              <div>

                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Schedule
                </h4>

                <div className="rounded-xl border border-slate-200 p-4">

                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedBooking.scheduled_at
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatTime(
                      selectedBooking.scheduled_at
                    )}
                  </p>

                </div>

              </div>


              {/* Status */}
              <div>

                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Update Status
                </h4>

                <div className="flex flex-wrap gap-2">

                  {STATUS_OPTIONS
                    .filter(
                      (item) =>
                        item !== "ALL"
                    )
                    .map(
                      (item) => (

                        <button
                          key={item}
                          type="button"
                          disabled={
                            updatingStatus
                          }
                          onClick={() =>
                            updateStatus(
                              selectedBooking.id,
                              item
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            selectedBooking.status ===
                            item
                              ? getStatusClass(
                                  item
                                )
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >

                          {updatingStatus &&
                          selectedBooking.status !==
                            item ? (
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            getStatusIcon(
                              item
                            )
                          )}

                          {formatStatus(
                            item
                          )}

                        </button>

                      )
                    )}

                </div>

              </div>


              {/* Mechanic */}
              <div>

                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Assign Mechanic
                </h4>

                <div className="flex items-center gap-3">

                  <UserCog
                    size={18}
                    className="text-slate-400"
                  />

                  <select
                    value={
                      selectedBooking.mechanic_id ??
                      ""
                    }
                    disabled={
                      assigningMechanic ||
                      mechanicsLoading
                    }
                    onChange={(event) =>
                      assignMechanic(
                        selectedBooking.id,
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {mechanics.map(
                      (mechanic) => (
                        <option
                          key={
                            mechanic.id
                          }
                          value={
                            mechanic.id
                          }
                        >
                          {
                            mechanic.name
                          }
                          {mechanic.status
                            ? ` — ${mechanic.status}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>


              {/* Notes */}
              {selectedBooking.notes && (
                <div>

                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    Notes
                  </h4>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {
                      selectedBooking.notes
                    }
                  </div>

                </div>
              )}

            </div>


            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={
                  closeBooking
                }
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}
    </>
  );
}