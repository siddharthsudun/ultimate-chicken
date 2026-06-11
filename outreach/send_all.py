#!/usr/bin/env python3
"""
Ultimate Chicken — Bulk Email Sender via Gmail
Sends all drafted contacts using Gmail SMTP.

Usage:
    python3 outreach/send_all.py

Requirements: none (uses Python stdlib only)
"""

import json
import smtplib
import sys
import time
import getpass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from datetime import datetime

CONTACTS_FILE = Path(__file__).parent / "contacts_web.json"
SENT_LOG      = Path(__file__).parent / "sent_log.txt"

# Gmail SMTP
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Delay between emails (seconds) — keeps Gmail happy, avoids spam flags
DELAY = 3


def load_contacts():
    return json.loads(CONTACTS_FILE.read_text())


def save_contacts(contacts):
    CONTACTS_FILE.write_text(json.dumps(contacts, indent=2, ensure_ascii=False))


def log(msg):
    with open(SENT_LOG, "a") as f:
        f.write(f"[{datetime.now().isoformat()}] {msg}\n")


def send_email(smtp, from_addr, contact):
    draft = contact.get("draft", {})
    subject = draft.get("subject", "")
    body = draft.get("body", "")

    if not subject or not body:
        return False, "No draft"

    msg = MIMEMultipart("alternative")
    msg["From"]    = f"Siddharth Sudunagunta <{from_addr}>"
    msg["To"]      = contact["email"]
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    smtp.sendmail(from_addr, contact["email"], msg.as_string())
    return True, "ok"


def main():
    contacts = load_contacts()

    to_send = [c for c in contacts if c.get("status") == "drafted"]
    sent_ct = len([c for c in contacts if c.get("status") == "sent"])

    print("─" * 60)
    print("  ULTIMATE CHICKEN — BULK EMAIL SENDER")
    print("─" * 60)
    print(f"  Drafted and ready to send : {len(to_send)}")
    print(f"  Already sent              : {sent_ct}")
    print(f"  Total contacts            : {len(contacts)}")
    print()

    if not to_send:
        print("  Nothing to send. All contacts already sent.")
        return

    # ── Credentials ──────────────────────────────────────────────────────────
    print("  Gmail credentials")
    print("  (Use your App Password — myaccount.google.com → Security → App passwords)")
    print()
    email_addr = input("  Gmail address: ").strip()
    app_password = getpass.getpass("  App Password (hidden): ").strip().replace(" ", "")

    print()
    print(f"  Sending from : {email_addr}")
    print(f"  Recipients   : {len(to_send)}")
    print()

    # ── Filter options ────────────────────────────────────────────────────────
    print("  Send options:")
    print("  [1] Send ALL categories (VCs + QSR + Distributors + QuickCommerce)")
    print("  [2] QuickCommerce only (Blinkit/Zepto/Swiggy)")
    print("  [3] VCs only")
    print("  [4] QSR only")
    print("  [5] Distributors only")
    print()
    choice = input("  Your choice [1-5, default=1]: ").strip() or "1"

    cat_filter = {
        "1": None,
        "2": "QUICKCOMMERCE",
        "3": "VC",
        "4": "QSR",
        "5": "DISTRIBUTOR",
    }.get(choice)

    if cat_filter:
        batch = [c for c in to_send if c["category"] == cat_filter]
    else:
        batch = to_send

    print()
    print(f"  Will send {len(batch)} emails. Starting in 3 seconds...")
    time.sleep(3)

    # ── Connect to Gmail ──────────────────────────────────────────────────────
    try:
        smtp = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        smtp.ehlo()
        smtp.starttls()
        smtp.login(email_addr, app_password)
        print("  ✓ Gmail connected\n")
    except Exception as e:
        print(f"\n  ✗ Gmail login failed: {e}")
        print("  Make sure you're using an App Password, not your regular password.")
        print("  Generate one at: myaccount.google.com → Security → App passwords")
        sys.exit(1)

    # ── Send loop ─────────────────────────────────────────────────────────────
    ok = 0
    fail = 0
    fail_list = []

    contact_map = {c["id"]: i for i, c in enumerate(contacts)}

    for i, c in enumerate(batch, 1):
        name    = c["name"]
        company = c["company"]
        email   = c["email"]
        cat     = c["category"]

        print(f"  [{i:3}/{len(batch)}] {name} @ {company} ({cat})", end=" ... ", flush=True)

        try:
            success, msg = send_email(smtp, email_addr, c)
            if success:
                # Mark as sent in contacts list
                idx = contact_map[c["id"]]
                contacts[idx]["status"] = "sent"
                contacts[idx]["sentAt"] = datetime.utcnow().isoformat() + "Z"
                save_contacts(contacts)  # save after each send so progress isn't lost
                log(f"SENT | {cat} | {name} | {company} | {email}")
                print("✓ sent")
                ok += 1
            else:
                print(f"✗ skipped ({msg})")
                fail += 1
                fail_list.append((name, company, email, msg))
        except Exception as e:
            err = str(e)
            print(f"✗ FAILED — {err}")
            log(f"FAIL | {cat} | {name} | {company} | {email} | {err}")
            fail += 1
            fail_list.append((name, company, email, err))

        if i < len(batch):
            time.sleep(DELAY)

    smtp.quit()

    # ── Summary ───────────────────────────────────────────────────────────────
    print()
    print("─" * 60)
    print(f"  ✅ Sent    : {ok}")
    print(f"  ✗ Failed  : {fail}")
    print(f"  Log saved : {SENT_LOG}")
    print("─" * 60)

    if fail_list:
        print("\n  Failed emails:")
        for name, company, email, err in fail_list:
            print(f"    {name} @ {company} ({email}): {err}")


if __name__ == "__main__":
    main()
