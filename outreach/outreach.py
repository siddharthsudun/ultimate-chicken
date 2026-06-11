#!/usr/bin/env python3
"""
Ultimate Chicken — Outreach Automation
Reads contacts.csv, drafts personalized emails via Claude, sends via BITS email.

Usage:
    python outreach.py draft          # Generate drafts only (review before sending)
    python outreach.py send           # Send all approved drafts in drafts/
    python outreach.py run            # Draft + prompt to send each one
    python outreach.py draft --row 3  # Draft for a single row (0-indexed, skips header)
"""

import anthropic
import csv
import os
import re
import smtplib
import sys
import textwrap
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Config ───────────────────────────────────────────────────────────────────

BITS_EMAIL       = os.environ["BITS_EMAIL"]
BITS_PASSWORD    = os.environ["BITS_EMAIL_PASSWORD"]
ANTHROPIC_KEY    = os.environ["ANTHROPIC_API_KEY"]
YOUR_NAME        = os.environ.get("YOUR_NAME", "Siddharth Sudunagunta")
YOUR_PHONE       = os.environ.get("YOUR_PHONE", "")

CONTACTS_FILE    = Path(__file__).parent / "contacts.csv"
DRAFTS_DIR       = Path(__file__).parent / "drafts"
SENT_LOG         = Path(__file__).parent / "sent_log.csv"
SMTP_HOST        = "smtp.office365.com"   # BITS Pilani uses Office 365
SMTP_PORT        = 587
MODEL            = "claude-haiku-4-5"     # Fast + cheap for bulk; change to claude-opus-4-6 for max quality

DRAFTS_DIR.mkdir(exist_ok=True)

client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# ── Brand context (injected into every prompt) ───────────────────────────────

BRAND_CONTEXT = """
You are helping draft cold outreach emails for Ultimate Chicken, a Hyderabad-based
fresh chicken startup founded by Siddharth Sudunagunta, a 2nd-year ECE student at
BITS Pilani.

About Ultimate Chicken:
- Sells premium fresh, never-frozen chicken directly to consumers and B2B clients in Hyderabad
- Farm-to-door in <4 hours, traceable sourcing, no antibiotics/hormones
- Current focus: B2B partnerships (QSR, cloud kitchens), quick-commerce onboarding (Blinkit/Zepto),
  and VC funding to scale
- Unique angle: student founder building a tech-enabled fresh protein supply chain
- Website: ultimatechicken.in (launching soon)
- Based in Hyderabad

Siddharth's background:
- 2nd year ECE, BITS Pilani (Pilani campus)
- Built the business from scratch — sourcing, logistics, tech
- Looking to raise a pre-seed round and sign first institutional B2B clients
"""

# ── Category-specific instructions ───────────────────────────────────────────

CATEGORY_INSTRUCTIONS = {
    "VC": """
Write a cold VC outreach email. Be brief (under 180 words). Goal: get a 20-min call.
Include: what we do in 1 line, market size (fresh chicken is a ₹1.5L cr market in India),
our differentiation (farm-to-door <4 hrs, no frozen), early traction (mention we have paying
customers in Hyderabad), and a clear ask (15-min intro call / zoom).
Subject line should be punchy, not generic. No buzzwords like "disruptive" or "game-changing".
""",

    "QSR": """
Write a cold B2B email to a QSR operator, cloud kitchen, or restaurant chain.
Goal: get them to try us as their chicken supplier. Be direct and practical.
Include: our value prop (fresh never-frozen, farm-to-fork traceability, daily delivery,
competitive pricing vs frozen), minimum order details (we're flexible for pilots),
and offer a free 3-day trial delivery to their kitchen.
Subject should feel like peer-to-peer, not a sales pitch.
Under 160 words.
""",

    "DISTRIBUTOR": """
Write a B2B email to a distributor or procurement head (HORECA / Metro / distributor network).
Goal: explore a distribution partnership or bulk supply agreement.
Pitch: fresh traceable chicken, consistent quality grading, cold-chain logistics,
flexible volumes, competitive margins for distributors.
Ask for a brief call or meeting to discuss volumes and pricing.
Under 160 words.
""",

    "QUICKCOMMERCE": """
Write an email to a Blinkit or Zepto category manager / city head to onboard
Ultimate Chicken onto their platform.
Be specific: we're a Hyderabad fresh chicken brand, ready to supply dark stores,
our product is premium fresh (never frozen), we can guarantee shelf life and cold-chain.
Reference how fresh protein is one of their fastest-growing categories.
Ask for the seller onboarding process or a call with the category team.
Under 160 words.
""",
}

