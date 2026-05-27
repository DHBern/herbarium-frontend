# Prepare metadata for import to UB IIIF server

The python script in this directory serves to create a csv file with metadata entries that can be imported to the UB IIIF server.

Preparation: 

* download collection csv file from UB IIIF server and store it in this directory; this file contains the sequence GUIDs that are needed for matching new metadata to existing sequences
* set correct paths and filenames in `generate-metadata-csv-for-ubiiif.py`

Usage:

* `python3 generate-metadata-csv-for-ubiiif.py`; this generates a csv file containing the metadata
* `head -n 30 herbarium-iiif-metadata.csv > metadata-import-10.csv`; this creates a file with some entries to test the import (substitute `30` and `10` for a higher value, if needed)
* (optionally) split output into smaller files: `split -d -l 15000 --additional-suffix=.csv herbarium-iiif-metadata.csv herbarium-iiif-metadata-chunk-` (adjust `l` flag as needed)
* start a metadata import task supplying the csv file (test file is quick, full file takes a few minutes, ca 15 sec/entry)
