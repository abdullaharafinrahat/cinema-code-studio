#!/usr/bin/env python3
"""
Shared helpers for Cinema Code Studio gates.

Why this module exists
----------------------
The v4 pipeline never read the user's script. Edit grammars were free-text
and `scriptSignatureHash` was a hand-typed string, so two different scripts
could produce identical edits. This module binds every gate to the script's
actual text:

* `ingest_script()`      copies the script into `preprod/00_script.txt` and
                         records its normalized SHA-256 + sentence index.
* `compute_signature()`  derives `scriptSignatureHash` from the script hash and
                         the grammar's binding fields (never hand-typed).
* `verify_beat_spans()`  requires every beat to be anchored to a verbatim
                         quote from the script.
"""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from pathlib import Path

SCRIPT_FILENAME = "00_script.txt"
SCRIPT_META_FILENAME = "00_script.meta.json"
SIGNATURE_PREFIX = "EG"
MIN_SPAN_WORDS = 3

# Fields of 01a_edit_grammar.json that the signature is derived from.
# Changing any of them invalidates the signature (stale or hand-edited grammar).
SIGNATURE_BINDING_FIELDS = (
    "scriptShape",
    "shotVocabulary",
    "cameraMoveVocabulary",
    "transitionVocabulary",
    "pacingSignature",
)

_CHAR_FOLD = {
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u00a0": " ",
}


def normalize_text(text: str) -> str:
    """Case-, quote- and whitespace-insensitive form used for hashing and quote matching."""
    text = unicodedata.normalize("NFKC", text)
    for src, dst in _CHAR_FOLD.items():
        text = text.replace(src, dst)
    return re.sub(r"\s+", " ", text).strip().lower()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def script_hash(raw_text: str) -> str:
    return sha256_text(normalize_text(raw_text))


def split_sentences(raw_text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", raw_text.strip())
    return [p.strip() for p in parts if p.strip()]


def ingest_script(source: Path, preprod_dir: Path) -> dict:
    """Copy the script into preprod/ and write its meta (hash + sentence index)."""
    raw = source.read_text(encoding="utf-8")
    if not normalize_text(raw):
        raise ValueError(f"Script is empty: {source}")

    preprod_dir.mkdir(parents=True, exist_ok=True)
    (preprod_dir / SCRIPT_FILENAME).write_text(raw, encoding="utf-8")

    meta = {
        "sourceFile": source.name,
        "scriptSha256": script_hash(raw),
        "wordCount": len(normalize_text(raw).split()),
        "sentences": [{"index": i, "text": s} for i, s in enumerate(split_sentences(raw))],
    }
    (preprod_dir / SCRIPT_META_FILENAME).write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    return meta


def compute_signature(grammar: dict, scr_hash: str) -> str:
    """Deterministic signature: script hash + the grammar's binding fields."""
    payload = {"scriptSha256": scr_hash}
    for field in SIGNATURE_BINDING_FIELDS:
        payload[field] = grammar.get(field)
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return f"{SIGNATURE_PREFIX}-{sha256_text(canonical)[:16].upper()}"


def unique_beats(grammar: dict) -> list[str]:
    seq = grammar.get("scriptShape", {}).get("beatSequence", [])
    seen: list[str] = []
    for beat in seq:
        if beat not in seen:
            seen.append(beat)
    return seen


def verify_beat_spans(grammar: dict, raw_script: str, errors: list[str], warnings: list[str]) -> None:
    """Every beat must be anchored to a verbatim (normalized) quote from the script."""
    spans = grammar.get("scriptShape", {}).get("beatSourceSpans", {}) or {}
    normalized_script = normalize_text(raw_script)
    positions: list[tuple[str, int]] = []

    for beat in unique_beats(grammar):
        quote = spans.get(beat)
        if not quote:
            errors.append(
                f"Beat '{beat}' has no `scriptShape.beatSourceSpans` entry. Quote the script line it comes from."
            )
            continue
        norm_quote = normalize_text(quote)
        if len(norm_quote.split()) < MIN_SPAN_WORDS:
            errors.append(f"Beat '{beat}' source span is too short ({len(norm_quote.split())} words; need {MIN_SPAN_WORDS}+).")
            continue
        pos = normalized_script.find(norm_quote)
        if pos < 0:
            errors.append(
                f"Beat '{beat}' source span is not verbatim in the script: \"{quote[:80]}\". "
                "Copy the exact words from the script."
            )
            continue
        positions.append((beat, pos))

    # Script order vs beat order: only a warning, since flashback structures are legitimate.
    if len(positions) >= 2:
        in_order = all(positions[i][1] <= positions[i + 1][1] for i in range(len(positions) - 1))
        if not in_order:
            warnings.append("Beat source spans are not in script order. Confirm this is an intentional non-linear arc.")
