#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Family Dashboard Unified Server
Serves static files and provides API endpoints for story generation
"""

import os
import sys
import json
import logging
import webbrowser
import threading
import time
from pathlib import Path
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Load environment variables
load_dotenv()

# Configuration
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Initialize Anthropic client
anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
if anthropic_api_key:
    client = Anthropic(api_key=anthropic_api_key)
    logger.info('Anthropic API client initialized')
else:
    client = None
    logger.warning('ANTHROPIC_API_KEY not found - story generation will not work')

# Grade level configurations
GRADE_CONFIGS = {
    'Pre-K': {
        'sentence_counts': {'tiny': 10, 'short': 20, 'medium': 40},
        'vocabulary_level': 'Pre-K (ages 4-5)',
        'max_word_length': 6,
        'description': 'very simple 3-5 letter words like cat, dog, sun, run, jump'
    },
    '1st': {
        'sentence_counts': {'tiny': 10, 'short': 20, 'medium': 40},
        'vocabulary_level': '1st grade (ages 6-7)',
        'max_word_length': 8,
        'description': 'simple words appropriate for early readers, mix of 3-8 letter words'
    },
    '3rd': {
        'sentence_counts': {'tiny': 20, 'short': 40, 'medium': 80},
        'vocabulary_level': '3rd grade (ages 8-9)',
        'max_word_length': 12,
        'description': 'more challenging vocabulary with longer words and compound words'
    }
}

# Random story themes for inspiration
RANDOM_THEMES = [
    "a brave astronaut exploring a mysterious planet",
    "a friendly dragon learning to bake cookies",
    "a clever detective solving the mystery of the missing treasure",
    "a magical garden where flowers can talk",
    "a submarine adventure in the deep ocean",
    "a time-traveling scientist visiting dinosaurs",
    "a kind robot helping animals in the forest",
    "a mermaid discovering a hidden underwater city",
    "a young inventor creating amazing machines",
    "a pirate searching for a legendary island",
    "a superhero who can control the weather",
    "a talking cat who solves neighborhood mysteries",
    "a wizard's apprentice learning magic spells",
    "an explorer finding ancient ruins in the jungle",
    "a chef cooking for a royal feast"
]


def select_test_word(sentence, grade_level, used_words):
    """
    Fallback function to select a test word from a sentence.
    Used if the AI doesn't provide a testWord.
    """
    # Remove punctuation and split into words
    words = sentence.replace('.', '').replace(',', '').replace('!', '').replace('?', '').split()

    config = GRADE_CONFIGS[grade_level]
    max_length = config['max_word_length']

    # Filter suitable words
    suitable_words = [
        word for word in words
        if 3 <= len(word) <= max_length
        and word.lower() not in used_words
        and word.isalpha()  # Only alphabetic characters
    ]

    if not suitable_words:
        # Fall back to any alphabetic word not already used
        suitable_words = [word for word in words if word.isalpha() and word.lower() not in used_words]

    if not suitable_words:
        # Last resort: use first alphabetic word
        suitable_words = [word for word in words if word.isalpha()]

    return suitable_words[0] if suitable_words else words[0]


def generate_story_with_claude(grade_level, length, prompt, random_theme):
    """
    Generate a story using Claude API with grade-appropriate content.
    """
    if not client:
        raise ValueError('Story generation not available - API key not configured')

    config = GRADE_CONFIGS[grade_level]
    sentence_count = config['sentence_counts'][length]
    vocabulary_level = config['vocabulary_level']
    word_description = config['description']

    # Use random theme if requested
    if random_theme:
        import random
        prompt = random.choice(RANDOM_THEMES)

    # For 3rd grade, we generate double sentences but only test half
    test_sentence_count = sentence_count // 2 if grade_level == '3rd' else sentence_count

    # Build the prompt for Claude
    system_prompt = f"""You are a creative children's story writer. Generate engaging, age-appropriate stories for reading practice.

