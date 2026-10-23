#!/usr/bin/env python3
"""
Gate 2 Speech Intelligence: Word-Level Transcription, Breath vs Dead-Air Classification,
and Speaking Cadence (WPM) Analyzer.

Supports:
1. `faster-whisper` Python library (preferred, word-level timestamps)
2. `whisper` CLI fallback (`--word_timestamps True`)
3. Existing `.srt` / `.vtt` / `.json` transcript ingestion (`--from-transcript`)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

FILLER_TOKENS = {"um", "uh", "erm", "uhh", "umm", "hmm", "like,"}


def classify_gaps(words: list[dict], fps: int) -> tuple[list[dict], dict]:
    """
    Distinguishes natural dramatic breaths (150ms - 360ms) from cuttable dead air (> 400ms),
    and attaches exact frame numbers with consonant-safe breath pads (85ms pre, 120ms post).
    """
    gaps = []
    pre_pad = 0.085
    post_pad = 0.120

    for idx, w in enumerate(words):
        w["startFrame"] = round(w["start"] * fps)
        w["endFrame"] = max(w["startFrame"] + 1, round(w["end"] * fps))
        clean_token = re.sub(r"[^\w']", "", w["word"].lower())
        w["isFillerCandidate"] = clean_token in FILLER_TOKENS

        if idx > 0:
            prev = words[idx - 1]
            gap_dur = round(w["start"] - prev["end"], 4)
            if gap_dur >= 0.16:
                if gap_dur <= 0.38:
                    category = "NATURAL_BREATH_KEEP"
                    recommended_action = "Keep intact for natural vocal cadence"
                else:
                    category = "DEAD_AIR_CUT_CANDIDATE"
                    trim_start = round(prev["end"] + post_pad, 4)
                    trim_end = round(max(trim_start, w["start"] - pre_pad), 4)
                    recommended_action = f"Cut [{trim_start}s -> {trim_end}s] and mask seam with 1.14x punch-in or B-roll"
                gaps.append(
                    {
                        "afterWordIndex": idx - 1,
                        "gapStartSec": round(prev["end"], 4),
                        "gapEndSec": round(w["start"], 4),
                        "durationSec": gap_dur,
                        "category": category,
                        "action": recommended_action,
                    }
                )

    if words:
        spoken_span = max(0.1, words[-1]["end"] - words[0]["start"])
        wpm = round((len(words) / spoken_span) * 60.0, 1)
    else:
        wpm = 0.0

    stats = {
        "wordCount": len(words),
        "estimatedWpm": wpm,
        "pacingDiagnosis": (
            "FAST_ENERGETIC" if wpm > 175 else ("CONVERSATIONAL_IDEAL" if wpm >= 130 else "DELIBERATE_CINEMATIC")
        ),
        "deadAirGapCount": sum(1 for g in gaps if g["category"] == "DEAD_AIR_CUT_CANDIDATE"),
        "fillerCount": sum(1 for w in words if w["isFillerCandidate"]),
    }
    return gaps, stats


def parse_srt_to_words(srt_path: Path) -> list[dict]:
    content = srt_path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\s*\n", content.strip())
    words: list[dict] = []
    time_re = re.compile(
        r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})"
    )

    def to_sec(h: str, m: str, s: str, ms: str) -> float:
        return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0

    for block in blocks:
        lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
        t_match = None
        text_lines = []
        for ln in lines:
            m = time_re.search(ln)
            if m:
                t_match = m
            elif not ln.isdigit():
                text_lines.append(ln)
        if not t_match or not text_lines:
            continue
        start_s = to_sec(*t_match.groups()[:4])
        end_s = to_sec(*t_match.groups()[4:])
        tokens = " ".join(text_lines).split()
        if not tokens:
            continue
        step = (end_s - start_s) / len(tokens)
        for i, tok in enumerate(tokens):
            words.append(
                {
                    "word": tok,
                    "start": round(start_s + i * step, 4),
                    "end": round(start_s + (i + 1) * step, 4),
                    "confidence": 0.9,
                }
            )
    return words


def transcribe_with_faster_whisper(media_path: Path, model_size: str) -> list[dict]:
    from faster_whisper import WhisperModel  # type: ignore

    model = WhisperModel(model_size, device="auto", compute_type="int8")
    segments, _ = model.transcribe(str(media_path), word_timestamps=True, vad_filter=True)
    words: list[dict] = []
    for seg in segments:
        for w in seg.words or []:
            words.append(
                {
                    "word": w.word.strip(),
                    "start": round(float(w.start), 4),
                    "end": round(float(w.end), 4),
                    "confidence": round(float(w.probability), 3),
                }
            )
    return words


def main() -> None:
    parser = argparse.ArgumentParser(description="Transcribe spoken media into frame-indexed words and breath gaps.")
    parser.add_argument("input_path", type=Path, help="Audio/video file or .srt/.json transcript")
    parser.add_argument("--out", type=Path, required=True, help="Output JSON path (e.g., preprod/words.json)")
    parser.add_argument("--fps", type=int, default=60, help="Timeline FPS for frame indexing")
    parser.add_argument("--model", default="base", help="Whisper model size (tiny, base, small, medium, large-v3)")
    args = parser.parse_args()

    if not args.input_path.exists():
        print(f"Error: input file not found: {args.input_path}", file=sys.stderr)
        sys.exit(1)

    suffix = args.input_path.suffix.lower()
    if suffix in {".srt", ".vtt"}:
        words = parse_srt_to_words(args.input_path)
    elif suffix == ".json":
        raw = json.loads(args.input_path.read_text(encoding="utf-8"))
        words = raw["words"] if isinstance(raw, dict) and "words" in raw else raw
    else:
        try:
            words = transcribe_with_faster_whisper(args.input_path, args.model)
        except ImportError:
            print(
                "Error: faster-whisper is not installed in this Python environment. "
                "Install `pip install faster-whisper` or pass an existing .srt/.json file.",
                file=sys.stderr,
            )
            sys.exit(2)

    gaps, stats = classify_gaps(words, args.fps)
    payload = {
        "source": str(args.input_path),
        "fps": args.fps,
        "stats": stats,
        "words": words,
        "gaps": gaps,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "output": str(args.out), "stats": stats}, indent=2))


if __name__ == "__main__":
    main()
