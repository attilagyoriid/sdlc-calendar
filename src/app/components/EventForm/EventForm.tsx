"use client";

import { showCustomToast } from "../../components/CustomToast";
import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import styles from "./EventForm.module.scss";
import systemsData from "../../data/systems.json";
import EmailSend from "../EmailSend";
import MultiSelect from "../MultiSelect";
import {
  createEventAction,
  deleteEventAction,
} from "../../actions/eventActions";

// Define types
interface EventFormProps {
  isEdit: boolean;
  formData: EventFormData;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export interface EventFormData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  color: string;
  systems?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  backgroundColor: string;
  allDay?: boolean;
  extendedProps?: {
    description?: string;
    systems?: string[];
  };
}

// Predefined color options
const colorOptions = [
  { name: "Blue", value: "#4285F4" },
  { name: "Green", value: "#34A853" },
  { name: "Yellow", value: "#FBBC05" },
  { name: "Red", value: "#EA4335" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Teal", value: "#009688" },
];

// Submit Button Component
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  );
}

// Delete Button Component
function DeleteButton(handleDeleteEvent: () => void) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={styles.deleteButton}
      disabled={pending}
      onClick={handleDeleteEvent}
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export default function EventForm({
  isEdit,
  formData: initialFormData,
  onSuccess,
  onCancel,
  onDelete,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    ...initialFormData,
    systems: initialFormData.systems || [],
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const handleDeleteEvent = () => {
    if (isEdit && formData.id && onDelete) {
      onDelete(formData.id);
    }
  };

  // Initialize form state
  const [state, formAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const result = await createEventAction(formData);

      if (result.success) {
        showCustomToast("Event saved successfully!", "success");
        onSuccess();
        return { ...prevState, success: true };
      } else {
        showCustomToast(result.error || "Failed to save event", "error");
        return { ...prevState, error: result.error };
      }
    },
    { success: false, error: null }
  );

  // Initialize delete form state
  const [deleteState, deleteFormAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const result = await deleteEventAction(formData);

      if (result.success) {
        showCustomToast("Event deleted successfully!", "success");
        onSuccess();
        return { ...prevState, success: true };
      } else {
        showCustomToast(result.error || "Failed to delete event", "error");
        return { ...prevState, error: result.error };
      }
    },
    { success: false, error: null }
  );

  const systems = systemsData.systems || [];

  // Update form data when props change
  useEffect(() => {
    setFormData({
      ...initialFormData,
      systems: initialFormData.systems || [],
    });
  }, [initialFormData]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle systems change
  const handleSystemsChange = (selectedSystems: string[]) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      systems: selectedSystems,
    }));
  };

  // Format date for email component
  const getFormattedDateRange = () => {
    if (!formData.startDate) return "";

    const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDate = new Date(
      `${formData.endDate || formData.startDate}T${
        formData.endTime || formData.startTime
      }`
    );

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return `${startDate.toLocaleDateString(
      "en-US",
      options
    )} - ${endDate.toLocaleDateString("en-US", options)}`;
  };

  // Client-side validation before form submission
  const validateForm = (e: React.FormEvent) => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    };

    // Validate title (at least 10 characters)
    if (formData.title.length < 10) {
      newErrors.title = "Activity must be at least 10 characters";
      isValid = false;
    }

    // Validate description (at least 20 characters)
    if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
      isValid = false;
    }

    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    }

    // Validate times
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
      isValid = false;
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
      isValid = false;
    }

    // Validate end date is not before start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);

      if (end < start) {
        newErrors.endDate = "End date/time cannot be before start date/time";
        isValid = false;
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      e.preventDefault();
    }

    return isValid;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{isEdit ? "Edit Activity" : "Add New Activity"}</h2>
          <button className={styles.closeButton} onClick={onCancel}>
            &times;
          </button>
        </div>

        <form
          ref={formRef}
          action={formAction}
          onSubmit={validateForm}
          className={styles.modalForm}
        >
          {/* Hidden fields for form processing */}
          <input type="hidden" name="isEdit" value={isEdit.toString()} />
          {isEdit && <input type="hidden" name="id" value={formData.id} />}
          <input
            type="hidden"
            name="systems"
            value={JSON.stringify(formData.systems || [])}
          />

          <div className={styles.formGroup}>
            <label htmlFor="title">Activity Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? styles.inputError : ""}
              placeholder="Enter activity title (min 10 characters)"
            />
            {errors.title && (
              <div className={styles.errorMessage}>{errors.title}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? styles.inputError : ""}
              placeholder="Enter description (min 20 characters)"
              rows={3}
            />
            {errors.description && (
              <div className={styles.errorMessage}>{errors.description}</div>
            )}
          </div>

          <MultiSelect
            label="Systems"
            options={systems}
            selectedValues={formData.systems || []}
            onChange={handleSystemsChange}
            buttonText="Select Systems"
            placeholderText="No systems selected"
          />

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={errors.startDate ? styles.inputError : ""}
              />
              {errors.startDate && (
                <div className={styles.errorMessage}>{errors.startDate}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="startTime">Start Time*</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? styles.inputError : ""}
              />
              {errors.startTime && (
                <div className={styles.errorMessage}>{errors.startTime}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="endDate">End Date*</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={errors.endDate ? styles.inputError : ""}
              />
              {errors.endDate && (
                <div className={styles.errorMessage}>{errors.endDate}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endTime">End Time*</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={errors.endTime ? styles.inputError : ""}
              />
              {errors.endTime && (
                <div className={styles.errorMessage}>{errors.endTime}</div>
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Color</label>
            <div className={styles.colorOptions}>
              {colorOptions.map((color) => (
                <div
                  key={color.value}
                  className={`${styles.colorOption} ${
                    formData.color === color.value ? styles.selectedColor : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      color: color.value,
                    }))
                  }
                  title={color.name}
                />
              ))}

              {/* Custom color option */}
              <div
                className={`${styles.colorOption} ${styles.customColorOption} ${
                  !colorOptions.some((c) => c.value === formData.color)
                    ? styles.selectedColor
                    : ""
                } ${!formData.color ? styles.noColor : ""}`}
                style={{
                  backgroundColor: formData.color || "#FFFFFF",
                }}
                onClick={() => {
                  // Focus the color input when clicking on the custom color circle
                  document.getElementById("customColorInput")?.click();
                }}
                title="Custom Color"
              >
                {!formData.color && <div className={styles.colorCross} />}
              </div>
            </div>
            <input
              type="hidden"
              name="color"
              value={formData.color || "#4285F4"}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="customColorInput">Custom Color</label>
            <div className={styles.customColorContainer}>
              <input
                type="color"
                id="customColorInput"
                value={formData.color || "#4285F4"}
                onChange={(e) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    color: e.target.value,
                  }));
                }}
                className={styles.customColorInput}
              />
              <span className={styles.colorValue}>
                {formData.color || "#4285F4"}
              </span>
            </div>
          </div>

          <div className={styles.formDivider}></div>

          {/* Email Notification Section */}
          <EmailSend
            eventTitle={formData.title}
            eventDescription={formData.description}
            eventDate={getFormattedDateRange()}
          />

          <div className={styles.modalActions}>
            {isEdit && (
              <form
                ref={deleteFormRef}
                action={deleteFormAction}
                className={styles.deleteForm}
              >
                <input type="hidden" name="id" value={formData.id} />
                <DeleteButton handleDeleteEvent />
              </form>
            )}
            <SubmitButton isEdit={isEdit} />
          </div>
        </form>
      </div>
    </div>
  );
}
