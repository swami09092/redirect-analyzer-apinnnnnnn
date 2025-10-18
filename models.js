/**
 * Data Models - JavaScript Implementation
 * Defines the structure of data objects used throughout the application
 */

/**
 * Rate Limit Record
 */
class RateLimitRecord {
  constructor(ipAddress, requestCount, lastReset, createdAt, updatedAt) {
    this.ipAddress = ipAddress;
    this.requestCount = requestCount;
    this.lastReset = lastReset;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    return new RateLimitRecord(
      json.ip_address,
      json.request_count,
      new Date(json.last_reset),
      new Date(json.created_at),
      new Date(json.updated_at)
    );
  }

  toJSON() {
    return {
      ip_address: this.ipAddress,
      request_count: this.requestCount,
      last_reset: this.lastReset.toISOString(),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
}

/**
 * Usage Analytics
 */
class UsageAnalytics {
  constructor(ipAddress, url, totalRedirects, analysisTimeMs, safetyScore, isAffiliateUrl, isTrackingUrl, createdAt) {
    this.ipAddress = ipAddress;
    this.url = url;
    this.totalRedirects = totalRedirects;
    this.analysisTimeMs = analysisTimeMs;
    this.safetyScore = safetyScore;
    this.isAffiliateUrl = isAffiliateUrl;
    this.isTrackingUrl = isTrackingUrl;
    this.createdAt = createdAt;
  }

  static fromJSON(json) {
    return new UsageAnalytics(
      json.ip_address,
      json.url,
      json.total_redirects,
      json.analysis_time_ms,
      json.safety_score,
      json.is_affiliate_url,
      json.is_tracking_url,
      new Date(json.created_at)
    );
  }

  toJSON() {
    return {
      ip_address: this.ipAddress,
      url: this.url,
      total_redirects: this.totalRedirects,
      analysis_time_ms: this.analysisTimeMs,
      safety_score: this.safetyScore,
      is_affiliate_url: this.isAffiliateUrl,
      is_tracking_url: this.isTrackingUrl,
      created_at: this.createdAt.toISOString()
    };
  }
}

/**
 * Redirect Chain Step
 */
class RedirectChainStep {
  constructor(url, statusCode, locationHeader, domain, responseTime, headers) {
    this.url = url;
    this.statusCode = statusCode;
    this.locationHeader = locationHeader;
    this.domain = domain;
    this.responseTime = responseTime;
    this.headers = headers;
  }

  static fromJSON(json) {
    return new RedirectChainStep(
      json.url,
      json.status_code,
      json.location_header || null,
      json.domain,
      json.response_time,
      json.headers
    );
  }

  toJSON() {
    return {
      url: this.url,
      status_code: this.statusCode,
      location_header: this.locationHeader,
      domain: this.domain,
      response_time: this.responseTime,
      headers: this.headers
    };
  }
}

/**
 * URL Analysis Request
 */
class URLAnalysisRequest {
  constructor(url, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36') {
    this.url = url;
    this.userAgent = userAgent;
  }

  validate() {
    if (!this.url || !this.url.trim()) {
      throw new Error('URL cannot be empty');
    }

    const url = this.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ftp://')) {
      if (!url.includes('.')) {
        throw new Error('Invalid URL format');
      }
    }

    return true;
  }
}

/**
 * URL Analysis Response
 */
class URLAnalysisResponse {
  constructor(inputUrl, finalUrl, redirectChain, totalRedirects, timeTakenPerRedirect, isAffiliateUrl, isTrackingUrl, safetyScore, redirectDomains, analysisTimeMs) {
    this.inputUrl = inputUrl;
    this.finalUrl = finalUrl;
    this.redirectChain = redirectChain;
    this.totalRedirects = totalRedirects;
    this.timeTakenPerRedirect = timeTakenPerRedirect;
    this.isAffiliateUrl = isAffiliateUrl;
    this.isTrackingUrl = isTrackingUrl;
    this.safetyScore = safetyScore;
    this.redirectDomains = redirectDomains;
    this.analysisTimeMs = analysisTimeMs;
  }

  toJSON() {
    return {
      input_url: this.inputUrl,
      final_url: this.finalUrl,
      redirect_chain: this.redirectChain.map(step => 
        step instanceof RedirectChainStep ? step.toJSON() : step
      ),
      total_redirects: this.totalRedirects,
      time_taken_per_redirect: this.timeTakenPerRedirect,
      is_affiliate_url: this.isAffiliateUrl,
      is_tracking_url: this.isTrackingUrl,
      safety_score: this.safetyScore,
      redirect_domains: this.redirectDomains,
      analysis_time_ms: this.analysisTimeMs
    };
  }

  static example() {
    return {
      input_url: 'bit.ly/example',
      final_url: 'https://example.com/page',
      redirect_chain: [
        {
          url: 'https://bit.ly/example',
          status_code: 301,
          location_header: 'https://example.com/page',
          domain: 'bit.ly',
          response_time: 245.5,
          headers: { 'content-type': 'text/html' }
        }
      ],
      total_redirects: 1,
      time_taken_per_redirect: [245.5],
      is_affiliate_url: false,
      is_tracking_url: true,
      safety_score: 85,
      redirect_domains: ['bit.ly', 'example.com'],
      analysis_time_ms: 567
    };
  }
}

/**
 * API Key Record
 */
class ApiKeyRecord {
  constructor(apiKey, tier, monthlyLimit, currentUsage, createdAt, lastResetDate) {
    this.apiKey = apiKey;
    this.tier = tier;
    this.monthlyLimit = monthlyLimit;
    this.currentUsage = currentUsage;
    this.createdAt = createdAt;
    this.lastResetDate = lastResetDate;
  }

  static fromJSON(json) {
    return new ApiKeyRecord(
      json.api_key,
      json.tier,
      json.monthly_limit,
      json.current_usage,
      new Date(json.created_at),
      json.last_reset_date
    );
  }

  toJSON() {
    return {
      api_key: this.apiKey,
      tier: this.tier,
      monthly_limit: this.monthlyLimit,
      current_usage: this.currentUsage,
      created_at: this.createdAt.toISOString(),
      last_reset_date: this.lastResetDate
    };
  }
}

export {
  RateLimitRecord,
  UsageAnalytics,
  RedirectChainStep,
  URLAnalysisRequest,
  URLAnalysisResponse,
  ApiKeyRecord
};
