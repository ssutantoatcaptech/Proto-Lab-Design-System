"""
LLM client factory for Huntington Capital Markets demos.
Uses AWS Bedrock (preferred) or direct Anthropic API as fallback.
"""

import logging
import os

BEDROCK_REGION = os.environ.get("AWS_REGION", "us-east-1")
BEDROCK_PROFILE = os.environ.get("AWS_PROFILE", "showcase-dma")
BEDROCK_SONNET = "us.anthropic.claude-sonnet-4-20250514-v1:0"
BEDROCK_HAIKU = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

DIRECT_SONNET = "claude-sonnet-4-6-20250514"
DIRECT_OPUS = "claude-opus-4-6"

_use_bedrock = None


def use_bedrock() -> bool:
    global _use_bedrock
    if _use_bedrock is not None:
        return _use_bedrock
    if os.environ.get("USE_BEDROCK") == "1":
        logging.info("LLM: USE_BEDROCK=1 set — using Bedrock")
        _use_bedrock = True
        return True
    if os.environ.get("ANTHROPIC_API_KEY"):
        logging.info("LLM: ANTHROPIC_API_KEY found — using direct Anthropic API")
        _use_bedrock = False
    else:
        try:
            import boto3
            profile = BEDROCK_PROFILE
            session = boto3.Session(profile_name=profile)
            creds = session.get_credentials()
            if creds is None:
                raise ValueError("No credentials found for profile: %s" % profile)
            frozen = creds.get_frozen_credentials()
            if not frozen.access_key:
                raise ValueError("Credentials resolved but access_key is empty")
            logging.info("LLM: Valid AWS credentials found (profile=%s) — using Bedrock", profile)
            _use_bedrock = True
        except Exception as e:
            logging.warning("LLM: AWS credential check failed (%s) — falling back to direct Anthropic API", e)
            _use_bedrock = False
    return _use_bedrock


def get_client():
    if use_bedrock():
        import boto3
        from anthropic import AnthropicBedrock
        profile = BEDROCK_PROFILE
        session = boto3.Session(profile_name=profile)
        creds = session.get_credentials().get_frozen_credentials()
        logging.info("LLM: Building AnthropicBedrock client (region=%s, profile=%s)", BEDROCK_REGION, profile)
        return AnthropicBedrock(
            aws_region=BEDROCK_REGION,
            aws_access_key=creds.access_key,
            aws_secret_key=creds.secret_key,
            aws_session_token=creds.token,
        )
    else:
        from anthropic import Anthropic
        logging.info("LLM: Building direct Anthropic client")
        return Anthropic()


def model_id(role: str = "sonnet") -> str:
    if use_bedrock():
        return BEDROCK_SONNET  # Bedrock: always Sonnet (Opus not provisioned on this account)
    else:
        return DIRECT_SONNET if role == "sonnet" else DIRECT_OPUS


def thinking_param() -> dict:
    """Return the appropriate thinking parameter. Bedrock doesn't support adaptive."""
    if use_bedrock():
        return {}
    return {"thinking": {"type": "adaptive"}}


def serialize_response(response) -> list:
    """Serialize response content for multi-turn, stripping thinking blocks for Bedrock compatibility."""
    return [b for b in response.content if b.type == "text"]
