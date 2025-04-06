# KABO Website

A minimalist website showcasing projects and works.

## Google Sheets Integration

This website uses Google Sheets to dynamically load project data. Follow these steps to set it up:

### 1. Create a Google Sheet

1. Create a new Google Sheet with the following columns:
   - Title (Column A)
   - Description (Column B)
   - Image URL (Column C)
   - Link URL (Column D)
   - Order (Column E, optional)

2. Make the sheet public:
   - Click "Share" in the top right
   - Change to "Anyone with the link"
   - Select "Viewer" access
   - Click "Done"

### 2. Get the Sheet ID

The Sheet ID is the long string in the URL between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

### 3. Update the Server Configuration

Open `server.js` and replace `YOUR_GOOGLE_SHEET_ID` with your actual Sheet ID:

```javascript
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
```

### 4. Add Projects to the Sheet

Add your projects to the Google Sheet. Each row represents a project that will appear on the shop page.

Example row:
| Title | Description | Image URL | Link URL | Order |
|-------|-------------|-----------|----------|-------|
| Works | A collection of thoughts... | https://example.com/image.jpg | works.html | 1 |

### 5. Run the Server

```bash
npm install
npm start
```

Visit http://localhost:3000/shop.html to see your projects.

## Troubleshooting

- If projects don't appear, check that your Google Sheet is public and the Sheet ID is correct.
- Make sure all required columns have data.
- Check the browser console for any errors. 