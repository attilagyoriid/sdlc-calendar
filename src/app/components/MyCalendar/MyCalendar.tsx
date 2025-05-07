// src/app/components/MyCalendar/MyCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./MyCalendar.module.scss";
import EventForm, { EventFormData, CalendarEvent } from "../EventForm";
import { fetchEvents, deleteEventAction } from "../../actions/eventActions"; // Import deleteEvent
import { showCustomToast } from "../../components/CustomToast";

export default function MyCalendar() {
  // Specify the type for events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    id: "",
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "17:00",
    color: "#4285F4",
    systems: [],
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("MyCalendar component rendered");

  // Fetch events from the database
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching events from database...");
      const data = await fetchEvents();
      console.log("Fetched events:", data);

      // Format events for FullCalendar
      const formattedEvents = data.map((event) => ({
        ...event,
        // Ensure these properties are set correctly for FullCalendar
        backgroundColor: event.backgroundColor || event.color || "#4285F4",
        borderColor: event.backgroundColor || event.color || "#4285F4",
        textColor: getContrastColor(
          event.backgroundColor || event.color || "#4285F4"
        ),
      }));

      console.log("Formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error("Error loading events:", err);
      const errorMessage = `Failed to load events: ${err.message}`;
      setError(errorMessage);
      showCustomToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine text color based on background color
  const getContrastColor = (hexColor: string): string => {
    // Remove the # if it exists
    hexColor = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Handle date selection
  const handleDateSelect = (selectInfo: any) => {
    const startDate = new Date(selectInfo.startStr);
    const formattedStartDate = startDate.toISOString().split("T")[0];

    setFormData({
      id: "",
      title: "",
      description: "",
      startDate: formattedStartDate,
      startTime: "09:00",
      endDate: formattedStartDate,
      endTime: "17:00",
      color: "#4285F4",
      systems: [],
    });
    setIsEdit(false);
    setShowModal(true);
  };

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate);

    // Adjust end date for all-day events (FullCalendar adds a day)
    if (event.allDay && event.end) {
      endDate.setDate(endDate.getDate() - 1);
    }

    setFormData({
      id: event.id,
      title: event.title,
      description: event.extendedProps.description || "",
      startDate: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().substring(0, 5),
      endDate: endDate.toISOString().split("T")[0],
      endTime: endDate.toTimeString().substring(0, 5),
      color: event.backgroundColor || event.color || "#4285F4",
      systems: event.extendedProps.systems || [],
    });

    setIsEdit(true);
    setShowModal(true);
  };

  // Handle form success
  const handleFormSuccess = async () => {
    setShowModal(false);
    await loadEvents(); // Reload events after successful form submission
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    try {
      console.log("Deleting event with ID:", id);

      // Call the deleteEvent function from your actions
      const result = await deleteEventAction(id);

      if (result.success) {
        showCustomToast("Event deleted successfully", "success");
        setShowModal(false);
        await loadEvents(); // Reload events after deletion
      } else {
        showCustomToast(result.error || "Failed to delete event", "error");
      }
    } catch (err: any) {
      console.error("Error deleting event:", err);
      showCustomToast(`Failed to delete event: ${err.message}`, "error");
    }
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendar}>
        {loading ? (
          <div className={styles.loading}>Loading events...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            events={events}
            eventClick={handleEventClick}
            selectable={true}
            select={handleDateSelect}
            height="auto"
            aspectRatio={1.8}
            editable={true}
            dayMaxEvents={true}
            eventColor="#4285F4" // Default color
            eventBackgroundColor="#4285F4" // Default background color
            eventBorderColor="#4285F4" // Default border color
            eventTextColor="#FFFFFF" // Default text color
          />
        )}
      </div>

      {/* Event Form Modal */}
      {showModal && (
        <EventForm
          isEdit={isEdit}
          formData={formData}
          onSuccess={handleFormSuccess}
          onDelete={handleDeleteEvent} // Add the onDelete prop
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
