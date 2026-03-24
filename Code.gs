const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const FOLDER_ID = 'YOUR_FOLDER_ID';

function processReceipts() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  while (files.hasNext()) {
    const file = files.next();

    // בודק אם הקובץ כבר טופל כדי לא לשכפל נתונים
    if (file.getName().includes("-טופל")) {
      continue;
    }

    const mimeType = file.getMimeType();

    // מוודא שזה תמונה או PDF
    if (mimeType.includes('image') || mimeType === 'application/pdf') {
      const base64Data = Utilities.base64Encode(file.getBlob().getBytes());
      const result = analyzeWithGemini(base64Data, mimeType);

      if (result && result.businessName) {
        // מכניס את הנתונים לשורה חדשה בגיליון כולל הקישור לקובץ
        sheet.appendRow([new Date(), result.businessName, result.date, result.totalAmount, result.items, file.getUrl()]);

        // משנה את שם הקובץ לשם הספק-טופל
        file.setName(result.businessName + "-טופל");
      }
    }
  }
}

function analyzeWithGemini(base64Data, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const payload = {
    "contents": [{
      "parts": [
        {"text": "אתה רואה חשבון מומחה. חלץ מהחשבונית הבאה את הנתונים והחזר אותם *אך ורק* כפורמט JSON תקין עם המפתחות הבאים באנגלית (התוכן יכול להיות בעברית): businessName (שם העסק), date (תאריך הקניה), totalAmount (סכום כולל לתשלום במספרים בלבד), items (סיכום קצר של מה שנקנה). בלי שום טקסט אחר לפני או אחרי."},
        {
          "inline_data": {
            "mime_type": mimeType,
            "data": base64Data
          }
        }
      ]
    }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (data.error) {
      Logger.log("שגיאה מה-API: " + data.error.message);
      return null;
    }

    let textResponse = data.candidates[0].content.parts[0].text;

    // ניקוי הפורמט שג'מיני לפעמים מוסיף מסביב ל-JSON
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(textResponse);
  } catch (e) {
    Logger.log("שגיאה בקוד: " + e.toString());
    return null;
  }
}
