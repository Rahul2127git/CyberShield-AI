# Google Analytics Setup Guide

This document explains how to set up Google Analytics for CyberShield - AI to track user behavior and feature usage.

## Overview

Google Analytics has been integrated into CyberShield - AI to track:
- **Page Views**: Track which pages users visit
- **Feature Usage**: Monitor vulnerability scans, phishing detection, and password analysis
- **User Engagement**: Measure time spent on each page
- **Security Events**: Track specific security analysis events
- **Error Tracking**: Monitor application errors

## Setup Instructions

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start Measuring"
3. Create a new account with these details:
   - **Account Name**: CyberShield - AI
   - **Property Name**: CyberShield - AI Production
   - **Reporting Time Zone**: UTC
   - **Currency**: USD (or your preferred currency)

### Step 2: Get Your Measurement ID

1. After creating the property, go to **Admin** → **Property Settings**
2. Find your **Measurement ID** (format: `G-XXXXXXXXXX`)
3. Copy this ID

### Step 3: Update the Configuration

Replace `G-XXXXXXXXXX` in two places:

#### In `client/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_MEASUREMENT_ID', {
    'page_path': window.location.pathname,
    'anonymize_ip': true
  });
</script>
```

#### In `client/src/lib/analytics.ts`:
Replace `G-XXXXXXXXXX` in the `setUserProperties` function with your actual Measurement ID.

### Step 4: Deploy and Verify

1. Save your changes
2. Deploy the application
3. Go to Google Analytics dashboard
4. In the left sidebar, click **Realtime** → **Overview**
5. Visit your website - you should see active users in real-time

## Tracked Events

### Page Views
- Landing page (`/`)
- Dashboard (`/dashboard`)
- Vulnerability Scanner (`/scanner`)
- Phishing Detection (`/phishing`)
- Password Analyzer (`/password`)
- Reports (`/reports`)

### Feature Events

#### Vulnerability Scan
```
Event: vulnerability_scan
Parameters:
  - url_domain: Domain of scanned URL
  - risk_level: low/medium/high
  - vulnerability_count: Number of vulnerabilities found
```

#### Phishing Detection
```
Event: phishing_detection
Parameters:
  - url_domain: Domain of analyzed URL
  - phishing_score: Probability score (0-1)
  - is_phishing: Boolean indicating if phishing detected
```

#### Password Analysis
```
Event: password_analysis
Parameters:
  - strength_score: Strength score (0-1)
  - strength_level: weak/medium/strong
```

### Engagement Events
- `feature_used`: When a user initiates a feature
- `button_click`: When a user clicks buttons
- `engagement`: Time spent on pages
- `error_occurred`: When errors happen

## Dashboard Setup

### Create Custom Reports

1. Go to **Reports** → **Exploration**
2. Create a new exploration with:
   - **Rows**: Event name
   - **Values**: Event count, Users
   - **Filters**: Date range, device type

### Set Up Alerts

1. Go to **Admin** → **Alerts**
2. Create alerts for:
   - Unusual traffic spikes
   - Error rate increases
   - Feature usage anomalies

## Privacy Considerations

- **IP Anonymization**: Enabled by default
- **Data Retention**: Set to 14 months
- **User Consent**: Ensure compliance with GDPR/CCPA
- **Data Deletion**: Users can request data deletion

## Advanced Features

### User ID Tracking (Optional)

To track individual users:

```typescript
import { setUserProperties } from '@/lib/analytics';

// After user login
setUserProperties(userId, {
  user_type: 'student', // or 'professional'
  subscription: 'free', // or 'premium'
});
```

### Custom Events

To track custom events:

```typescript
import { trackCustomEvent } from '@/lib/analytics';

trackCustomEvent('custom_action', {
  action_type: 'export_report',
  format: 'pdf',
  report_type: 'vulnerability',
});
```

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify Measurement ID is correct
3. Ensure gtag script is loaded
4. Wait 24-48 hours for data to appear in reports

### Low Traffic Numbers

1. Check if ad blockers are interfering
2. Verify analytics script is not blocked
3. Check Google Analytics filters (Admin → Filters)

### Privacy Issues

1. Add privacy policy to website
2. Implement cookie consent banner
3. Document data collection practices
4. Set appropriate data retention periods

## Resources

- [Google Analytics Documentation](https://support.google.com/analytics)
- [Google Tag Manager Guide](https://support.google.com/tagmanager)
- [Analytics Events Reference](https://support.google.com/analytics/answer/9322688)

## Support

For issues with Google Analytics integration, contact Google Analytics support or refer to the official documentation.