# ── BITSian detection ─────────────────────────────────────────────────────────

BITS_DOMAINS = {
    "pilani.bits-pilani.ac.in",
    "goa.bits-pilani.ac.in",
    "hyderabad.bits-pilani.ac.in",
    "bits-pilani.ac.in",
}

BITS_KEYWORDS = [
    "bits pilani", "bits-pilani", "bitsian", "bits goa",
    "bits hyderabad", "bits pilani alumni",
]

def is_bitsian(row: dict) -> bool:
    """Return True if the contact appears to be a BITSian."""
    if str(row.get("bitsian", "")).strip().lower() in ("yes", "y", "1", "true"):
        return True
    email = row.get("email", "").lower()
    domain = email.split("@")[-1] if "@" in email else ""
    if domain in BITS_DOMAINS:
        return True
    notes = row.get("notes", "").lower()
    linkedin = row.get("linkedin_url", "").lower()
    combined = notes + " " + linkedin
    return any(kw in combined for kw in BITS_KEYWORDS)


def bitsian_note(row: dict) -> str:
    """Return a sentence to add if the contact is a BITSian."""
    if not is_bitsian(row):
        return ""
    return (
        "Since you're also from BITS, I thought I'd reach out directly — "
        "always good to connect with a fellow BITSian building something."
    )

# ── Draft generation ──────────────────────────────────────────────────────────

def draft_subject_and_body(row: dict) -> tuple[str, str]:
    """Call Claude to draft a personalized email for a contact."""
    category = row.get("category", "").upper().strip()
    category_instr = CATEGORY_INSTRUCTIONS.get(category, CATEGORY_INSTRUCTIONS["QSR"])

    bitsian_hint = ""
    if is_bitsian(row):
        bitsian_hint = (
            "\n\nIMPORTANT: This person is a BITSian (BITS Pilani alumnus/alumna). "
            "Subtly mention the BITS connection in a natural way — not sycophantic, "
            "just a brief '(fellow BITSian here)' or similar personal touch."
        )

    prompt = f"""{BRAND_CONTEXT}

Contact details:
- Name: {row.get('name', '')}
- Role: {row.get('role', '')}
- Company: {row.get('company', '')}
- City: {row.get('city', '')}
- Notes: {row.get('notes', '')}

Category instructions:
{category_instr}
{bitsian_hint}

Output format — return EXACTLY this structure, nothing else:
SUBJECT: <email subject line>
---
<email body>

Rules:
- Sign off as: {YOUR_NAME}, Founder — Ultimate Chicken | BITS Pilani '27
- Include phone {YOUR_PHONE} in signature if provided
- First name basis with recipient (use "{row.get('name','').split()[0]}")
- No placeholder text like [your name] or [X%]
- Sound like a smart, confident founder, not a sales bot
- Plain text only, no markdown
"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # Parse subject and body
    subject_match = re.match(r"^SUBJECT:\s*(.+)", raw, re.IGNORECASE)
    if subject_match:
        subject = subject_match.group(1).strip()
        body = re.sub(r"^SUBJECT:.*\n---\n?", "", raw, flags=re.IGNORECASE | re.DOTALL).strip()
    else:
        # Fallback if model didn't follow format
        lines = raw.split("\n")
        subject = lines[0].replace("Subject:", "").strip()
        body = "\n".join(lines[1:]).strip()

    return subject, body


def save_draft(row: dict, subject: str, body: str) -> Path:
    """Save a draft to the drafts/ folder."""
    safe_name = re.sub(r"[^a-z0-9_]", "_", row.get("name", "unknown").lower())
    path = DRAFTS_DIR / f"{safe_name}.txt"
    with open(path, "w") as f:
        f.write(f"TO: {row['email']}\n")
        f.write(f"SUBJECT: {subject}\n")
        f.write(f"CATEGORY: {row.get('category','')}\n")
        f.write(f"BITSIAN: {'YES' if is_bitsian(row) else 'no'}\n")
        f.write("-" * 60 + "\n")
        f.write(body)
    return path

# ── Email sending ─────────────────────────────────────────────────────────────

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send an email via BITS Pilani SMTP (Office 365). Returns True on success."""
    try:
        msg = MIMEMultipart("alternative")
        msg["From"]    = f"{YOUR_NAME} <{BITS_EMAIL}>"
        msg["To"]      = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(BITS_EMAIL, BITS_PASSWORD)
            server.sendmail(BITS_EMAIL, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"  ✗ Send failed: {e}")
        return False


