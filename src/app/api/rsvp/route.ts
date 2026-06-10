import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the shape of our RSVP data
type RsvpData = {
    name: string;
    attendance: string;
    guests: number;
    message: string;
    timestamp: string;
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const newEntry: RsvpData = {
            name: body.name,
            attendance: body.attendance,
            guests: parseInt(body.guests) || 0,
            message: body.message || "",
            timestamp: new Date().toISOString()
        };

        // Path to the JSON file where we will store data
        const dataFilePath = path.join(process.cwd(), 'data.json');
        
        let currentData: RsvpData[] = [];
        
        // Read existing data if the file exists
        if (fs.existsSync(dataFilePath)) {
            const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
            try {
                currentData = JSON.parse(fileContent);
            } catch (e) {
                console.error("Error parsing existing data.json", e);
            }
        }
        
        // Append new entry
        currentData.push(newEntry);
        
        // Write back to file
        fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2));
        
        return NextResponse.json({ success: true, message: "RSVP saved successfully!" });
    } catch (error) {
        console.error("Error saving RSVP:", error);
        return NextResponse.json({ success: false, message: "Failed to save RSVP" }, { status: 500 });
    }
}
