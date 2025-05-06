import { CalendarEvent } from '../components/EventForm';

// Convert database event to calendar event
const mapToCalendarEvent = (dbEvent: any): CalendarEvent => {
  return {
    id: dbEvent._id,
    title: dbEvent.title,
    description: dbEvent.description,
    start: dbEvent.start,
    end: dbEvent.end,
    backgroundColor: dbEvent.backgroundColor,
    allDay: dbEvent.allDay,
    extendedProps: {
      description: dbEvent.description,
      systems: dbEvent.systems
    }
  };
};

// Convert calendar event to database event
const mapToDatabaseEvent = (calendarEvent: CalendarEvent) => {
  return {
    title: calendarEvent.title,
    description: calendarEvent.description || calendarEvent.extendedProps?.description || '',
    start: calendarEvent.start,
    end: calendarEvent.end || calendarEvent.start,
    backgroundColor: calendarEvent.backgroundColor,
    allDay: calendarEvent.allDay || false,
    systems: calendarEvent.extendedProps?.systems || []
  };
};

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const data = await response.json();
    return data.map(mapToCalendarEvent);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const createEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapToDatabaseEvent(event)),
    });
    
    if (!response.ok) throw new Error('Failed to create event');
    
    const data = await response.json();
    return mapToCalendarEvent(data);
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    const response = await fetch(`/api/events/id?id=${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapToDatabaseEvent(event)),
    });
    
    if (!response.ok) throw new Error('Failed to update event');
    
    const data = await response.json();
    return mapToCalendarEvent(data);
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/events/id?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete event');
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};