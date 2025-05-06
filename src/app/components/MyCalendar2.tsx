"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./MyCalendar.module.scss";
import EventForm, { CalendarEvent, EventFormData } from "./EventForm";

// Sample event data - replace with your actual data
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Release Planning",
    description: "Plan for the next release cycle",
    start: "2024-11-15",
    end: "2024-11-17",
    backgroundColor: "#4285F4",
    allDay: true,
    extendedProps: {
      description: "Plan for the next release cycle",
      systems: ["PAT", "IHR"],
    },
  },
  {
    id: "2",
    title: "Sprint Review",
    description: "Review sprint accomplishments",
    start: "2024-11-20",
    backgroundColor: "#34A853",
    allDay: true,
    extendedProps: {
      description: "Review sprint accomplishments",
      systems: ["FE0"],
    },
  },
  {
    id: "3",
    title: "Deployment",
    description: "Deploy to production",
    start: "2024-11-25",
    backgroundColor: "#FBBC05",
    allDay: true,
    extendedProps: {
      description: "Deploy to production",
      systems: ["PAT", "OV1"],
    },
  },
  {
    id: "4",
    title: "Retrospective",
    description: "Team retrospective meeting",
    start: "2024-11-27",
    backgroundColor: "#EA4335",
    allDay: true,
    extendedProps: {
      description: "Team retrospective meeting",
      systems: ["PAT", "IHR", "FE0", "OV1"],
    },
  },
];

export default function MyCalendar() {
  console.log("MyCalendar component rendered");
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
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
      color: event.backgroundColor,
      systems: event.extendedProps.systems || [],
    });

    setIsEdit(true);
    setShowModal(true);
  };

  // Handle form submission
  const handleFormSubmit = (newEvent: CalendarEvent) => {
    if (isEdit) {
      // Update existing event
      setEvents(
        events.map((event) => (event.id === newEvent.id ? newEvent : event))
      );
    } else {
      // Add new event
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
  };

  // Handle event deletion
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    setShowModal(false);
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendar}>
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
        />
      </div>

      {/* Event Form Modal */}
      {showModal && (
        <EventForm
          isEdit={isEdit}
          formData={formData}
          onSubmit={handleFormSubmit}
          onDelete={handleDeleteEvent}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