Your task:
1. Write a story with EXACTLY {sentence_count} sentences for {vocabulary_level} level
2. For each sentence, select ONE test word for spelling practice
3. Test words should be {word_description}
4. Never repeat the same test word in a story
5. Prefer common, fun, thematic words (like "mermaid", "treasure", "rocket")
6. Each sentence should be clear and complete
7. The story should be coherent and entertaining

Return your response as valid JSON in this exact format:
{{
  "title": "Story Title Here",
  "sentences": [
    {{"text": "First sentence here.", "testWord": "selected"}},
    {{"text": "Second sentence here.", "testWord": "another"}}
  ]
}}

IMPORTANT:
- Return ONLY valid JSON, no other text
- Use exactly {sentence_count} sentences
- Ensure all testWords are different
- Each testWord must appear in its sentence
- Keep vocabulary appropriate for {vocabulary_level}"""

    user_prompt = f"Write a story about: {prompt}"

    try:
        logger.info(f"Generating {length} story for {grade_level}: {prompt}")

        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4000,
            temperature=1.0,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        # Extract the response text
        response_text = message.content[0].text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]  # Remove ```json
        if response_text.startswith('```'):
            response_text = response_text[3:]  # Remove ```
        if response_text.endswith('```'):
            response_text = response_text[:-3]  # Remove trailing ```
        response_text = response_text.strip()

        # Parse JSON response
        story_data = json.loads(response_text)

        # Validate response structure
        if 'title' not in story_data or 'sentences' not in story_data:
            raise ValueError("Invalid story structure: missing title or sentences")

        sentences = story_data['sentences']

        # Validate sentence count
        if len(sentences) != sentence_count:
            logger.warning(f"Expected {sentence_count} sentences, got {len(sentences)}")

        # Process sentences and ensure testWord is present and valid
        used_words = set()
        processed_sentences = []

        for i, sentence_obj in enumerate(sentences):
            text = sentence_obj.get('text', '')
            test_word = sentence_obj.get('testWord', '')

            # Validate testWord
            if not test_word or test_word.lower() not in text.lower():
                # Fallback: select a word from the sentence
                test_word = select_test_word(text, grade_level, used_words)
                logger.warning(f"Sentence {i+1}: Invalid testWord, selected '{test_word}' as fallback")

            # Check for duplicates
            if test_word.lower() in used_words:
                # Try to find alternative word
                test_word = select_test_word(text, grade_level, used_words)
                logger.warning(f"Sentence {i+1}: Duplicate testWord, selected '{test_word}' as alternative")

            used_words.add(test_word.lower())

            # For 3rd grade, only mark every other sentence for testing
            include_test = True
            if grade_level == '3rd':
                include_test = (i % 2 == 0)  # Test even-indexed sentences (0, 2, 4, ...)

            processed_sentences.append({
                'text': text,
                'testWord': test_word if include_test else None
            })

        result = {
            'title': story_data['title'],
            'sentences': processed_sentences
        }

        logger.info(f"Successfully generated story: {result['title']} ({len(processed_sentences)} sentences)")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.error(f"Response text: {response_text}")
        raise ValueError(f"Invalid JSON response from AI: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating story: {e}")
        raise


# ============================================================================
# Flask Routes - Static Files
# ============================================================================

@app.route('/')
def serve_index():
    """Serve the main index.html file."""
    return send_from_directory(DIRECTORY, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS, images, etc.)."""
    try:
        return send_from_directory(DIRECTORY, path)
    except Exception as e:
        logger.error(f"Error serving {path}: {e}")
        return f"File not found: {path}", 404


# ============================================================================
# Flask Routes - API Endpoints
# ============================================================================

