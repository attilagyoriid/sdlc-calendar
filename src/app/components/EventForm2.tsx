'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MyCalendar.module.scss';
import systemsData from '../data/systems.json';
import EmailSend from './EmailSend';

// Define types
interface EventFormProps {
  isEdit: boolean;
  formData: EventFormData;
  onSubmit: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
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
  { name: 'Blue', value: '#4285F4' },
  { name: 'Green', value: '#34A853' },
  { name: 'Yellow', value: '#FBBC05' },
  { name: 'Red', value: '#EA4335' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Teal', value: '#009688' },
];

export default function EventForm({ isEdit, formData: initialFormData, onSubmit, onDelete, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    ...initialFormData,
    systems: initialFormData.systems || []
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  
  const [showSystemsDropdown, setShowSystemsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const systems = systemsData.systems || [];

  // Update form data when props change
  useEffect(() => {
    setFormData({
      ...initialFormData,
      systems: initialFormData.systems || []
    });
  }, [initialFormData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSystemsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    };

    // Validate title (at least 10 characters)
    if (formData.title.length < 10) {
      newErrors.title = 'Activity must be at least 10 characters';
      isValid = false;
    }

    // Validate description (at least 20 characters)
    if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
      isValid = false;
    }

    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    }

    // Validate times
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
      isValid = false;
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
      isValid = false;
    }

    // Validate end date is not before start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (end < start) {
        newErrors.endDate = 'End date/time cannot be before start date/time';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newEvent: CalendarEvent = {
      id: isEdit ? formData.id : Date.now().toString(),
      title: formData.title,
      start: `${formData.startDate}T${formData.startTime}:00`,
      end: `${formData.endDate}T${formData.endTime}:00`,
      backgroundColor: formData.color,
      extendedProps: {
        description: formData.description,
        systems: formData.systems
      }
    };

    onSubmit(newEvent);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Toggle system selection
  const handleSystemToggle = (system: string) => {
    const currentSystems = formData.systems || [];
    let newSystems: string[];
    
    if (currentSystems.includes(system)) {
      // Remove system if already selected
      newSystems = currentSystems.filter(s => s !== system);
    } else {
      // Add system if not selected
      newSystems = [...currentSystems, system];
    }
    
    setFormData({
      ...formData,
      systems: newSystems
    });
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    if (isEdit && formData.id && onDelete) {
      onDelete(formData.id);
    }
  };

  // Format date for email component
  const getFormattedDateRange = () => {
    if (!formData.startDate) return '';
    
    const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDate = new Date(`${formData.endDate || formData.startDate}T${formData.endTime || formData.startTime}`);
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{isEdit ? 'Edit Activity' : 'Add New Activity'}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onCancel}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Activity Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? styles.inputError : ''}
              placeholder="Enter activity title (min 10 characters)"
            />
            {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? styles.inputError : ''}
              placeholder="Enter description (min 20 characters)"
              rows={3}
            />
            {errors.description && <div className={styles.errorMessage}>{errors.description}</div>}
          </div>

          <div className={styles.formGroup} ref={dropdownRef}>
            <label>Systems</label>
            <div className={styles.tagsContainer}>
              {formData.systems && formData.systems.length > 0 ? (
                formData.systems.map(system => (
                  <div key={system} className={styles.tag}>
                    {system}
                    <button 
                      type="button" 
                      className={styles.tagRemove} 
                      onClick={() => handleSystemToggle(system)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.noTags}>No systems selected</div>
              )}
            </div>
            <div className={styles.multiSelectContainer}>
              <button 
                type="button" 
                className={styles.multiSelectButton}
                onClick={() => setShowSystemsDropdown(!showSystemsDropdown)}
              >
                Select Systems
              </button>
              {showSystemsDropdown && (
                <div className={styles.multiSelectDropdown}>
                  {systems.map(system => (
                    <div 
                      key={system} 
                      className={`${styles.multiSelectItem} ${formData.systems?.includes(system) ? styles.selected : ''}`}
                      onClick={() => handleSystemToggle(system)}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.systems?.includes(system) || false}
                        onChange={() => {}} // Handled by the onClick of the parent div
                        id={`system-${system}`}
                      />
                      <label htmlFor={`system-${system}`}>{system}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={errors.startDate ? styles.inputError : ''}
              />
              {errors.startDate && <div className={styles.errorMessage}>{errors.startDate}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="startTime">Start Time*</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? styles.inputError : ''}
              />
              {errors.startTime && <div className={styles.errorMessage}>{errors.startTime}</div>}
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
                className={errors.endDate ? styles.inputError : ''}
              />
              {errors.endDate && <div className={styles.errorMessage}>{errors.endDate}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endTime">End Time*</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={errors.endTime ? styles.inputError : ''}
              />
              {errors.endTime && <div className={styles.errorMessage}>{errors.endTime}</div>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Color</label>
            <div className={styles.colorOptions}>
              {colorOptions.map((color) => (
                <div 
                  key={color.value}
                  className={`${styles.colorOption} ${formData.color === color.value ? styles.selectedColor : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="customColor">Custom Color</label>
            <input
              type="color"
              id="customColor"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formDivider}></div>

          {/* Email Notification Section */}
          <EmailSend 
            eventTitle={formData.title}
            eventDescription={formData.description}
            eventDate={getFormattedDateRange()}
          />

          <div className={styles.modalActions}>
            {isEdit && onDelete && (
              <button 
                type="button" 
                className={styles.deleteButton}
                onClick={handleDeleteEvent}
              >
                Delete
              </button>
            )}
            <button type="submit" className={styles.saveButton}>
              {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}