def log_sent(row: dict, subject: str):
    """Append a row to sent_log.csv."""
    write_header = not SENT_LOG.exists()
    with open(SENT_LOG, "a", newline="") as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(["timestamp", "name", "email", "company", "category", "subject"])
        writer.writerow([
            datetime.now().isoformat(),
            row.get("name"),
            row.get("email"),
            row.get("company"),
            row.get("category"),
            subject,
        ])


def already_sent(email: str) -> bool:
    """Check sent_log.csv to avoid duplicates."""
    if not SENT_LOG.exists():
        return False
    with open(SENT_LOG) as f:
        return email.lower() in f.read().lower()

# ── Draft file parsing ────────────────────────────────────────────────────────

def load_draft(path: Path) -> tuple[str, str, str]:
    """Returns (to_email, subject, body) from a draft file."""
    text = path.read_text()
    lines = text.split("\n")
    to_email = subject = ""
    body_start = 0
    for i, line in enumerate(lines):
        if line.startswith("TO: "):
            to_email = line[4:].strip()
        elif line.startswith("SUBJECT: "):
            subject = line[9:].strip()
        elif line.startswith("-" * 10):
            body_start = i + 1
            break
    body = "\n".join(lines[body_start:]).strip()
    return to_email, subject, body

# ── Load contacts ─────────────────────────────────────────────────────────────

def load_contacts(target_row: int | None = None) -> list[dict]:
    with open(CONTACTS_FILE, newline="") as f:
        rows = list(csv.DictReader(f))
    if target_row is not None:
        return [rows[target_row]]
    return rows

# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_draft(target_row: int | None = None):
    """Generate drafts for all contacts (or one row)."""
    contacts = load_contacts(target_row)
    print(f"\n📝 Drafting emails for {len(contacts)} contact(s)...\n")

    for row in contacts:
        name  = row.get("name", "?")
        email = row.get("email", "")
        cat   = row.get("category", "?")
        bits  = "🎓 BITSian!" if is_bitsian(row) else ""

        print(f"  → {name} ({cat}) {bits}")
        subject, body = draft_subject_and_body(row)
        path = save_draft(row, subject, body)
        print(f"     Subject: {subject}")
        print(f"     Saved:   {path.name}\n")

    print(f"✅ Drafts in: {DRAFTS_DIR}")
    print("   Review them, edit if needed, then run:  python outreach.py send")


