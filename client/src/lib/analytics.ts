/**
 * Google Analytics Tracking Service
 * Tracks user behavior, feature usage, and engagement metrics
 */

// Initialize Google Analytics if gtag is available
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    console.log('[Analytics] Google Analytics initialized');
  }
};

/**
 * Track page view
 */
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string, metadata?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'feature_used', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }
};

/**
 * Track vulnerability scan
 */
export const trackVulnerabilityScan = (url: string, riskLevel: string, vulnerabilityCount: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'vulnerability_scan', {
      url_domain: new URL(url).hostname,
      risk_level: riskLevel,
      vulnerability_count: vulnerabilityCount,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track phishing detection
 */
export const trackPhishingDetection = (url: string, phishingScore: number, isPhishing: boolean) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'phishing_detection', {
      url_domain: new URL(url).hostname,
      phishing_score: phishingScore,
      is_phishing: isPhishing,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track password analysis
 */
export const trackPasswordAnalysis = (strengthScore: number, strength: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'password_analysis', {
      strength_score: strengthScore,
      strength_level: strength,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track user engagement (time spent on page)
 */
export const trackEngagement = (pageName: string, timeSpentSeconds: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'engagement', {
      page_name: pageName,
      time_spent_seconds: timeSpentSeconds,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName: string, location: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'button_click', {
      button_name: buttonName,
      button_location: location,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track errors
 */
export const trackError = (errorType: string, errorMessage: string, context?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      error_context: context,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track custom events
 */
export const trackCustomEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-XXXXXXXXXX', {
      user_id: userId,
      ...userProperties,
    });
  }
};
