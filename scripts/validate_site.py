from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
STYLES = ROOT / "styles.css"
SCRIPT = ROOT / "script.js"

REQUIRED_FILES = [
    ROOT / "images" / "logo.svg",
    ROOT / "images" / "about-ecosystem.svg",
    ROOT / "images" / "trapcotton-card.svg",
    ROOT / "images" / "grow-kit-card.svg",
]

REQUIRED_SECTION_IDS = ["home", "about", "shop", "community", "contact"]


def main() -> int:
    errors: list[str] = []

    for path in [INDEX, STYLES, SCRIPT, *REQUIRED_FILES]:
        if not path.exists():
            errors.append(f"Missing required file: {path.relative_to(ROOT)}")

    if INDEX.exists():
        html = INDEX.read_text(encoding="utf-8")

        if "your-form-id" in html or "formspree.io" in html:
            errors.append("Placeholder form endpoint still exists in index.html.")

        if "admin@branchoffholdings.com" not in html and "admin@branchoffholdings.com" not in SCRIPT.read_text(encoding="utf-8"):
            errors.append("A live contact destination is missing.")

        for section_id in REQUIRED_SECTION_IDS:
            if f'id="{section_id}"' not in html:
                errors.append(f"Missing required section id: {section_id}")

        for match in re.findall(r'src="([^"]+)"', html):
            if match.startswith("images/") and not (ROOT / match).exists():
                errors.append(f"Missing referenced asset: {match}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("Brand site validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
