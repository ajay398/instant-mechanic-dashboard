"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Download,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import BookingsChart from "@/components/dashboard/BookingsChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatusChart from "@/components/dashboard/StatusChart";
import CategoryChart from "@/components/dashboard/CategoryChart";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// TYPES
// ============================================================

interface BookingOverTime {
  date: string;
  bookings: number;
}

interface RevenueOverTime {
  date: string;
  revenue: number;
}

interface BookingStatus {
  status: string;
  count: number;
}

interface ServiceBreakdown {
  service: string;
  count: number;
}

interface AnalyticsResponse {
  bookings_over_time?: BookingOverTime[];
  revenue_over_time?: RevenueOverTime[];
  booking_status?: BookingStatus[];
  service_breakdown?: ServiceBreakdown[];
}

type RangeOption =
  | "7"
  | "30"
  | "90"
  | "custom"
  | "all";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  )}`;
}

function formatDateForAPI(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateDaysAgo(days: number) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  date.setDate(
    date.getDate() - days
  );

  return date;
}

// ============================================================
// PAGE
// ============================================================

export default function AnalyticsPage() {
  // ==========================================================
  // ANALYTICS DATA
  // ==========================================================

  const [analytics, setAnalytics] =
    useState<AnalyticsResponse | null>(
      null
    );

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState("");

  // ==========================================================
  // DATE FILTER
  // ==========================================================

  const [range, setRange] =
    useState<RangeOption>("30");

  const [
    customStartDate,
    setCustomStartDate,
  ] = useState("");

  const [
    customEndDate,
    setCustomEndDate,
  ] = useState("");

  // ==========================================================
  // LOAD ANALYTICS
  // ==========================================================

  const loadAnalytics = async (
    isRefresh = false,
    selectedRange: RangeOption = range,
    selectedStartDate = customStartDate,
    selectedEndDate = customEndDate
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      let url =
        `${API_URL}/api/analytics`;

      // ======================================================
      // LAST 7 DAYS
      // ======================================================

      if (selectedRange === "7") {
        const endDate = new Date();

        const startDate =
          getDateDaysAgo(6);

        url +=
          `?start_date=${formatDateForAPI(
            startDate
          )}` +
          `&end_date=${formatDateForAPI(
            endDate
          )}`;
      }

      // ======================================================
      // LAST 30 DAYS
      // ======================================================

      if (selectedRange === "30") {
        const endDate = new Date();

        const startDate =
          getDateDaysAgo(29);

        url +=
          `?start_date=${formatDateForAPI(
            startDate
          )}` +
          `&end_date=${formatDateForAPI(
            endDate
          )}`;
      }

      // ======================================================
      // LAST 90 DAYS
      // ======================================================

      if (selectedRange === "90") {
        const endDate = new Date();

        const startDate =
          getDateDaysAgo(89);

        url +=
          `?start_date=${formatDateForAPI(
            startDate
          )}` +
          `&end_date=${formatDateForAPI(
            endDate
          )}`;
      }

      // ======================================================
      // CUSTOM RANGE
      // ======================================================

      if (
        selectedRange === "custom"
      ) {
        if (
          !selectedStartDate ||
          !selectedEndDate
        ) {
          setError(
            "Please select both start and end dates."
          );

          return;
        }

        if (
          selectedStartDate >
          selectedEndDate
        ) {
          setError(
            "Start date must be before or equal to end date."
          );

          return;
        }

        url +=
          `?start_date=${selectedStartDate}` +
          `&end_date=${selectedEndDate}`;
      }

      // ======================================================
      // CACHE BUSTER
      // ======================================================

      const separator =
        url.includes("?")
          ? "&"
          : "?";

      url +=
        `${separator}t=${Date.now()}`;

      console.log(
        "Analytics API:",
        url
      );

      // ======================================================
      // API REQUEST
      // ======================================================

      const response = await fetch(
        url,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            "Cache-Control":
              "no-cache",

            Pragma:
              "no-cache",
          },

          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message =
          "Failed to load analytics.";

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

          if (
            typeof errorData?.message ===
            "string"
          ) {
            message =
              errorData.message;
          }
        } catch {
          // Ignore invalid JSON.
        }

        throw new Error(message);
      }

      const data: AnalyticsResponse =
        await response.json();

      // ======================================================
      // NORMALIZE DATA
      // ======================================================

      setAnalytics({
        bookings_over_time:
          Array.isArray(
            data.bookings_over_time
          )
            ? data.bookings_over_time
            : [],

        revenue_over_time:
          Array.isArray(
            data.revenue_over_time
          )
            ? data.revenue_over_time
            : [],

        booking_status:
          Array.isArray(
            data.booking_status
          )
            ? data.booking_status
            : [],

        service_breakdown:
          Array.isArray(
            data.service_breakdown
          )
            ? data.service_breakdown
            : [],
      });
    } catch (err) {
      console.error(
        "Analytics error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAnalytics(
      false,
      "30",
      "",
      ""
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // RANGE CHANGE
  // ==========================================================

  const handleRangeChange = (
    value: RangeOption
  ) => {
    setRange(value);

    if (value !== "custom") {
      loadAnalytics(
        true,
        value,
        customStartDate,
        customEndDate
      );
    }
  };

  // ==========================================================
  // APPLY CUSTOM RANGE
  // ==========================================================

  const handleApplyCustomRange =
    () => {
      loadAnalytics(
        true,
        "custom",
        customStartDate,
        customEndDate
      );
    };

  // ==========================================================
  // DATA
  // ==========================================================

  const bookingData =
    analytics?.bookings_over_time ||
    [];

  const revenueData =
    analytics?.revenue_over_time ||
    [];

  const statusData =
    analytics?.booking_status ||
    [];

  const serviceData =
    analytics?.service_breakdown ||
    [];

  // ==========================================================
  // CATEGORY DATA
  // ==========================================================

  const categoryData = useMemo(() => {
    return serviceData.map(
      (item) => ({
        category:
          item.service,

        count: Number(
          item.count || 0
        ),
      })
    );
  }, [serviceData]);

  // ==========================================================
  // TOTAL BOOKINGS
  // ==========================================================

  const totalBookings = useMemo(() => {
    return statusData.reduce(
      (total, item) =>
        total +
        Number(
          item.count || 0
        ),
      0
    );
  }, [statusData]);

  // ==========================================================
  // TOTAL REVENUE
  // ==========================================================

  const totalRevenue = useMemo(() => {
    return revenueData.reduce(
      (total, item) =>
        total +
        Number(
          item.revenue || 0
        ),
      0
    );
  }, [revenueData]);

  // ==========================================================
  // COMPLETED BOOKINGS
  // ==========================================================

  const completedBookings =
    useMemo(() => {
      const completed =
        statusData.find(
          (item) =>
            item.status ===
            "COMPLETED"
        );

      return Number(
        completed?.count || 0
      );
    }, [statusData]);

  // ==========================================================
  // CANCELLED BOOKINGS
  // ==========================================================

  const cancelledBookings =
    useMemo(() => {
      const cancelled =
        statusData.find(
          (item) =>
            item.status ===
            "CANCELLED"
        );

      return Number(
        cancelled?.count || 0
      );
    }, [statusData]);

  // ==========================================================
  // COMPLETION RATE
  // ==========================================================

  const completionRate =
    useMemo(() => {
      if (
        totalBookings === 0
      ) {
        return 0;
      }

      return (
        (completedBookings /
          totalBookings) *
        100
      );
    }, [
      completedBookings,
      totalBookings,
    ]);

  // ==========================================================
  // CANCELLATION RATE
  // ==========================================================

  const cancellationRate =
    useMemo(() => {
      if (
        totalBookings === 0
      ) {
        return 0;
      }

      return (
        (cancelledBookings /
          totalBookings) *
        100
      );
    }, [
      cancelledBookings,
      totalBookings,
    ]);

  // ==========================================================
  // AVERAGE REVENUE PER BOOKING
  // ==========================================================

  const averageRevenuePerBooking =
    useMemo(() => {
      if (
        totalBookings === 0
      ) {
        return 0;
      }

      return (
        totalRevenue /
        totalBookings
      );
    }, [
      totalRevenue,
      totalBookings,
    ]);

  // ==========================================================
  // TOP SERVICE
  // ==========================================================

  const topService = useMemo(() => {
    if (
      serviceData.length === 0
    ) {
      return "—";
    }

    const sortedServices = [
      ...serviceData,
    ].sort(
      (a, b) =>
        Number(b.count || 0) -
        Number(a.count || 0)
    );

    return (
      sortedServices[0]?.service ||
      "—"
    );
  }, [serviceData]);

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const exportAnalyticsCSV = () => {
    if (!analytics) {
      return;
    }

    const rows: string[] = [];

    // ========================================================
    // TITLE
    // ========================================================

    rows.push(
      "Instant Mechanic Analytics"
    );

    rows.push("");

    // ========================================================
    // KPI SUMMARY
    // ========================================================

    rows.push(
      "KPI Summary"
    );

    rows.push(
      "Metric,Value"
    );

    rows.push(
      `Total Bookings,${totalBookings}`
    );

    rows.push(
      `Total Revenue,${totalRevenue.toFixed(
        2
      )}`
    );

    rows.push(
      `Completed Bookings,${completedBookings}`
    );

    rows.push(
      `Cancelled Bookings,${cancelledBookings}`
    );

    rows.push(
      `Completion Rate,${completionRate.toFixed(
        2
      )}%`
    );

    rows.push(
      `Cancellation Rate,${cancellationRate.toFixed(
        2
      )}%`
    );

    rows.push(
      `Average Revenue per Booking,${averageRevenuePerBooking.toFixed(
        2
      )}`
    );

    rows.push(
      `Top Service,"${topService.replace(
        /"/g,
        '""'
      )}"`
    );

    // ========================================================
    // BOOKINGS + REVENUE
    // ========================================================

    rows.push("");
    rows.push("");

    rows.push(
      "Bookings and Revenue"
    );

    rows.push(
      "Date,Bookings,Revenue"
    );

    const bookingMap =
      new Map(
        bookingData.map(
          (item) => [
            item.date,
            item.bookings,
          ]
        )
      );

    const revenueMap =
      new Map(
        revenueData.map(
          (item) => [
            item.date,
            item.revenue,
          ]
        )
      );

    const dates =
      Array.from(
        new Set([
          ...bookingData.map(
            (item) => item.date
          ),

          ...revenueData.map(
            (item) => item.date
          ),
        ])
      ).sort();

    dates.forEach(
      (date) => {
        const bookings =
          bookingMap.get(
            date
          ) ?? 0;

        const revenue =
          revenueMap.get(
            date
          ) ?? 0;

        rows.push(
          [
            date,
            bookings,
            Number(
              revenue
            ).toFixed(2),
          ].join(",")
        );
      }
    );

    // ========================================================
    // BOOKING STATUS
    // ========================================================

    rows.push("");
    rows.push("");

    rows.push(
      "Booking Status"
    );

    rows.push(
      "Status,Count"
    );

    statusData.forEach(
      (item) => {
        rows.push(
          [
            `"${item.status.replace(
              /"/g,
              '""'
            )}"`,
            item.count,
          ].join(",")
        );
      }
    );

    // ========================================================
    // SERVICE BREAKDOWN
    // ========================================================

    rows.push("");
    rows.push("");

    rows.push(
      "Service Breakdown"
    );

    rows.push(
      "Service,Count"
    );

    serviceData.forEach(
      (item) => {
        rows.push(
          [
            `"${item.service.replace(
              /"/g,
              '""'
            )}"`,
            item.count,
          ].join(",")
        );
      }
    );

    // ========================================================
    // CREATE CSV
    // ========================================================

    const csvContent =
      rows.join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.download =
      `instant-mechanic-analytics-${date}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Business Intelligence
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track bookings, revenue,
              services and operational
              performance.
            </p>

          </div>

          {/* ================================================== */}
          {/* ACTION BUTTONS */}
          {/* ================================================== */}

          <div className="flex flex-wrap items-center gap-3">

            {/* EXPORT */}

            <button
              type="button"
              onClick={
                exportAnalyticsCSV
              }
              disabled={
                loading ||
                refreshing ||
                !analytics
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Download
                size={16}
              />

              Export CSV

            </button>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadAnalytics(
                  true,
                  range,
                  customStartDate,
                  customEndDate
                )
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

        </div>

        {/* ================================================== */}
        {/* DATE RANGE */}
        {/* ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={19}
                className="text-blue-600"
              />

              <h2 className="text-sm font-bold text-slate-900">
                Date Range
              </h2>

            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

              {/* PRESET */}

              <div className="w-full lg:w-56">

                <label
                  htmlFor="analytics-range"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  Preset
                </label>

                <select
                  id="analytics-range"
                  value={range}
                  onChange={(event) =>
                    handleRangeChange(
                      event.target
                        .value as RangeOption
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="7">
                    Last 7 Days
                  </option>

                  <option value="30">
                    Last 30 Days
                  </option>

                  <option value="90">
                    Last 90 Days
                  </option>

                  <option value="custom">
                    Custom Range
                  </option>

                  <option value="all">
                    All Data
                  </option>

                </select>

              </div>

              {/* CUSTOM RANGE */}

              {range ===
                "custom" && (
                <>

                  {/* START DATE */}

                  <div className="w-full lg:w-52">

                    <label
                      htmlFor="start-date"
                      className="mb-1.5 block text-xs font-semibold text-slate-500"
                    >
                      Start Date
                    </label>

                    <input
                      id="start-date"
                      type="date"
                      value={
                        customStartDate
                      }
                      onChange={(
                        event
                      ) =>
                        setCustomStartDate(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* END DATE */}

                  <div className="w-full lg:w-52">

                    <label
                      htmlFor="end-date"
                      className="mb-1.5 block text-xs font-semibold text-slate-500"
                    >
                      End Date
                    </label>

                    <input
                      id="end-date"
                      type="date"
                      value={
                        customEndDate
                      }
                      onChange={(
                        event
                      ) =>
                        setCustomEndDate(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* APPLY */}

                  <button
                    type="button"
                    onClick={
                      handleApplyCustomRange
                    }
                    disabled={
                      refreshing ||
                      !customStartDate ||
                      !customEndDate
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply
                  </button>

                </>
              )}

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {!loading &&
          error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>

                  <h2 className="text-sm font-semibold text-red-700">
                    Unable to load analytics
                  </h2>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      loadAnalytics(
                        true,
                        range,
                        customStartDate,
                        customEndDate
                      )
                    }
                    disabled={
                      refreshing
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >

                    <RefreshCw
                      size={15}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
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
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col items-center">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading analytics...
              </p>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* ANALYTICS DATA */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          analytics && (
            <>

              {/* ================================================= */}
              {/* KPI CARDS */}
              {/* ================================================= */}

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* TOTAL BOOKINGS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Total Bookings
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {totalBookings.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                      <BarChart3
                        size={21}
                        className="text-blue-600"
                      />

                    </div>

                  </div>

                </div>

                {/* TOTAL REVENUE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Total Revenue
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(
                          totalRevenue
                        )}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                      <IndianRupee
                        size={21}
                        className="text-emerald-600"
                      />

                    </div>

                  </div>

                </div>

                {/* COMPLETED */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Completed
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {completedBookings.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                      <TrendingUp
                        size={21}
                        className="text-emerald-600"
                      />

                    </div>

                  </div>

                </div>

                {/* CANCELLED */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Cancelled
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {cancelledBookings.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                      <BarChart3
                        size={21}
                        className="text-red-600"
                      />

                    </div>

                  </div>

                </div>

                {/* COMPLETION RATE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Completion Rate
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {completionRate.toFixed(
                          1
                        )}
                        %
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                      <TrendingUp
                        size={21}
                        className="text-emerald-600"
                      />

                    </div>

                  </div>

                </div>

                {/* CANCELLATION RATE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Cancellation Rate
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {cancellationRate.toFixed(
                          1
                        )}
                        %
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                      <BarChart3
                        size={21}
                        className="text-red-600"
                      />

                    </div>

                  </div>

                </div>

                {/* AVERAGE REVENUE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Avg. Revenue / Booking
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(
                          averageRevenuePerBooking
                        )}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                      <IndianRupee
                        size={21}
                        className="text-blue-600"
                      />

                    </div>

                  </div>

                </div>

                {/* TOP SERVICE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="min-w-0">

                      <p className="text-sm text-slate-500">
                        Top Service
                      </p>

                      <p
                        className="mt-2 truncate text-lg font-bold text-slate-900"
                        title={topService}
                      >
                        {topService}
                      </p>

                    </div>

                    <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50">

                      <BarChart3
                        size={21}
                        className="text-purple-600"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* BOOKING + REVENUE */}
              {/* ================================================= */}

              <div className="grid gap-6 lg:grid-cols-2">

                {/* BOOKING TRENDS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                      Booking Trends
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Number of bookings over time.
                    </p>

                  </div>

                  <BookingsChart
                    data={bookingData}
                  />

                </div>

                {/* REVENUE TRENDS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                      Revenue Trends
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Revenue generated over time.
                    </p>

                  </div>

                  <RevenueChart
                    data={revenueData}
                  />

                </div>

              </div>

              {/* ================================================= */}
              {/* STATUS + SERVICE */}
              {/* ================================================= */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                {/* BOOKING STATUS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                      Booking Status
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribution of booking statuses.
                    </p>

                  </div>

                  <StatusChart
                    data={statusData}
                  />

                </div>

                {/* SERVICE BREAKDOWN */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                      Service Breakdown
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Number of bookings by service.
                    </p>

                  </div>

                  <CategoryChart
                    data={categoryData}
                  />

                </div>

              </div>

            </>
          )}

      </div>

    </main>
  );
}