#!/bin/bash
# Usage: paste your new key block, then run: ./update-creds.sh
#
# OR pipe directly:
#   pbpaste | ./update-creds.sh
#
# Accepts either format:
#   export AWS_ACCESS_KEY_ID="..."
#   aws_access_key_id=...

INPUT="${1:-$(cat /dev/stdin 2>/dev/null)}"

if [ -z "$INPUT" ]; then
    echo "Paste your AWS credentials block, then press Ctrl+D:"
    INPUT=$(cat)
fi

# Parse either export or ini format
KEY=$(echo "$INPUT" | grep -i 'access_key_id' | grep -v 'secret' | sed 's/.*[="][[:space:]]*//' | tr -d '"' | tr -d ' \r' | head -1)
SECRET=$(echo "$INPUT" | grep -i 'secret_access_key' | sed 's/.*[="][[:space:]]*//' | tr -d '"' | tr -d ' \r' | head -1)
TOKEN=$(echo "$INPUT" | grep -i 'session_token' | sed 's/.*[="][[:space:]]*//' | tr -d '"' | tr -d ' \r' | head -1)

if [ -z "$KEY" ] || [ -z "$SECRET" ]; then
    echo "ERROR: Could not parse credentials. Make sure you pasted the full block."
    exit 1
fi

mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = $KEY
aws_secret_access_key = $SECRET
aws_session_token = $TOKEN
EOF

echo "✓ Credentials updated: ${KEY:0:12}..."
echo ""
echo "Now restart the server:"
echo "  ./start.sh"
