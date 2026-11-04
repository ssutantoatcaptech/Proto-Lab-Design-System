#!/bin/bash
# Start the Huntington Capital Markets AI server using AWS SSO.
# If credentials are expired, run: aws sso login --profile bedrock-claude

set -e
cd "$(dirname "$0")"

kill $(lsof -ti :5000) 2>/dev/null && echo "Stopped existing server" || true

AWS_PROFILE=bedrock-claude USE_BEDROCK=1 .venv/bin/python3 web/app.py
