# invoice-to-sheets

Google Apps Script that automatically extracts data from invoices and receipts (PDF/images) using the Gemini API, and writes the results to a Google Sheet.

## How it works

1. Reads files from a Google Drive folder
2. Sends each file to Gemini 2.5 Flash for analysis
3. Extracts: business name, date, total amount, and item summary
4. Writes the data to the active Google Sheet
5. Renames processed files with a `-טופל` suffix to avoid duplicates

## Setup

1. Open [Google Apps Script](https://script.google.com) and create a new project
2. Copy the contents of `Code.gs` into the editor
3. Set your Gemini API key:
   - Go to **Project Settings** → **Script Properties**
   - Add a property: `GEMINI_API_KEY` = your key from [Google AI Studio](https://aistudio.google.com/apikey)
4. Update `FOLDER_ID` with your Google Drive folder ID
5. Link the script to a Google Sheet (Extensions → Apps Script)
6. Run `processReceipts()`

## Output columns

| Date | Business Name | Invoice Date | Total Amount | Items | File Link |
|------|--------------|-------------|-------------|-------|-----------|

## License

MIT
