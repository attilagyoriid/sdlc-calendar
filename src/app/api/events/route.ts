import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import Event, { IEvent } from '@/app/lib/db/models/Event';

export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find({});
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const event = await Event.create(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}