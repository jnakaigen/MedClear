import asyncio
import base64
import json
import os
import re

import httpx

from models import SimplifiedReport

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.0-flash-001"
MAX_RETRIES = 2
TIMEOUT_SECONDS = 60

SYSTEM_PROMPT = """You are a medical report translator. Your job is to take complex medical reports and explain them in simple, plain English that a 5th grader (10-year-old) could understand.

You may receive text from various medical sources including:
- Typed lab reports and test results
- Handwritten doctor's notes (OCR may produce misspellings or garbled text — use medical context to interpret)
- Pill bottle labels (drug names, dosages, frequency, warnings)
- Prescription forms

STRICT RULES:
1. Never invent or assume information not present in the original text.
2. Every medical finding, medication, or instruction must be translated — do not skip anything.
3. Use everyday words. Replace jargon with simple explanations.
4. If the text appears to be from a handwritten note and OCR is messy, do your best to interpret it using medical context. If a word is truly unreadable, write "[unclear]" rather than guessing.
5. For pill bottles and prescriptions: clearly explain the drug name, what it treats, dosage, how often to take it, and any warnings.
6. Classify each section's severity honestly:
   - "normal" = results are within healthy range, nothing to worry about
   - "watch" = slightly outside normal range, worth monitoring but not dangerous
   - "urgent" = needs immediate attention or follow-up with a doctor
7. Action items must be concrete and specific (e.g., "Schedule a follow-up blood test in 3 months").
8. If the report does not mention a follow-up, write "Discuss next steps with your doctor."

You MUST respond with ONLY valid JSON matching this exact schema — no markdown, no explanation outside the JSON:

{
  "report_title": "A simple, descriptive title for this report",
  "summary": "A 2-3 sentence plain-language overview of what this report says overall",
  "sections": [
    {
      "title": "Section name (e.g., Blood Sugar Levels, Medication Info)",
      "original_text": "The exact text from the report for this section",
      "simplified_text": "What this means in simple words",
      "severity": "normal | watch | urgent"
    }
  ],
  "action_items": [
    "Specific thing the patient should do"
  ],
  "follow_up": "When to see the doctor next"
}"""

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _get_api_key() -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        raise ValueError(
            "OpenRouter API key is not configured. "
            "Please add your key to the .env file."
        )
    return api_key


async def _call_llm(payload: dict) -> SimplifiedReport:
    """Make the OpenRouter API call with retries and parse the response."""
    api_key = _get_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    last_error = None

    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                response = await client.post(
                    OPENROUTER_URL, headers=headers, json=payload
                )

            if response.status_code in RETRYABLE_STATUS_CODES and attempt < MAX_RETRIES:
                wait_time = 2 ** (attempt + 1)
                await asyncio.sleep(wait_time)
                continue

            if response.status_code != 200:
                error_body = response.text
                raise ValueError(
                    f"OpenRouter API returned status {response.status_code}: {error_body}"
                )

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            return _parse_llm_response(content)

        except httpx.TimeoutException:
            last_error = "The analysis timed out. Please try again with a shorter document."
            if attempt < MAX_RETRIES:
                await asyncio.sleep(2 ** (attempt + 1))
                continue
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected response format from LLM: {e}")

    raise ValueError(last_error or "Failed to get a response from the LLM after retries.")


async def simplify_report(extracted_text: str) -> SimplifiedReport:
    """Send extracted text to LLM and return structured simplified output."""
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Please simplify this medical report:\n\n{extracted_text}",
            },
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    return await _call_llm(payload)


async def simplify_report_from_image(
    image_bytes: bytes, content_type: str
) -> SimplifiedReport:
    """Send an image directly to the multimodal LLM for reading + simplification.

    Used for handwritten notes, pill bottles, and other images where
    traditional OCR produces poor results.
    """
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    media_type = content_type if content_type.startswith("image/") else "image/png"

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Please read and simplify this medical document. It may be a handwritten doctor's note, a pill bottle label, a prescription, or a medical report.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{b64_image}",
                        },
                    },
                ],
            },
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    return await _call_llm(payload)


def _parse_llm_response(content: str) -> SimplifiedReport:
    """Parse LLM response string into a SimplifiedReport, with fallback extraction."""
    # Try direct JSON parse
    try:
        data = json.loads(content)
        return SimplifiedReport.model_validate(data)
    except (json.JSONDecodeError, Exception):
        pass

    # Fallback: extract JSON from response (LLM sometimes wraps in markdown)
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            return SimplifiedReport.model_validate(data)
        except (json.JSONDecodeError, Exception):
            pass

    raise ValueError(
        "The AI returned a response that could not be parsed. "
        "Please try uploading the report again."
    )
