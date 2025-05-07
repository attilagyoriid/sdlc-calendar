// src/app/lib/email/emailConfig.ts

// Email configuration for nodemailer
export const emailConfig = {
  service: 'gmail',
  auth: {
    // These should be stored in environment variables in production
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    // This should be an app password for Gmail, not your regular password
    // See: https://support.google.com/accounts/answer/185833
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

// Email templates
export const emailTemplates = {
  eventNotification: (eventTitle: string, eventDescription: string, eventDate: string) => {
    // Remove HTML tags from description if it's from a rich text editor
    const plainDescription = eventDescription.replace(/<[^>]*>?/gm, '');
    
    return {
      subject: `SDLC Calendar: ${eventTitle}`,
      text: `
Event: ${eventTitle}
Date: ${eventDate}

Description:
${plainDescription}

This is an automated notification from the SDLC Calendar application.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285F4; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>SDLC Calendar Notification</h2>
    </div>
    <div class="content">
      <h3>${eventTitle}</h3>
      <p><strong>Date:</strong> ${eventDate}</p>
      <div>
        <strong>Description:</strong>
        <div>${eventDescription}</div>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from the SDLC Calendar application.
    </div>
  </div>
</body>
</html>
      `
    };
  }
};