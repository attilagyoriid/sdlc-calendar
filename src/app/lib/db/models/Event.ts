import mongoose, { Schema } from 'mongoose';

export interface IEvent {
  id?: string;
  title: string;
  description: string;
  start: string;
  end: string;
  backgroundColor: string;
  allDay?: boolean;
  systems?: string[];
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    backgroundColor: { type: String, required: true },
    allDay: { type: Boolean, default: false },
    systems: { type: [String], default: [] }
  },
  {
    timestamps: true,
  }
);

// Check if the model already exists to prevent overwriting during hot reloads
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;