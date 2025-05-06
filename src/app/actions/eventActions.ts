// src/app/actions/eventActions.ts
"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "../lib/db/connection";
import Event from "../lib/db/models/Event";
import { CalendarEvent } from "../components/EventForm";

// Helper functions (not exported directly as server actions)
function _mapToCalendarEvent(dbEvent: any): CalendarEvent {
  return {
    id: dbEvent._id.toString(),
    title: dbEvent.title,
    description: dbEvent.description,
    start: dbEvent.start,
    end: dbEvent.end,
    backgroundColor: dbEvent.backgroundColor || "#4285F4",
    allDay: dbEvent.allDay,
    extendedProps: {
      description: dbEvent.description,
      systems: dbEvent.systems || [],
    },
  };
}

// Server actions using FormData
export async function createEventAction(
  formData: FormData
): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
  try {
    console.log("Server Action: Creating new event from FormData");
    await dbConnect();

    // Extract data from FormData
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const startTime = formData.get("startTime") as string;
    const endDate = formData.get("endDate") as string;
    const endTime = formData.get("endTime") as string;
    const color = (formData.get("color") as string) || "#4285F4";
    const systemsJson = formData.get("systems") as string;
    const systems = systemsJson ? JSON.parse(systemsJson) : [];
    const isEdit = formData.get("isEdit") === "true";
    const id = formData.get("id") as string;

    // Validate required fields
    if (!title || title.length < 10) {
      return { success: false, error: "Title must be at least 10 characters" };
    }

    if (!description || description.length < 20) {
      return {
        success: false,
        error: "Description must be at least 20 characters",
      };
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      return { success: false, error: "Date and time fields are required" };
    }

    // Create event data
    const eventData = {
      title,
      description,
      start: `${startDate}T${startTime}:00`,
      end: `${endDate}T${endTime}:00`,
      backgroundColor: color,
      allDay: false,
      systems,
    };

    console.log("Creating event with data:", eventData);

    let result;
    if (isEdit && id) {
      // Update existing event
      result = await Event.findByIdAndUpdate(id, eventData, {
        new: true,
        runValidators: true,
      });

      if (!result) {
        return { success: false, error: `Event with ID ${id} not found` };
      }
    } else {
      // Create new event
      result = await Event.create(eventData);
    }

    console.log("Event saved:", result);
    revalidatePath("/");

    return {
      success: true,
      event: _mapToCalendarEvent(result),
    };
  } catch (error: any) {
    console.error("Error saving event:", error);
    return {
      success: false,
      error: `Failed to save event: ${error.message || error}`,
    };
  }
}

export async function deleteEventAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "Event ID is required" };
    }

    console.log(`Server Action: Deleting event with ID: ${id}`);
    await dbConnect();

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return { success: false, error: `Event with ID ${id} not found` };
    }

    console.log("Event deleted successfully");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: `Failed to delete event: ${error.message || error}`,
    };
  }
}

// Keep the fetch events function as is
export async function fetchEvents(): Promise<CalendarEvent[]> {
  try {
    console.log("Server Action: Fetching all events");
    await dbConnect();
    const events = await Event.find({});
    console.log(`Found ${events.length} events`);
    return events.map((event) => _mapToCalendarEvent(event));
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error(`Failed to fetch events: ${error}`);
  }
}
