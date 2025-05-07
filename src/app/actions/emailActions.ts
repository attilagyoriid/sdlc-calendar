"use server";

import nodemailer from "nodemailer";
import { emailConfig, emailTemplates } from "../lib/email/emailConfig";

// Interface for email notification request
interface EmailNotificationRequest {
  recipients: string[];
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
}

// Create a nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send email notifications for an event
 */
export async function sendEventNotification(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    // Extract data from FormData
    const recipients = JSON.parse(formData.get("recipients") as string);
    const eventTitle = formData.get("eventTitle") as string;
    const eventDescription = formData.get("eventDescription") as string;
    const eventDate = formData.get("eventDate") as string;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return { success: false, message: "No recipients specified" };
    }

    if (!eventTitle) {
      return { success: false, message: "Event title is required" };
    }

    // Get email template
    const template = emailTemplates.eventNotification(
      eventTitle,
      eventDescription,
      eventDate
    );

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: emailConfig.auth.user,
        to: recipient,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      return transporter.sendMail(mailOptions);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    console.log(`Successfully sent notifications to ${recipients.length} recipients`);
    return {
      success: true,
      message: `Successfully sent notifications to ${recipients.length} recipients`,
    };
  } catch (error: any) {
    console.error("Error sending email notifications:", error);
    return {
      success: false,
      message: `Failed to send email notifications: ${error.message || error}`,
    };
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await transporter.verify();
    return { success: true, message: "Email connection successful" };
  } catch (error: any) {
    console.error("Email connection failed:", error);
    return {
      success: false,
      message: `Email connection failed: ${error.message || error}`,
    };
  }
}