@app.route('/api/generate-story', methods=['POST'])
def api_generate_story():
    """
    Generate a story based on user input.

    Request body:
    {
        "gradeLevel": "1st",
        "length": "short",
        "prompt": "space adventure with a brave astronaut",
        "random": false
    }

    Response:
    {
        "success": true,
        "story": {
            "title": "The Space Explorer",
            "sentences": [...]
        }
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        grade_level = data.get('gradeLevel')
        length = data.get('length')
        prompt = data.get('prompt', '')
        random_theme = data.get('random', False)

        if not grade_level or grade_level not in GRADE_CONFIGS:
            return jsonify({
                'success': False,
                'error': f'Invalid gradeLevel. Must be one of: {list(GRADE_CONFIGS.keys())}'
            }), 400

        if not length or length not in ['tiny', 'short', 'medium']:
            return jsonify({
                'success': False,
                'error': 'Invalid length. Must be one of: tiny, short, medium'
            }), 400

        if not random_theme and not prompt.strip():
            return jsonify({
                'success': False,
                'error': 'Prompt is required when random is false'
            }), 400

        # Generate the story
        story = generate_story_with_claude(grade_level, length, prompt, random_theme)

        return jsonify({
            'success': True,
            'story': story
        })

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again.'
        }), 500


@app.route('/api/health', methods=['GET'])
def api_health():
    """Simple health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'anthropic_configured': client is not None
    })


# ============================================================================
# File Watcher
# ============================================================================

class FileWatcher:
    """Simple file watcher that checks for changes."""

    def __init__(self, directory, extensions=None):
        self.directory = Path(directory)
        self.extensions = extensions or ['.html', '.css', '.js']
        self.last_modified = {}
        self._scan_files()

    def _scan_files(self):
        """Scan all files and store their modification times."""
        for ext in self.extensions:
            for file_path in self.directory.glob(f"*{ext}"):
                self.last_modified[file_path] = file_path.stat().st_mtime

    def check_changes(self):
        """Check if any files have been modified."""
        changed_files = []
        for ext in self.extensions:
            for file_path in self.directory.glob(f"*{ext}"):
                current_mtime = file_path.stat().st_mtime
                if file_path not in self.last_modified or self.last_modified[file_path] != current_mtime:
                    changed_files.append(file_path.name)
                    self.last_modified[file_path] = current_mtime
        return changed_files


def watch_files():
    """Background thread to watch for file changes."""
    watcher = FileWatcher(DIRECTORY)

    print("\n👀 Watching for file changes...")
    print("   Monitoring: HTML, CSS, and JS files")
    print("   (Changes will be detected automatically)\n")

    while True:
        time.sleep(1)  # Check every second
        changed = watcher.check_changes()
        if changed:
            print(f"\n🔄 File(s) changed: {', '.join(changed)}")
            print("   → Refresh your browser to see updates\n")


def open_browser():
    """Open browser after a short delay."""
    time.sleep(1.5)
    print(f"\n🚀 Opening browser at http://localhost:{PORT}\n")
    webbrowser.open(f"http://localhost:{PORT}")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    # Change to the project directory
    os.chdir(DIRECTORY)

    # Print startup banner
    print("=" * 60)
    print("🏠 Family Dashboard Server")
    print("=" * 60)
    print(f"📂 Serving files from: {DIRECTORY}")
    print(f"🌐 Server running at: http://localhost:{PORT}")
    print(f"📖 Reading Game API: http://localhost:{PORT}/api/generate-story")
    print(f"💚 Health Check: http://localhost:{PORT}/api/health")
    print("=" * 60)
    print("\n💡 Features:")
    print("   • Static file serving (HTML, CSS, JS)")
    print("   • Story generation API (Anthropic Claude)")
    print("   • File watching with auto-reload notifications")
    print("=" * 60)
    print("\n💡 Tips:")
    print("   • Server will stay running until you close this window")
    print("   • File changes are monitored automatically")
    print("   • Press Ctrl+C to stop the server")
    print("=" * 60)

    # Start file watcher in background thread
    watcher_thread = threading.Thread(target=watch_files, daemon=True)
    watcher_thread.start()

    # Open browser in background thread
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()

    # Start Flask server
    try:
        # Disable Flask's default auto-reloader to use our custom file watcher
        app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
        sys.exit(0)
