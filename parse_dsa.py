import pdfplumber
import json
import re

PDF_PATH = "DSA_1000_Questions_MasterSheet.pdf"
OUTPUT_PATH = "questions.json"





DAY_PATTERN  = re.compile(r'^DAY\s+(\d+)\s+(EASY|MEDIUM|HARD)\s+(.+)$', re.IGNORECASE)
TOPIC_PATTERN = re.compile(r'^([A-Z][A-Z\s&/]+?)\s+E:\d+', re.IGNORECASE)
URL_PATTERN  = re.compile(r'https?://\S+')
SKIP_PATTERN = re.compile(r'^(DSA MASTER SHEET|1000 DSA Questions|Page \d+)', re.IGNORECASE)

questions = []
current_topic = "General"

with pdfplumber.open(PDF_PATH) as pdf:
    for page in pdf.pages[3:]:  # skip cover, intro, TOC
        text = page.extract_text()
        if not text:
            continue

        lines = [l.strip() for l in text.split('\n') if l.strip()]

        i = 0
        while i < len(lines):
            line = lines[i]

            # Skip header/footer lines
            if SKIP_PATTERN.search(line):
                i += 1
                continue

            # Detect topic header e.g. "ARRAYS E:15 M:10 H:5 Total: 30"
            topic_match = TOPIC_PATTERN.match(line)
            if topic_match:
                current_topic = topic_match.group(1).strip().title()
                i += 1
                continue

            # Detect question line e.g. "DAY 1 EASY Two Sum"
            day_match = DAY_PATTERN.match(line)
            if day_match:
                day_num    = int(day_match.group(1))
                difficulty = day_match.group(2).capitalize()
                title      = day_match.group(3).strip()

                # Next line: companies
                companies = ""
                if i + 1 < len(lines) and not DAY_PATTERN.match(lines[i+1]):
                    companies = lines[i + 1]
                    i += 1

                # Next line: LeetCode URL
                link = ""
                if i + 1 < len(lines):
                    url_match = URL_PATTERN.search(lines[i + 1])
                    if url_match:
                        raw = url_match.group(0).rstrip('/')
                        # Fix truncated URLs ending in "..."
                        if raw.endswith('...'):
                            raw = raw[:-3]
                        link = raw
                        i += 1

                questions.append({
                    "id":         day_num,
                    "title":      title,
                    "topic":      current_topic,
                    "difficulty": difficulty,
                    "link":       link,
                    "companies":  companies,
                    "notes":      ""
                })
                i += 1
                continue

            i += 1

# Sort by day number
questions.sort(key=lambda x: x["id"])

# Write JSON
with open(OUTPUT_PATH, 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Extracted : {len(questions)} questions")
print(f"Topics    : {sorted(set(q['topic'] for q in questions))}")
print(f"Saved to  : {OUTPUT_PATH}")
print()
print("--- First 3 ---")
for q in questions[:3]:
    print(q)
print()
print("--- Last 3 ---")
for q in questions[-3:]:
    print(q)