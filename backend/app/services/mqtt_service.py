import json
import os
from datetime import datetime, timezone
from typing import Optional

import paho.mqtt.client as mqtt


class MQTTService:
    def __init__(self):
        self.broker = os.getenv(
            "MQTT_BROKER",
            "broker.hivemq.com"
        )

        self.port = int(
            os.getenv("MQTT_PORT", "1883")
        )

        self.topic = os.getenv(
            "MQTT_TOPIC",
            "ai-gym-fitness/smart-gym"
        )

        self.client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id="ai-gym-fitness-backend",
            protocol=mqtt.MQTTv311
        )

        self.connected = False

        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect

    def _on_connect(
        self,
        client,
        userdata,
        flags,
        reason_code,
        properties
    ):
        if reason_code == 0:
            self.connected = True
            print("MQTT connected successfully")

        else:
            self.connected = False
            print(
                f"MQTT connection failed: {reason_code}"
            )

    def _on_disconnect(
        self,
        client,
        userdata,
        disconnect_flags,
        reason_code,
        properties
    ):
        self.connected = False
        print(
            f"MQTT disconnected: {reason_code}"
        )

    def connect(self) -> bool:
        try:
            self.client.connect(
                self.broker,
                self.port,
                keepalive=60
            )

            self.client.loop_start()

            return True

        except Exception as exc:
            self.connected = False

            print(
                f"MQTT connection error: "
                f"{type(exc).__name__}: {exc}"
            )

            return False

    def publish(
        self,
        equipment: str,
        action: str,
        value: Optional[float] = None
    ) -> dict:

        payload = {
            "equipment": equipment,
            "action": action,
            "value": value,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat()
        }

        # Connect if not already connected
        if not self.connected:
            connection_started = self.connect()

            if not connection_started:
                return {
                    "success": False,
                    "message": "MQTT broker unavailable",
                    "topic": self.topic,
                    "payload": payload
                }

        # Give the MQTT network loop a moment
        # to complete the connection callback.
        import time
        time.sleep(1)

        if not self.connected:
            return {
                "success": False,
                "message": "MQTT broker connection failed",
                "topic": self.topic,
                "payload": payload
            }

        try:
            result = self.client.publish(
                self.topic,
                json.dumps(payload),
                qos=1
            )

            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                return {
                    "success": True,
                    "message": (
                        "MQTT command published "
                        "successfully"
                    ),
                    "topic": self.topic,
                    "payload": payload
                }

            return {
                "success": False,
                "message": (
                    f"MQTT publish failed "
                    f"with return code {result.rc}"
                ),
                "topic": self.topic,
                "payload": payload
            }

        except Exception as exc:
            return {
                "success": False,
                "message": (
                    f"MQTT publish error: "
                    f"{type(exc).__name__}: {exc}"
                ),
                "topic": self.topic,
                "payload": payload
            }

    def status(self) -> dict:
        return {
            "broker": self.broker,
            "port": self.port,
            "topic": self.topic,
            "connected": self.connected
        }


mqtt_service = MQTTService()