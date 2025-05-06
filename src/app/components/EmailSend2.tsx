'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './MyCalendar.module.scss';
import emailsData from '../data/emails.json';

interface EmailSendProps {
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
}

export default function EmailSend({ eventTitle, eventDescription, eventDate }: EmailSendProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showEmailsDropdown, setShowEmailsDropdown] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emails = emailsData.emails || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEmailsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle email selection
  const handleEmailToggle = (email: string) => {
    const currentEmails = [...selectedEmails];
    
    if (currentEmails.includes(email)) {
      // Remove email if already selected
      setSelectedEmails(currentEmails.filter(e => e !== email));
    } else {
      // Add email if not selected
      setSelectedEmails([...currentEmails, email]);
    }
  };

  // Handle send button click
  const handleSendEmails = () => {
    if (selectedEmails.length === 0) return;
    
    setSendStatus('sending');
    
    // Simulate sending emails
    setTimeout(() => {
      console.log('Sending email notification to:', selectedEmails);
      console.log('Event details:', { eventTitle, eventDescription, eventDate });
      setSendStatus('success');
      
      // Reset status after showing success message
      setTimeout(() => {
        setSendStatus('idle');
        setSelectedEmails([]);
      }, 3000);
    }, 1500);
  };

  return (
    <div className={styles.emailSendContainer}>
      <h3 className={styles.emailSendTitle}>Send Email Notifications</h3>
      
      <div className={styles.formGroup} ref={dropdownRef}>
        <label>Recipients</label>
        <div className={styles.tagsContainer}>
          {selectedEmails.length > 0 ? (
            selectedEmails.map(email => (
              <div key={email} className={styles.tag}>
                {email}
                <button 
                  type="button" 
                  className={styles.tagRemove} 
                  onClick={() => handleEmailToggle(email)}
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <div className={styles.noTags}>No recipients selected</div>
          )}
        </div>
        <div className={styles.multiSelectContainer}>
          <button 
            type="button" 
            className={styles.multiSelectButton}
            onClick={() => setShowEmailsDropdown(!showEmailsDropdown)}
          >
            Select Recipients
          </button>
          {showEmailsDropdown && (
            <div className={styles.multiSelectDropdown}>
              {emails.map(email => (
                <div 
                  key={email} 
                  className={`${styles.multiSelectItem} ${selectedEmails.includes(email) ? styles.selected : ''}`}
                  onClick={() => handleEmailToggle(email)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedEmails.includes(email)}
                    onChange={() => {}} // Handled by the onClick of the parent div
                    id={`email-${email}`}
                  />
                  <label htmlFor={`email-${email}`}>{email}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.emailSendActions}>
        <button 
          type="button" 
          className={`${styles.sendButton} ${selectedEmails.length === 0 ? styles.disabled : ''}`}
          onClick={handleSendEmails}
          disabled={selectedEmails.length === 0 || sendStatus === 'sending'}
        >
          {sendStatus === 'sending' ? 'Sending...' : 'Send Notification'}
        </button>
        
        {sendStatus === 'success' && (
          <div className={styles.successMessage}>
            Notification sent successfully!
          </div>
        )}
        
        {sendStatus === 'error' && (
          <div className={styles.errorMessage}>
            Failed to send notification. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}