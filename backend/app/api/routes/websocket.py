# backend/app/api/routes/websocket.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_manager import manager


router = APIRouter(
    tags=["WebSocket"],
)


@router.websocket("/ws/bookings")
async def booking_websocket(
    websocket: WebSocket,
):
    await manager.connect(websocket)

    try:
        await websocket.send_json(
            {
                "type": "connection",
                "message": "Connected to real-time booking updates",
            }
        )

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    except Exception:
        manager.disconnect(websocket)