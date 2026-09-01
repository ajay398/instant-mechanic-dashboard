const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchDashboard() {
  const response = await fetch(`${API_URL}/api/dashboard`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return response.json();
}

export async function fetchRevenue() {
  const response = await fetch(
    `${API_URL}/api/dashboard/revenue`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue");
  }

  return response.json();
}

export async function fetchBookingsOverTime() {
  const response = await fetch(
    `${API_URL}/api/dashboard/bookings-over-time`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch booking analytics");
  }

  return response.json();
}

export async function fetchBookings(
  page = 1,
  limit = 10,
  search = "",
  status = ""
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  const response = await fetch(
    `${API_URL}/api/bookings?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}