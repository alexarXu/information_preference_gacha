import os
from urllib.parse import urlparse

import psiturk.experiment_server as exp


def _normalize_database_url() -> None:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        print("[startup] DATABASE_URL is empty; psiTurk may fallback to sqlite.")
        return

    # Compatibility normalization for platforms/tools still emitting postgres://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        os.environ["DATABASE_URL"] = database_url

    parsed = urlparse(database_url)
    safe_host = parsed.hostname or "unknown-host"
    print(f"[startup] DATABASE_URL scheme={parsed.scheme} host={safe_host}")


_normalize_database_url()
exp.launch()
