from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.customers import router as customers_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.mechanics import router as mechanics_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.websocket import router as websocket_router
from app.api.routes.vehicles import router as vehicles_router


app = FastAPI(
    title="Instant Mechanic Operations Dashboard API",
    description="Backend API for the Instant Mechanic live operations dashboard.",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(bookings_router)
app.include_router(mechanics_router)
app.include_router(customers_router)
app.include_router(vehicles_router)
app.include_router(analytics_router)
app.include_router(websocket_router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Instant Mechanic API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }