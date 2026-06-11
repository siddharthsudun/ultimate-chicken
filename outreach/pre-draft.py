#!/usr/bin/env python3
"""
Ultimate Chicken — Bulk Draft Generator
Generates personalized email drafts for all 204 contacts without needing an API key.
Uses smart templates tailored to each category.

Usage:
    python3 outreach/pre-draft.py

Run from the project root. Updates contacts_web.json with status="drafted" for all contacts.
"""

import json
import re
from pathlib import Path

CONTACTS_FILE = Path(__file__).parent / "contacts_web.json"

SIGN_OFF = "Siddharth Sudunagunta\nFounder — Ultimate Chicken | BITS Pilani '27\n+91 90007 33229\nsiddharth@ultimatechicken.in"


def first_name(name: str) -> str:
    return name.split()[0]


def vc_draft(c: dict) -> tuple[str, str]:
    name = first_name(c["name"])
    company = c["company"]
    notes = c.get("notes", "")

    # Personalize subject based on firm focus
    if any(x in notes.lower() for x in ["consumer", "d2c", "food", "agri"]):
        subject = f"Ultimate Chicken — building India's premium protein brand | quick call?"
    elif "surge" in notes.lower() or "accelerator" in notes.lower():
        subject = f"Ultimate Chicken x {company} — early-stage consumer food, BITS founder"
    elif "angel" in notes.lower() or "syndicate" in notes.lower():
        subject = f"Ultimate Chicken — pre-seed round, BITS Pilani founder"
    else:
        subject = f"Ultimate Chicken — 15 mins, {name}?"

    # Personalize opening based on their background
    if "ninjacart" in notes.lower() or "agri" in notes.lower():
        opener = f"Hi {name},\n\nYour work at Ninjacart caught my attention — you understand the fresh food supply chain better than anyone. I'm building on the consumer end of that problem."
    elif "sugar" in notes.lower() or "mamaearth" in notes.lower() or "consumer brand" in notes.lower():
        opener = f"Hi {name},\n\nYou've backed some of India's best D2C consumer brands. I think Ultimate Chicken fits the same playbook — premium, category-creating, Gen Z."
    elif "surge" in notes.lower():
        opener = f"Hi {name},\n\nI'm applying to Surge's next cohort — but wanted to reach out directly first."
    elif "early-stage" in notes.lower() or "seed" in notes.lower():
        opener = f"Hi {name},\n\nBuilding at the earliest stage right now — thought you'd want to see this."
    else:
        opener = f"Hi {name},\n\nI'm a founder at BITS Pilani building something in the consumer protein space — wanted to get it in front of you directly."

    body = f"""{opener}

Ultimate Chicken: ready-to-eat sous vide chicken pouches. 27g protein, 150 cal, zero additives, eat from the wrapper.

India's ₹80,000cr+ packaged food market is shifting — Gen Z fitness culture is real and growing, and there's no premium, clean-label protein brand owning this consumer. We're building that brand.

Starting at BITS Pilani (17,000 students, strong gym culture). Three flavors. Eurofins-tested clean label. Sous vide cooked — the same technique Michelin-star restaurants use.

I'm Siddharth, 2nd-year ECE at BITS Pilani ('27), co-founder with Mithielesh (CMO).

Would love 15 minutes to share where we are. Worth a call?

{SIGN_OFF}"""

    return subject, body


def qsr_draft(c: dict) -> tuple[str, str]:
    name = first_name(c["name"])
    company = c["company"]
    role = c.get("role", "")
    notes = c.get("notes", "")

    # Company-specific personalization
    if "rebel foods" in company.lower():
        angle = "Your cloud kitchen network is perfectly positioned for this — a premium protein add-on that requires zero kitchen prep."
    elif "devyani" in company.lower() or "kfc" in company.lower():
        angle = "Your QSR scale gives you the distribution to make a premium protein add-on work at volume."
    elif "jubilant" in company.lower() or "dominos" in company.lower():
        angle = "Think of it as the high-protein side that your fitness-conscious customers have been asking for."
    elif "wow momo" in company.lower() or "wow!" in company.lower():
        angle = "Your brand already speaks to the value-conscious young consumer — this is the premium protein upgrade they're looking for."
    elif "biryani" in company.lower():
        angle = "Premium protein as a high-margin add-on — your customers who order biryani are exactly the protein-conscious consumer we're targeting."
    elif "barbeque nation" in company.lower():
        angle = "Your grill-forward menu is perfect for a premium protein product. This could be a standout menu addition."
    else:
        angle = "A premium ready-to-eat protein product that your fitness-conscious customers are already looking for."

    if "procurement" in role.lower() or "supply" in role.lower():
        cta = "Happy to share pricing, MOQ, and supply specs — can we set up a quick call?"
    else:
        cta = "I'd love to send a sample pack — no commitment, just try it. Worth a quick call to align on fit?"

    subject = f"Ultimate Chicken — premium protein for {company} | sample offer"

    body = f"""Hi {name},

{angle}

Ultimate Chicken is a ready-to-eat sous vide chicken pouch — 27g protein, 150 calories, zero additives. Three flavors: Korean BBQ, Spicy Peri Peri, Lemon Herb. No cooking needed, eat straight from the wrapper.

Why it works for you:
→ Zero kitchen prep — just stock and sell
→ Premium margin SKU in the fastest-growing food category
→ Clean label — Eurofins-tested, no preservatives, no oil
→ Sous vide cooked — consistently juicy, high quality

We're onboarding select QSR and food service partners in Hyderabad to start. {cta}

{SIGN_OFF}"""

    return subject, body


def distributor_draft(c: dict) -> tuple[str, str]:
    name = first_name(c["name"])
    company = c["company"]
    notes = c.get("notes", "")

    # Hyderabad vs other cities
    city = c.get("city", "Hyderabad")
    if city.lower() == "hyderabad":
        geo = "We're starting distribution from Hyderabad and you're the natural first partner here."
    else:
        geo = f"We're expanding beyond Hyderabad and {city} is a priority market — looking for the right partner."

    # Metro/wholesale vs traditional distributor
    if "metro" in company.lower() or "cash & carry" in company.lower():
        angle = "Your HORECA network in Hyderabad gives you the reach we need — and ready-to-eat premium protein is exactly what your restaurant buyers are asking for."
        cta = "Worth a quick meeting to discuss stocking in your Hyderabad outlets?"
    elif "hospital" in notes.lower() or "institutional" in notes.lower():
        angle = "Institutional and hospital catering is a strong fit for a high-protein, zero-additive product."
        cta = "Can we set up a quick call to discuss volumes and supply terms?"
    else:
        angle = "Ready-to-eat premium protein pouches are a fast-growing SKU — early distribution partnerships get the best margins."
        cta = "Can we get on a call to discuss volumes, margins, and logistics?"

    subject = f"Ultimate Chicken — distribution partnership in {city} | premium protein pouch"

    body = f"""Hi {name},

I'm reaching out about a distribution partnership for Ultimate Chicken — India's first premium ready-to-eat sous vide chicken pouch.

27g protein, 150 cal, zero additives. Three flavors. Eurofins-tested clean label. No cooking required.

{angle}

Why this is a good SKU for your portfolio:
→ Premium D2C brand with strong Gen Z positioning
→ High repeat purchase category (daily protein)
→ Differentiated product — no direct competition in the segment
→ Shelf-stable, easy to handle

{geo}

{cta}

{SIGN_OFF}"""

    return subject, body


def qc_draft(c: dict) -> tuple[str, str]:
    name = first_name(c["name"])
    company = c["company"]
    role = c.get("role", "")
    notes = c.get("notes", "")

    # Platform-specific angle
    if "blinkit" in company.lower():
        platform = "Blinkit"
        platform_angle = "Blinkit's category expansion into premium ready-to-eat is a clear market signal — this is the product that fits."
    elif "zepto" in company.lower():
        platform = "Zepto"
        platform_angle = "Zepto's push into premium fresh categories is exactly where Ultimate Chicken belongs."
    elif "swiggy" in company.lower() or "instamart" in company.lower():
        platform = "Swiggy Instamart"
        platform_angle = "Instamart's fresh and ready-to-eat category is growing fast — Ultimate Chicken is built for this channel."
    elif "bigbasket" in company.lower():
        platform = "BigBasket"
        platform_angle = "BigBasket's premium Tier 1 urban consumer is exactly our target — high protein, clean label, premium price point."
    else:
        platform = company
        platform_angle = "Quick commerce is the ideal channel for a high-protein, grab-and-go product."

    if "category" in role.lower() or "procurement" in role.lower() or "manager" in role.lower():
        cta = "What's the seller onboarding process for a new SKU like this? Happy to share product specs, shelf life data, and Eurofins lab reports."
    else:
        cta = "Would love to connect you with the right person on your team to get this onboarded. Can you point me in the right direction?"

    subject = f"Ultimate Chicken on {platform} — ready-to-eat protein pouch, category fit?"

    body = f"""Hi {name},

{platform_angle}

Ultimate Chicken: ready-to-eat sous vide chicken pouches. 27g protein, 150 calories, zero additives, eat from the wrapper.

→ Shelf-stable (no cold chain needed for distribution)
→ 3 flavors: Korean BBQ, Spicy Peri Peri, Lemon Herb
→ Clean label: Eurofins-tested, zero preservatives, zero oil
→ Premium price point — Rs 149-199 per pouch
→ High repeat purchase: daily protein for gym-goers

Ready-to-eat protein is one of the fastest-growing sub-categories in quick commerce. We're building the brand that owns this.

{cta}

{SIGN_OFF}"""

    return subject, body


DRAFTERS = {
    "VC": vc_draft,
    "QSR": qsr_draft,
    "DISTRIBUTOR": distributor_draft,
    "QUICKCOMMERCE": qc_draft,
}


def main():
    contacts = json.loads(CONTACTS_FILE.read_text())

    drafted = 0
    skipped = 0

    for c in contacts:
        if c.get("status") != "new":
            skipped += 1
            continue

        drafter = DRAFTERS.get(c["category"])
        if not drafter:
            skipped += 1
            continue

        subject, body = drafter(c)
        c["draft"] = {"subject": subject, "body": body}
        c["status"] = "drafted"
        drafted += 1

        print(f"  ✓ [{c['category']:12}] {c['name']} @ {c['company']}")

    CONTACTS_FILE.write_text(json.dumps(contacts, indent=2, ensure_ascii=False))

    print(f"\n{'─'*50}")
    print(f"  Drafted: {drafted}")
    print(f"  Skipped (already drafted/sent): {skipped}")
    print(f"  Total:   {len(contacts)}")
    print(f"\n  ✅ Saved to {CONTACTS_FILE}")
    print(f"  Open /outreach in the app to review and send.")


if __name__ == "__main__":
    main()