def cmd_send():
    """Send all drafts in drafts/. Asks for confirmation per email."""
    drafts = sorted(DRAFTS_DIR.glob("*.txt"))
    if not drafts:
        print("No drafts found. Run:  python outreach.py draft")
        return

    print(f"\n📬 Found {len(drafts)} draft(s)\n")
    sent = skipped = 0

    for path in drafts:
        to_email, subject, body = load_draft(path)
        if not to_email or not subject:
            print(f"  ⚠️  Skipping malformed draft: {path.name}")
            continue

        if already_sent(to_email):
            print(f"  ↩️  Already sent to {to_email}, skipping.")
            skipped += 1
            continue

        print(f"\n{'='*60}")
        print(f"TO:      {to_email}")
        print(f"SUBJECT: {subject}")
        print(f"{'─'*60}")
        print(textwrap.indent(body[:400] + ("..." if len(body) > 400 else ""), "  "))
        print(f"{'─'*60}")

        ans = input("Send? [y/n/e(dit)/q(uit)] ").strip().lower()
        if ans == "q":
            print("Stopped.")
            break
        if ans == "e":
            os.system(f"$EDITOR {path}")  # open in default editor
            to_email, subject, body = load_draft(path)
            ans = input("Send now? [y/n] ").strip().lower()

        if ans == "y":
            row_stub = {"email": to_email, "name": path.stem, "company": "", "category": ""}
            ok = send_email(to_email, subject, body)
            if ok:
                log_sent(row_stub, subject)
                print(f"  ✅ Sent to {to_email}")
                path.rename(path.with_suffix(".sent"))
                sent += 1
        else:
            print(f"  ⏭️  Skipped")
            skipped += 1

    print(f"\n📊 Done — Sent: {sent}  Skipped: {skipped}")


def cmd_run(target_row: int | None = None):
    """Draft + immediately review + send in one flow."""
    contacts = load_contacts(target_row)
    print(f"\n🚀 Draft-and-send for {len(contacts)} contact(s)...\n")

    sent = skipped = 0
    for row in contacts:
        name  = row.get("name", "?")
        email = row.get("email", "")
        bits  = "🎓 BITSian!" if is_bitsian(row) else ""

        if already_sent(email):
            print(f"  ↩️  Already sent to {email} ({name}), skipping.")
            skipped += 1
            continue

        print(f"\n{'='*60}")
        print(f"Drafting for {name} {bits}")
        subject, body = draft_subject_and_body(row)
        path = save_draft(row, subject, body)

        print(f"TO:      {email}")
        print(f"SUBJECT: {subject}")
        print(f"{'─'*60}")
        print(textwrap.indent(body, "  "))
        print(f"{'─'*60}")

        ans = input("Send? [y/n/e(dit)/q(uit)] ").strip().lower()
        if ans == "q":
            print("Stopped.")
            break
        if ans == "e":
            os.system(f"$EDITOR {path}")
            _, subject, body = load_draft(path)
            ans = input("Send now? [y/n] ").strip().lower()

        if ans == "y":
            ok = send_email(email, subject, body)
            if ok:
                log_sent(row, subject)
                print(f"  ✅ Sent to {email}")
                path.rename(path.with_suffix(".sent"))
                sent += 1
        else:
            print(f"  ⏭️  Skipped {name}")
            skipped += 1

    print(f"\n📊 Done — Sent: {sent}  Skipped: {skipped}")

# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0].lower()
    target_row = None
    if "--row" in args:
        idx = args.index("--row")
        try:
            target_row = int(args[idx + 1])
        except (IndexError, ValueError):
            print("--row requires an integer argument")
            sys.exit(1)

    if not CONTACTS_FILE.exists():
        print(f"contacts.csv not found at {CONTACTS_FILE}")
        print("Copy contacts_template.csv to contacts.csv and fill it in.")
        sys.exit(1)

    if cmd == "draft":
        cmd_draft(target_row)
    elif cmd == "send":
        cmd_send()
    elif cmd == "run":
        cmd_run(target_row)
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
