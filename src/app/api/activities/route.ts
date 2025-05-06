// src/app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/db/connection";
import Event from "../../lib/db/models/Event";

export async function GET(request: NextRequest) {
  try {
    // Get the date and hour from query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const hour = searchParams.get("hour");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let query: any = {};

    // If both date and hour are provided, find events that overlap with the specified date and hour
    if (date && hour) {
      const startDateTime = new Date(`${date}T${hour}:00:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);

      const startDateTimeStr = startDateTime.toISOString();
      const endDateTimeStr = endDateTime.toISOString();

      // Find events that overlap with the specified hour
      query = {
        $or: [
          // Event starts during the hour
          {
            start: {
              $gte: startDateTimeStr,
              $lt: endDateTimeStr,
            },
          },
          // Event ends during the hour
          {
            end: {
              $gt: startDateTimeStr,
              $lte: endDateTimeStr,
            },
          },
          // Event spans over the hour (starts before and ends after)
          {
            start: { $lt: startDateTimeStr },
            end: { $gt: endDateTimeStr },
          },
        ],
      };
    }
    // If only date is provided, find events for the entire day
    else if (date) {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      const startOfDayStr = startOfDay.toISOString();
      const endOfDayStr = endOfDay.toISOString();

      query = {
        $or: [
          // Event starts on the day
          {
            start: {
              $gte: startOfDayStr,
              $lte: endOfDayStr,
            },
          },
          // Event ends on the day
          {
            end: {
              $gte: startOfDayStr,
              $lte: endOfDayStr,
            },
          },
          // Event spans over the day (starts before and ends after)
          {
            start: { $lt: startOfDayStr },
            end: { $gt: endOfDayStr },
          },
        ],
      };
    }

    // Find events that match the query
    const events = await Event.find(query);

    // Transform events to exclude color field
    const activitiesWithoutColor = events.map((event) => {
      const eventObj = event.toObject();
      const { backgroundColor, ...eventWithoutColor } = eventObj;

      return {
        ...eventWithoutColor,
        id: eventObj._id.toString(),
      };
    });

    return NextResponse.json(activitiesWithoutColor);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: `Failed to fetch activities: ${error}` },
      { status: 500 }
    );
  }
}
