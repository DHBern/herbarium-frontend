from pathlib import Path
import csv
import json

# --------------------------------------------------
# FILES
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

JSON_FILE = BASE_DIR / "../../src/lib/data.json"

IMAGE_CSV = (
    BASE_DIR
    / "collection-076282ee-39ce-4e22-9c1b-f68de090cc9a-images.csv"
)

OUTPUT_CSV = BASE_DIR / "herbarium-iiif-metadata.csv"

# --------------------------------------------------
# FIELD MAPPING
# --------------------------------------------------
# JSON field
# -> metadata field id
# -> IIIF label
# --------------------------------------------------

FIELDS = [
    ("Catalog_Number", "catalognumber-id", "Catalog Number"),
    ("Label_Name", "labelname-id", "Label Name"),
    ("Year", "year-id", "Year"),
]

# --------------------------------------------------
# LOAD IMAGE CSV
# --------------------------------------------------

image_lookup = {}

with open(IMAGE_CSV, newline="", encoding="utf-8") as f:

    reader = csv.DictReader(f, delimiter=";")

    for row in reader:

        sequence_name = row["Sequence Name"].strip()

        if sequence_name in image_lookup:
            print(f"Duplicate Sequence Name in CSV: {sequence_name}")

        image_lookup[sequence_name] = row

print(f"Loaded {len(image_lookup)} image records")

# --------------------------------------------------
# LOAD JSON
# --------------------------------------------------

with open(JSON_FILE, encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} JSON objects")

# --------------------------------------------------
# WRITE OUTPUT
# --------------------------------------------------

matched = 0
missing = 0

with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:

    writer = csv.writer(f)

    for item in data:

        catalog_number = str(
            item.get("Catalog_Number", "")
        ).strip()

        if not catalog_number:
            print("Skipping item without Catalog_Number")
            missing += 1
            continue

        csv_row = image_lookup.get(catalog_number)

        if not csv_row:
            print(f"No matching CSV row for: {catalog_number}")
            missing += 1
            continue

        matched += 1

        # IMPORTANT:
        # Use Sequence GUID from source CSV
        sequence_guid = csv_row["Sequence GUID"].strip()

        for json_field, metadata_id, label in FIELDS:

            value = item.get(json_field, "")

            if value is None:
                continue

            value = str(value).strip()

            if not value or value.lower() == "n.a.":
                continue

            writer.writerow([
                sequence_guid,
                "metadata",
                metadata_id,
                "en",
                label,
                value
            ])

print()
print(f"Matched records : {matched}")
print(f"Missing records : {missing}")
print(f"Output written  : {OUTPUT_CSV}")
