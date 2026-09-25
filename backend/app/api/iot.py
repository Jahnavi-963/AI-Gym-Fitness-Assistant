from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from ..services.mqtt_service import mqtt_service


router = APIRouter(
    prefix="/iot",
    tags=["IoT / Smart Gym"]
)


class MQTTCommand(BaseModel):
    equipment: str
    action: str
    value: Optional[float] = None


@router.get("/mqtt/status")
def mqtt_status():
    """
    Return the current MQTT connection status.
    """
    return mqtt_service.status()


@router.post("/mqtt/publish")
def publish_mqtt_command(command: MQTTCommand):
    """
    Publish a Smart Gym equipment command through MQTT.
    """

    return mqtt_service.publish(
        equipment=command.equipment,
        action=command.action,
        value=command.value
    )