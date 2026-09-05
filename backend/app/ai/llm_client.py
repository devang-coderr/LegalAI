"""
LLM client -- the ONLY file in the project that talks to an external AI
provider directly. Every AI-dependent service (case intelligence, legal
research) calls `generate_json()`, never the provider SDK directly -- this
is the "replaceable through a service abstraction" requirement: swapping
Gemini for Claude or OpenAI later means changing this one file, nothing
that calls it.

*** VERIFICATION STATUS: NOT VERIFIED -- MUST TEST LOCALLY ***
The request/response shape below is written against Gemini's current
generateContent REST API and JSON-mode (response_mime_type) support. I do
not have a live Gemini API key in this sandbox, so the actual network call
has NOT been exercised end-to-end -- only the code path that runs when no
key is configured (the fallback below) has been verified, deliberately, so
the rest of the system doesn't have to wait on this to be demoable. The
first thing to test once you have a real `LLM_API_KEY` in `.env`: run any
AI-dependent endpoint and confirm `data.meta.aiFallback` is NOT present
in the response -- its absence means a real call succeeded.
"""
import asyncio
import json
import httpx

from app.core.config import settings

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


_http_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=30.0)
    return _http_client


async def close_http_client() -> None:
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None


import logging

logger = logging.getLogger(__name__)

async def generate_json(prompt: str, system_instruction: str, max_retries: int = 2) -> tuple[dict, bool]:
    """
    Returns (parsed_json, used_fallback).

    used_fallback=True means no real AI call was made -- either no API key
    is configured, or the live call failed -- and the caller should mark
    the response accordingly rather than presenting it as a real result.
    """
    if not settings.LLM_API_KEY:
        return _fallback_response(), True

    client = get_http_client()
    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
        },
    }

    # Candidate models in priority order
    candidate_models = []
    if settings.LLM_MODEL and settings.LLM_MODEL not in candidate_models:
        candidate_models.append(settings.LLM_MODEL)
    for m in ["gemini-flash-lite-latest", "gemini-flash-latest"]:
        if m not in candidate_models:
            candidate_models.append(m)

    for model_name in candidate_models:
        url = GEMINI_ENDPOINT.format(model=model_name)
        for attempt in range(max_retries + 1):
            try:
                resp = await client.post(
                    url,
                    params={"key": settings.LLM_API_KEY},
                    json=payload,
                )
                if resp.status_code == 200:
                    body = resp.json()
                    text = body["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text), False

                if resp.status_code in (404, 400, 429):
                    # Invalid model, bad request, or model quota exhausted: failover to next model immediately
                    logger.info(f"LLM model '{model_name}' status {resp.status_code}, switching to next candidate model.")
                    break

                if resp.status_code == 503:
                    # Temporary service overload: quick retry or switch
                    if attempt < max_retries:
                        await asyncio.sleep(0.5)
                        continue
                    break

                resp.raise_for_status()
            except Exception as exc:
                if attempt < max_retries:
                    await asyncio.sleep(0.5)
                    continue
                logger.warning(f"LLM call to '{model_name}' failed: {exc}")
                break

    return _fallback_response(), True


def _fallback_response() -> dict:
    """
    A structurally valid but clearly-labelled placeholder, used when no
    LLM_API_KEY is set or the live call fails. Every service that calls
    generate_json() overlays its own real schema on top of this, so this
    only needs to signal "no AI ran" -- not match any specific shape.
    """
    return {"_placeholder": True}
