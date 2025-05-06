'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './MultiSelect.module.scss';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  buttonText?: string;
  placeholderText?: string;
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  buttonText = 'Select Options',
  placeholderText = 'No items selected'
}: MultiSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle option selection
  const handleToggle = (option: string) => {
    let newSelectedValues: string[];
    
    if (selectedValues.includes(option)) {
      // Remove option if already selected
      newSelectedValues = selectedValues.filter(v => v !== option);
    } else {
      // Add option if not selected
      newSelectedValues = [...selectedValues, option];
    }
    
    onChange(newSelectedValues);
  };

  return (
    <div className={styles.formGroup} ref={dropdownRef}>
      <label>{label}</label>
      <div className={styles.tagsContainer}>
        {selectedValues.length > 0 ? (
          selectedValues.map(value => (
            <div key={value} className={styles.tag}>
              {value}
              <button 
                type="button" 
                className={styles.tagRemove} 
                onClick={() => handleToggle(value)}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <div className={styles.noTags}>{placeholderText}</div>
        )}
      </div>
      <div className={styles.multiSelectContainer}>
        <button 
          type="button" 
          className={styles.multiSelectButton}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {buttonText}
        </button>
        {showDropdown && (
          <div className={styles.multiSelectDropdown}>
            {options.map(option => (
              <div 
                key={option} 
                className={`${styles.multiSelectItem} ${selectedValues.includes(option) ? styles.selected : ''}`}
                onClick={() => handleToggle(option)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedValues.includes(option)}
                  onChange={() => {}} // Handled by the onClick of the parent div
                  id={`option-${option}`}
                />
                <label htmlFor={`option-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}