// frontend/components/dashboard/Dashboard.tsx

"use client";

import { useEffect, useState } from "react";

import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  IndianRupee,
  Users,
  UserPlus,
} from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import RevenueChart from "./RevenueChart";
import BookingsChart from "./BookingsChart";
import StatusChart from "./StatusChart";
import CategoryChart from "./CategoryChart";
import BookingTable from "./BookingTable";
import RealtimeStatus from "./RealtimeStatus";

import {
  fetchDashboard,
  fetchRevenue,
  fetchBookingsOverTime,
  fetchBookings,
} from "@/lib/api";


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [dashboard, setDashboard] =
    useState<any>(null);

  const [revenue, setRevenue] =
    useState<any[]>([]);

  const [bookingsOverTime, setBookingsOverTime] =
    useState<any[]>([]);

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardData,
        revenueData,
        bookingAnalytics,
        bookingData,
      ] = await Promise.all([
        fetchDashboard(),
        fetchRevenue(),
        fetchBookingsOverTime(),
        fetchBookings(
          page,
          10,
          search,
          status
        ),
      ]);

      setDashboard(dashboardData);

      setRevenue(revenueData);

      setBookingsOverTime(
        bookingAnalytics
      );

      setBookings(
        bookingData.data || []
      );

      setPages(
        bookingData.pagination?.pages || 1
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDashboard();
  }, [
    page,
    search,
    status,
  ]);


  useEffect(() => {
    function handleBookingUpdate() {
      loadDashboard();
    }

    window.addEventListener(
      "booking-updated",
      handleBookingUpdate
    );

    return () => {
      window.removeEventListener(
        "booking-updated",
        handleBookingUpdate
      );
    };
  }, [
    page,
    search,
    status,
  ]);


  const overview =
    dashboard?.overview || {};


  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="lg:pl-64">

        <Header
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="p-4 md:p-8">

          <div className="mx-auto max-w-[1600px]">

            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <p className="text-sm font-medium text-blue-600">
                  Operations Center
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Good morning, Admin 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here's what's happening with
                  your operations today.
                </p>

              </div>

              <RealtimeStatus />

            </div>


            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {loading ? (

              <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading dashboard...
                  </p>

                </div>

              </div>

            ) : (

              <>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <StatCard
                    title="Total Bookings"
                    value={
                      overview.total_bookings || 0
                    }
                    icon={CalendarCheck}
                    change="+12.5%"
                  />

                  <StatCard
                    title="Completed"
                    value={
                      overview.completed_bookings || 0
                    }
                    icon={CheckCircle2}
                    change="+8.2%"
                  />

                  <StatCard
                    title="Pending"
                    value={
                      overview.pending_bookings || 0
                    }
                    icon={Clock3}
                    change="-4.3%"
                    positive={false}
                  />

                  <StatCard
                    title="Cancelled"
                    value={
                      overview.cancelled_bookings || 0
                    }
                    icon={XCircle}
                    change="-2.1%"
                  />

                </section>


                <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <StatCard
                    title="Total Revenue"
                    value={`₹${Number(
                      overview.total_revenue || 0
                    ).toLocaleString("en-IN")}`}
                    icon={IndianRupee}
                    change="+15.8%"
                  />

                  <StatCard
                    title="Active Mechanics"
                    value={
                      overview.active_mechanics || 0
                    }
                    icon={Users}
                    change="+6.4%"
                  />

                  <StatCard
                    title="Today's Bookings"
                    value={
                      overview.today_bookings || 0
                    }
                    icon={CalendarCheck}
                    change="+10.1%"
                  />

                  <StatCard
                    title="New Customers"
                    value={
                      overview.new_customers || 0
                    }
                    icon={UserPlus}
                    change="+9.7%"
                  />

                </section>


                <section className="mt-6 grid gap-6 xl:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-5">

                      <h3 className="font-bold text-slate-900">
                        Revenue Overview
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Completed booking revenue
                        over time
                      </p>

                    </div>

                    <RevenueChart
                      data={revenue}
                    />

                  </div>


                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-5">

                      <h3 className="font-bold text-slate-900">
                        Booking Volume
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Daily booking activity
                      </p>

                    </div>

                    <BookingsChart
                      data={bookingsOverTime}
                    />

                  </div>

                </section>


                <section className="mt-6 grid gap-6 xl:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-2">

                      <h3 className="font-bold text-slate-900">
                        Booking Status
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Current booking distribution
                      </p>

                    </div>

                    <StatusChart
                      data={
                        dashboard?.booking_status || []
                      }
                    />

                  </div>


                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-2">

                      <h3 className="font-bold text-slate-900">
                        Service Categories
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Bookings by service category
                      </p>

                    </div>

                    <CategoryChart
                      data={
                        dashboard?.service_categories || []
                      }
                    />

                  </div>

                </section>


                <section className="mt-6">

                  <BookingTable
                    bookings={bookings}
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    page={page}
                    setPage={setPage}
                    pages={pages}
                  />

                </section>

              </>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}