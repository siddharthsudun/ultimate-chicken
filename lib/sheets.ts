import { google } from 'googleapis'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const RANGE = 'Waitlist!A:E'

export async function initSheet() {
  const sheets = getSheetsClient()
  // Check if headers exist, if not, add them
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Waitlist!A1:E1',
    })
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Waitlist!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Email', 'Name', 'Joined At', 'Source', 'Newsletter Sent']],
        },
      })
    }
  } catch {
    // Sheet might not have "Waitlist" tab - create it
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: 'Waitlist' }
            }
          }]
        }
      })
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Waitlist!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Email', 'Name', 'Joined At', 'Source', 'Newsletter Sent']],
        },
      })
    } catch {
      // Tab might already exist, ignore
    }
  }
}

export async function addToWaitlist(email: string, name?: string, source = 'website') {
  const sheets = getSheetsClient()

  // Check for duplicate
  const existing = await getAllEmails()
  if (existing.includes(email.toLowerCase())) {
    return { success: false, isDuplicate: true }
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        email.toLowerCase(),
        name || '',
        new Date().toISOString(),
        source,
        'false',
      ]],
    },
  })

  return { success: true, isDuplicate: false }
}

export async function getAllEmails(): Promise<string[]> {
  const sheets = getSheetsClient()
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Waitlist!A2:A',
    })
    return (res.data.values || []).map((row) => (row[0] || '').toLowerCase())
  } catch {
    return []
  }
}

export async function getAllSubscribers(): Promise<Array<{
  email: string
  name: string
  joinedAt: string
  source: string
}>> {
  const sheets = getSheetsClient()
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Waitlist!A2:E',
    })
    return (res.data.values || []).map((row) => ({
      email: row[0] || '',
      name: row[1] || '',
      joinedAt: row[2] || '',
      source: row[3] || 'website',
    }))
  } catch {
    return []
  }
}

export async function getSubscriberCount(): Promise<number> {
  const emails = await getAllEmails()
  return emails.length
}

// Log newsletter send in a separate tab
export async function logNewsletterSend(subject: string, recipientCount: number, sentBy: string) {
  const sheets = getSheetsClient()
  try {
    // Ensure NewsletterLog tab exists
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'NewsletterLog!A:D',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          new Date().toISOString(),
          subject,
          recipientCount,
          sentBy,
        ]],
      },
    })
  } catch {
    // Ignore if log tab doesn't exist
  }
}
