import os

from locust import HttpUser, task, between


class MechanicDashboardUser(HttpUser):
    """
    Simulates a real user using the Instant Mechanic Dashboard.
    """

    # Local FastAPI server
    host = "http://127.0.0.1:8000"

    # Wait 1–3 seconds between user actions
    wait_time = between(1, 3)

    def on_start(self):
        """
        Login when each simulated user starts.
        """

        email = os.getenv("LOAD_TEST_EMAIL")
        password = os.getenv("LOAD_TEST_PASSWORD")

        if not email or not password:
            raise RuntimeError(
                "LOAD_TEST_EMAIL and LOAD_TEST_PASSWORD "
                "environment variables are required."
            )

        response = self.client.post(
            "/api/auth/login",
            data={
                "username": email,
                "password": password,
            },
            name="POST /api/auth/login",
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Login failed: "
                f"{response.status_code} "
                f"{response.text}"
            )

        token = response.json()["access_token"]

        # Use JWT token for all following requests
        self.client.headers.update(
            {
                "Authorization": f"Bearer {token}"
            }
        )

    @task(5)
    def dashboard(self):
        self.client.get(
            "/api/dashboard",
            name="GET /api/dashboard",
        )

    @task(3)
    def bookings(self):
        self.client.get(
            "/api/bookings",
            name="GET /api/bookings",
        )

    @task(2)
    def analytics(self):
        self.client.get(
            "/api/analytics",
            name="GET /api/analytics",
        )

    @task(2)
    def revenue(self):
        self.client.get(
            "/api/dashboard/revenue",
            name="GET /api/dashboard/revenue",
        )

    @task(2)
    def bookings_over_time(self):
        self.client.get(
            "/api/dashboard/bookings-over-time",
            name="GET /api/dashboard/bookings-over-time",
        )

    @task(2)
    def mechanics(self):
        self.client.get(
            "/api/mechanics",
            name="GET /api/mechanics",
        )

    @task(2)
    def customers(self):
        self.client.get(
            "/api/customers",
            name="GET /api/customers",
        )

    @task(2)
    def vehicles(self):
        self.client.get(
            "/api/vehicles",
            name="GET /api/vehicles",
        )