/**
 * Redirect Chain Analyzer API - JavaScript/Node.js Implementation
 * Local development server - equivalent to app.py
 * For production deployment, use worker.js with Cloudflare Workers
 */

import RedirectAnalyzer from './services-js/redirect-analyzer.js';
import URLIntelligence from './services-js/url-intelligence.js';
import SecurityAnalyzer from './services-js/security-analyzer.js';
import AnalyticsEngine from './services-js/analytics-engine.js';
import NetworkDetectionService from './services-js/network-detection.js';
import PerformanceAnalyzer from './services-js/performance-analyzer.js';
import RateLimiter from './services-js/rate-limiter.js';

class RedirectAnalyzerApp {
  constructor() {
    this.redirectAnalyzer = new RedirectAnalyzer();
    this.urlIntelligence = new URLIntelligence();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.networkDetection = new NetworkDetectionService();
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  /**
   * Analyze a URL's redirect chain
   * @param {string} url - The URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeURL(url, options = {}) {
    const startTime = Date.now();

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Analyze redirect chain
    const redirectChain = await this.redirectAnalyzer.analyzeRedirects(url, options);

    // Calculate metadata
    const finalUrl = redirectChain.length > 0 ? 
      redirectChain[redirectChain.length - 1].url : url;

    const redirectDomains = [...new Set(
      redirectChain.map(step => step.domain)
    )];

    const totalRedirects = redirectChain.filter(step => 
      step.status_code >= 300 && step.status_code < 400
    ).length;

    const timeTakenPerRedirect = redirectChain.map(step => 
      step.response_time || 0
    );

    // Intelligence analysis
    const isAffiliateUrl = this.urlIntelligence.detectAffiliateUrl(url, redirectChain);
    const isTrackingUrl = this.urlIntelligence.detectTrackingUrl(url, redirectChain);
    const safetyScore = this.urlIntelligence.calculateSafetyScore(url, redirectChain);

    // Security analysis
    const securityAnalysis = this.securityAnalyzer.analyzeSecurity(url, redirectChain);

    const analysisTime = Date.now() - startTime;

    return {
      input_url: url,
      final_url: finalUrl,
      redirect_chain: redirectChain,
      total_redirects: totalRedirects,
      time_taken_per_redirect: timeTakenPerRedirect,
      is_affiliate_url: isAffiliateUrl,
      is_tracking_url: isTrackingUrl,
      safety_score: safetyScore,
      redirect_domains: redirectDomains,
      analysis_time_ms: analysisTime,
      security_analysis: securityAnalysis
    };
  }

  /**
   * Analyze multiple URLs in bulk
   * @param {Array} urls - Array of URLs to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Array of analysis results
   */
  async analyzeBulk(urls, options = {}) {
    const results = [];

    for (const url of urls) {
      try {
        const result = await this.analyzeURL(url, options);
        results.push({
          url: url,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          url: url,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get network detection analysis
   * @param {string} url - The URL
   * @param {Array} redirectChain - The redirect chain
   * @returns {Array} Network detections
   */
  getNetworkDetection(url, redirectChain) {
    return this.networkDetection.analyzeCompetitiveLandscape(url, redirectChain);
  }

  /**
   * Get performance analysis
   * @param {string} url - The URL
   * @param {Array} redirectChain - The redirect chain
   * @param {Object} analyticsData - Analytics data
   * @returns {Array} Performance insights
   */
  getPerformanceAnalysis(url, redirectChain, analyticsData) {
    return this.performanceAnalyzer.analyzeRevenueImpact(url, redirectChain, analyticsData);
  }
}

export default RedirectAnalyzerApp;

// For direct execution (local testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new RedirectAnalyzerApp();
  
  // Test URL
  const testUrl = process.argv[2] || 'https://bit.ly/3QeU6Xx';
  
  console.log(`Analyzing: ${testUrl}\n`);
  
  app.analyzeURL(testUrl).then(result => {
    console.log('Analysis Result:');
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('Error:', error.message);
  });
}
