import logging

logger = logging.getLogger("unichat.state_machine")

VALID_TRANSITIONS: dict[str, set[str]] = {
    "active": {"pending_human", "resolved"},
    "pending_human": {"active", "resolved"},
    "resolved": {"active"},
}


def validate_transition(current_status: str, new_status: str) -> bool:
    allowed = VALID_TRANSITIONS.get(current_status)
    if allowed is None:
        logger.debug("Transition invalid: %s -> %s (unknown current status)", current_status, new_status)
        return False
    ok = new_status in allowed
    if ok:
        logger.debug("Transition allowed: %s -> %s", current_status, new_status)
    else:
        logger.debug("Transition denied: %s -> %s", current_status, new_status)
    return ok
