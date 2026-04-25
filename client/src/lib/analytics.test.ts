import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackPageView,
  trackFeatureUsage,
  trackVulnerabilityScan,
  trackPhishingDetection,
  trackPasswordAnalysis,
  trackEngagement,
  trackButtonClick,
  trackError,
  trackCustomEvent,
  setUserProperties,
  initializeAnalytics,
} from './analytics';

describe('Google Analytics Tracking', () => {
  let mockGtag: any;

  beforeEach(() => {
    // Mock gtag function
    mockGtag = vi.fn();
    (window as any).gtag = mockGtag;
    (window as any).dataLayer = [];
  });

  describe('initializeAnalytics', () => {
    it('should initialize analytics without errors', () => {
      expect(() => initializeAnalytics()).not.toThrow();
    });
  });

  describe('trackPageView', () => {
    it('should track page view with path and title', () => {
      trackPageView('/scanner', 'Vulnerability Scanner');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_path: '/scanner',
        page_title: 'Vulnerability Scanner',
      }));
    });

    it('should include timestamp in page view', () => {
      trackPageView('/dashboard', 'Dashboard');
      
      const callArgs = mockGtag.mock.calls[0][2];
      expect(callArgs).toHaveProperty('timestamp');
      expect(typeof callArgs.timestamp).toBe('string');
    });
  });

  describe('trackFeatureUsage', () => {
    it('should track feature usage with feature name', () => {
      trackFeatureUsage('vulnerability_scan_initiated', { url_domain: 'example.com' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'feature_used', expect.objectContaining({
        feature_name: 'vulnerability_scan_initiated',
        url_domain: 'example.com',
      }));
    });

    it('should include metadata in feature tracking', () => {
      trackFeatureUsage('test_feature', { custom_prop: 'value' });
      
      const callArgs = mockGtag.mock.calls[0][2];
      expect(callArgs).toHaveProperty('custom_prop', 'value');
    });
  });

  describe('trackVulnerabilityScan', () => {
    it('should track vulnerability scan with risk level', () => {
      trackVulnerabilityScan('https://example.com', 'high', 5);
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'vulnerability_scan', expect.objectContaining({
        url_domain: 'example.com',
        risk_level: 'high',
        vulnerability_count: 5,
      }));
    });

    it('should extract domain from URL correctly', () => {
      trackVulnerabilityScan('https://subdomain.example.co.uk/path', 'low', 0);
      
      const callArgs = mockGtag.mock.calls[0][2];
      expect(callArgs.url_domain).toBe('subdomain.example.co.uk');
    });
  });

  describe('trackPhishingDetection', () => {
    it('should track phishing detection with score', () => {
      trackPhishingDetection('https://example.com', 0.85, true);
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'phishing_detection', expect.objectContaining({
        url_domain: 'example.com',
        phishing_score: 0.85,
        is_phishing: true,
      }));
    });

    it('should handle low phishing scores', () => {
      trackPhishingDetection('https://google.com', 0.05, false);
      
      const callArgs = mockGtag.mock.calls[0][2];
      expect(callArgs.phishing_score).toBe(0.05);
      expect(callArgs.is_phishing).toBe(false);
    });
  });

  describe('trackPasswordAnalysis', () => {
    it('should track password strength analysis', () => {
      trackPasswordAnalysis(0.75, 'strong');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'password_analysis', expect.objectContaining({
        strength_score: 0.75,
        strength_level: 'strong',
      }));
    });

    it('should handle all strength levels', () => {
      const levels = ['weak', 'medium', 'strong'];
      
      levels.forEach((level) => {
        mockGtag.mockClear();
        trackPasswordAnalysis(0.5, level);
        
        const callArgs = mockGtag.mock.calls[0][2];
        expect(callArgs.strength_level).toBe(level);
      });
    });
  });

  describe('trackEngagement', () => {
    it('should track engagement with time spent', () => {
      trackEngagement('Vulnerability Scanner', 120);
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'engagement', expect.objectContaining({
        page_name: 'Vulnerability Scanner',
        time_spent_seconds: 120,
      }));
    });
  });

  describe('trackButtonClick', () => {
    it('should track button clicks with location', () => {
      trackButtonClick('Scan URL', 'scanner_page');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', expect.objectContaining({
        button_name: 'Scan URL',
        button_location: 'scanner_page',
      }));
    });
  });

  describe('trackError', () => {
    it('should track errors with type and message', () => {
      trackError('API_ERROR', 'Failed to fetch data', 'vulnerability_scan');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'error_occurred', expect.objectContaining({
        error_type: 'API_ERROR',
        error_message: 'Failed to fetch data',
        error_context: 'vulnerability_scan',
      }));
    });

    it('should handle errors without context', () => {
      trackError('VALIDATION_ERROR', 'Invalid input');
      
      const callArgs = mockGtag.mock.calls[0][2];
      expect(callArgs.error_type).toBe('VALIDATION_ERROR');
      expect(callArgs.error_message).toBe('Invalid input');
    });
  });

  describe('trackCustomEvent', () => {
    it('should track custom events', () => {
      trackCustomEvent('custom_action', { action_type: 'export_report', format: 'pdf' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_action', expect.objectContaining({
        action_type: 'export_report',
        format: 'pdf',
      }));
    });

    it('should handle custom events without data', () => {
      trackCustomEvent('simple_event');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', expect.any(Object));
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties', () => {
      setUserProperties('user123', { user_type: 'student' });
      
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', expect.objectContaining({
        user_id: 'user123',
        user_type: 'student',
      }));
    });
  });

  describe('graceful degradation', () => {
    it('should not throw if gtag is not available', () => {
      delete (window as any).gtag;
      
      expect(() => {
        trackPageView('/test', 'Test');
        trackFeatureUsage('test_feature');
        trackVulnerabilityScan('https://example.com', 'low', 0);
        trackPhishingDetection('https://example.com', 0.5, false);
        trackPasswordAnalysis(0.5, 'medium');
        trackEngagement('Test', 60);
        trackButtonClick('Test', 'test');
        trackError('TEST_ERROR', 'Test error');
        trackCustomEvent('test_event');
        setUserProperties('user123');
      }).not.toThrow();
    });
  });

  describe('timestamp consistency', () => {
    it('should include ISO timestamp in all events', () => {
      const events = [
        () => trackPageView('/test', 'Test'),
        () => trackFeatureUsage('test'),
        () => trackVulnerabilityScan('https://example.com', 'low', 0),
        () => trackPhishingDetection('https://example.com', 0.5, false),
        () => trackPasswordAnalysis(0.5, 'medium'),
        () => trackEngagement('Test', 60),
        () => trackButtonClick('Test', 'test'),
        () => trackError('TEST', 'Test'),
        () => trackCustomEvent('test'),
      ];

      events.forEach((event) => {
        mockGtag.mockClear();
        event();
        
        const callArgs = mockGtag.mock.calls[0]?.[2];
        if (callArgs) {
          expect(callArgs).toHaveProperty('timestamp');
          expect(typeof callArgs.timestamp).toBe('string');
          // Verify ISO format
          expect(/^\d{4}-\d{2}-\d{2}T/.test(callArgs.timestamp)).toBe(true);
        }
      });
    });
  });
});
