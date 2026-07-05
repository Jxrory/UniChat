VALID_TRANSITIONS: dict[str, set[str]] = {
    "active": {"pending_human", "resolved"},
    "pending_human": {"active", "resolved"},
    "resolved": {"active"},
}


def validate_transition(current_status: str, new_status: str) -> bool:
    allowed = VALID_TRANSITIONS.get(current_status)
    if allowed is None:
        return False
    return new_status in allowed
