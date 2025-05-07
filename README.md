# SDLC Calendar

A calendar application for managing SDLC activities.

## Email Notifications Setup

To enable email notifications, you need to configure your Gmail account:

1. Create a `.env.local` file in the root directory with the following content:
   ```
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. For the `EMAIL_PASS`, you need to generate an App Password from your Google Account:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
   - Go to App passwords
   - Select "Mail" as the app and "Other" as the device
   - Enter a name (e.g., "SDLC Calendar")
   - Click "Generate"
   - Use the generated 16-character password as your `EMAIL_PASS`

3. Make sure to keep your `.env.local` file secure and never commit it to version control.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.