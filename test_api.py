#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for the unified server API endpoints
Tests both health check and story generation with real API calls
"""

import requests
import json
import time
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
BASE_URL = 'http://localhost:8080'
TIMEOUT = 60  # seconds

def test_health_check():
    """Test the health check endpoint."""
    print("\n" + "="*60)
    print("Testing Health Check Endpoint")
    print("="*60)

    try:
        response = requests.get(f'{BASE_URL}/api/health', timeout=5)

        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data.get('status')}")
            print(f"  Timestamp: {data.get('timestamp')}")
            print(f"  Anthropic Configured: {data.get('anthropic_configured')}")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure server is running on port 8080.")
        return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_story_generation(grade_level, length, prompt):
    """Test story generation with real API call."""
    print("\n" + "="*60)
    print(f"Testing Story Generation: {grade_level}, {length}")
    print("="*60)
    print(f"Prompt: {prompt}")

    payload = {
        "gradeLevel": grade_level,
        "length": length,
        "prompt": prompt,
        "random": False
    }

    try:
        print("\nSending request to API...")
        start_time = time.time()

        response = requests.post(
            f'{BASE_URL}/api/generate-story',
            json=payload,
            timeout=TIMEOUT,
            headers={'Content-Type': 'application/json'}
        )

        elapsed_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()

            if data.get('success'):
                story = data.get('story')
                print(f"\n✓ Story generated successfully in {elapsed_time:.2f}s")
                print(f"\nTitle: {story.get('title')}")
                print(f"Number of sentences: {len(story.get('sentences', []))}")

                # Display first few sentences
                sentences = story.get('sentences', [])
                print(f"\nFirst 3 sentences:")
                for i, sentence_obj in enumerate(sentences[:3], 1):
                    text = sentence_obj.get('text')
                    test_word = sentence_obj.get('testWord')
                    if test_word:
                        print(f"  {i}. {text}")
                        print(f"     Test word: '{test_word}'")
                    else:
                        print(f"  {i}. {text}")
                        print(f"     Test word: (none - reading only)")

                # Validate structure
                print("\nValidation:")
                has_title = bool(story.get('title'))
                has_sentences = len(sentences) > 0
                all_have_text = all(s.get('text') for s in sentences)

                print(f"  Has title: {has_title}")
                print(f"  Has sentences: {has_sentences}")
                print(f"  All sentences have text: {all_have_text}")

                # Check for test words
                test_word_count = sum(1 for s in sentences if s.get('testWord'))
                print(f"  Sentences with test words: {test_word_count}/{len(sentences)}")

                if has_title and has_sentences and all_have_text:
                    print("\n✓ Story structure is valid")
                    return True
                else:
                    print("\n✗ Story structure is invalid")
                    return False
            else:
                print(f"\n✗ API returned error: {data.get('error')}")
                return False
        else:
            print(f"\n✗ Request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error')}")
            except:
                print(f"Response: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print(f"\n✗ Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"\n✗ Story generation failed: {e}")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("Family Dashboard API Test Suite")
    print("="*60)

    results = []

    # Test 1: Health check
    results.append(("Health Check", test_health_check()))

    # Wait a moment between tests
    time.sleep(1)

    # Test 2: Pre-K tiny story
    results.append((
        "Pre-K Tiny Story",
        test_story_generation("Pre-K", "tiny", "a friendly cat playing with a ball")
    ))

    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)

    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")

    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)

    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")

    # Exit with appropriate code
    if passed_tests == total_tests:
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print(f"\n✗ {total_tests - passed_tests} test(s) failed")
        sys.exit(1)


if __name__ == '__main__':
    main()
