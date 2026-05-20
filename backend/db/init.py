import os
from pathlib import Path

import asyncpg


async def init_db() -> None:
    """Run schema.sql against the database. Safe to call on every startup."""
    schema_sql = (Path(__file__).parent / "schema.sql").read_text()
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        await conn.execute(schema_sql)
        await _seed_resources(conn)
    finally:
        await conn.close()


async def _seed_resources(conn: asyncpg.Connection) -> None:
    """Insert default crisis resources if the table is empty."""
    count = await conn.fetchval("SELECT COUNT(*) FROM resources")
    if count and count > 0:
        return

    resources = [
        (
            "988 Suicide & Crisis Lifeline",
            "If you or someone you know is in crisis, call or text 988. "
            "The Suicide & Crisis Lifeline provides 24/7 free and confidential support. "
            "You can also chat at 988lifeline.org.",
            "crisis_hotline",
        ),
        (
            "Crisis Text Line",
            "Text HOME to 741741 to connect with a Crisis Counselor. "
            "Available 24/7, free, and confidential.",
            "crisis_hotline",
        ),
        (
            "Grounding Technique: 5-4-3-2-1",
            "When feeling overwhelmed, try the 5-4-3-2-1 grounding technique: "
            "Name 5 things you can see, 4 things you can touch, 3 things you can hear, "
            "2 things you can smell, 1 thing you can taste. "
            "This anchors you to the present moment.",
            "coping_technique",
        ),
        (
            "Box Breathing",
            "Box breathing can reduce anxiety: inhale for 4 counts, hold for 4, "
            "exhale for 4, hold for 4. Repeat 4-5 times. "
            "This activates your parasympathetic nervous system.",
            "coping_technique",
        ),
        (
            "Talking to Someone You Trust",
            "Sharing how you feel with a trusted friend, family member, or counselor "
            "can provide relief and perspective. You don't have to carry this alone.",
            "support",
        ),
    ]

    for title, content, category in resources:
        await conn.execute(
            "INSERT INTO resources (title, content, category) VALUES ($1, $2, $3)",
            title, content, category,
        )
