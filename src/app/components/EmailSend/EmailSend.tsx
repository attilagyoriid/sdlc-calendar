'use client';

import { useState } from 'react';
import styles from './EmailSend.module.scss';
import emailsData from '../../data/emails.json';
import MultiSelect from '../MultiSelect';
import { sendEventNotification } from '../../actions/emailActions';
import { showCustomToast } from '../CustomToast';

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
  const handleSendEmails = async () => {
    if (selectedEmails.length === 0) return;
    
    setSendStatus('sending');
    
    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append('recipients', JSON.stringify(selectedEmails));
      formData.append('eventTitle', eventTitle);
      formData.append('eventDescription', eventDescription);
      formData.append('eventDate', eventDate);
      
      // Call the server action to send emails
      const result = await sendEventNotification(formData);
      
      if (result.success) {
        setSendStatus('success');
        showCustomToast('Email notifications sent successfully!', 'success');
        
        // Reset status after showing success message
        setTimeout(() => {
          setSendStatus('idle');
          setSelectedEmails([]);
        }, 3000);
      } else {
        setSendStatus('error');
        showCustomToast(`Failed to send notifications: ${result.message}`, 'error');
        
        // Reset status after showing error message
        setTimeout(() => {
          setSendStatus('idle');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error sending email notifications:', error);
      setSendStatus('error');
      showCustomToast(`Error sending notifications: ${error.message || 'Unknown error'}`, 'error');
      
      // Reset status after showing error message
      setTimeout(() => {
        setSendStatus('idle');
      }, 3000);
    }
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