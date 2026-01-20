#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test which Claude models are available with the API key"""

import os
import sys
import io
from anthropic import Anthropic
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# List of models to test
models_to_test = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20250107",
    "claude-3-5-haiku-20241022",
    "claude-3-5-haiku-20250122",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-sonnet-4-5-20250929",
]

print("\nTesting Claude model availability...\n")

for model in models_to_test:
    try:
        print(f"Testing {model}... ", end="")
        response = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        print("✓ AVAILABLE")
    except Exception as e:
        error_str = str(e)
        if "404" in error_str or "not_found" in error_str:
            print("✗ NOT FOUND (404)")
        elif "401" in error_str or "authentication" in error_str.lower():
            print("✗ AUTHENTICATION ERROR")
        else:
            print(f"✗ ERROR: {error_str[:50]}")

print("\nDone.")
