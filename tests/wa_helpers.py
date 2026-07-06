import json
from typing import Any


def wa_payload(
    from_number: str = "5511999999999",
    text: str = "Hello",
    msg_type: str = "text",
    msg_id: str = "wamid.ABC123",
) -> bytes:
    msg: dict[str, Any] = {
        "from": from_number, "id": msg_id, "timestamp": "1700000000", "type": msg_type,
    }
    if msg_type == "text":
        msg["text"] = {"body": text}

    return json.dumps({
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "123456789",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "16505551111",
                        "phone_number_id": "123456789",
                    },
                    "contacts": [{"profile": {"name": "Test User"}, "wa_id": from_number}],
                    "messages": [msg],
                },
                "field": "messages",
            }],
        }],
    }).encode()


def wa_status_payload() -> bytes:
    return json.dumps({
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "123456789",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "16505551111",
                        "phone_number_id": "123456789",
                    },
                    "statuses": [{
                        "id": "wamid.status123", "status": "sent",
                        "timestamp": "1700000001", "recipient_id": "5511999999999",
                    }],
                },
                "field": "messages",
            }],
        }],
    }).encode()
