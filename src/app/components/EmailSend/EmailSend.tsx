'use client';

import { useState } from 'react';
import styles from './EmailSend.module.scss';
import emailsData from '../../data/emails.json';
import MultiSelect from '../MultiSelect';

interface EmailSendProps {
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
}

export default function EmailSend({ eventTitle, eventDescription, eventDate }: EmailSendProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const emails = emailsData.emails || [];

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
      
      <MultiSelect
        label="Recipients"
        options={emails}
        selectedValues={selectedEmails}
        onChange={setSelectedEmails}
        buttonText="Select Recipients"
        placeholderText="No recipients selected"
      />
      
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