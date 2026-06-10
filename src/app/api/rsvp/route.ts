import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const payload = {
            name: body.name,
            attendance: body.attendance,
            guests: parseInt(body.guests) || 0,
            message: body.message || "",
            timestamp: new Date().toISOString()
        };

        const googleSheetsUrl = process.env.GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbxOcU-FaUg94ggsRkYeVVbpPkC9ae1od4V2Cu6huT57LTWaVv_Bxh1RwxH6lSDWRgTF/exec";

        if (googleSheetsUrl) {
            // Forward request to Google Sheets Web App
            const response = await fetch(googleSheetsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Google Sheets API responded with status: ${response.status}`);
            }

            const result = await response.json();
            return NextResponse.json({ success: true, message: "RSVP saved to Google Sheets!" });
        }

        // Fallback for local development if GOOGLE_SHEETS_URL is not set
        const dataFilePath = path.join(process.cwd(), 'data.json');
        let currentData = [];
        
        if (fs.existsSync(dataFilePath)) {
            const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
            try {
                currentData = JSON.parse(fileContent);
            } catch (e) {
                console.error("Error parsing existing data.json", e);
            }
        }
        
        currentData.push(payload);
        fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2));
        
        return NextResponse.json({ success: true, message: "RSVP saved locally (Development fallback)." });
    } catch (error: any) {
        console.error("Error saving RSVP:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to save RSVP" }, { status: 500 });
    }
}
