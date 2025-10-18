/**
 * Database Module - JavaScript Implementation
 * Cloudflare Workers uses KV storage instead of SQLite/PostgreSQL
 * This module provides database operations for Cloudflare Workers environment
 */

class Database {
  constructor(env) {
    this.env = env;
    this.RATE_LIMITS = env?.RATE_LIMITS || null;
    this.ANALYTICS_DATA = env?.ANALYTICS_DATA || null;
    this.API_KEYS = env?.API_KEYS || null;
  }

  /**
   * Initialize database (KV namespaces are auto-created in Cloudflare)
   * This is a no-op for Cloudflare Workers
   */
  async initDatabase() {
    return true;
  }

  /**
   * Get rate limit data for an IP address
   * @param {string} ipAddress - The IP address to check
   * @param {string} date - The date in YYYY-MM-DD format
   * @returns {Promise<Object|null>}
   */
  async getRateLimit(ipAddress, date) {
    if (!this.RATE_LIMITS) return null;
    
    const key = `rate_limit:${ipAddress}:${date}`;
    const data = await this.RATE_LIMITS.get(key, { type: 'json' });
    return data || { request_count: 0, bulk_count: 0 };
  }

  /**
   * Update rate limit for an IP address
   * @param {string} ipAddress - The IP address
   * @param {string} date - The date in YYYY-MM-DD format
   * @param {number} requestCount - Number of requests
   * @param {number} bulkCount - Number of bulk requests
   */
  async updateRateLimit(ipAddress, date, requestCount, bulkCount = 0) {
    if (!this.RATE_LIMITS) return;
    
    const key = `rate_limit:${ipAddress}:${date}`;
    const data = {
      ip_address: ipAddress,
      date: date,
      request_count: requestCount,
      bulk_count: bulkCount,
      updated_at: new Date().toISOString()
    };
    
    await this.RATE_LIMITS.put(key, JSON.stringify(data), {
      expirationTtl: 86400 * 2 // Keep for 2 days
    });
  }

  /**
   * Increment rate limit counter
   * @param {string} ipAddress - The IP address
   * @param {string} date - The date in YYYY-MM-DD format
   * @param {boolean} isBulk - Whether this is a bulk request
   */
  async incrementRateLimit(ipAddress, date, isBulk = false) {
    const current = await this.getRateLimit(ipAddress, date);
    const requestCount = current.request_count + 1;
    const bulkCount = isBulk ? current.bulk_count + 1 : current.bulk_count;
    
    await this.updateRateLimit(ipAddress, date, requestCount, bulkCount);
    return { request_count: requestCount, bulk_count: bulkCount };
  }

  /**
   * Save analytics data
   * @param {Object} analyticsData - Analytics data to save
   */
  async saveAnalytics(analyticsData) {
    if (!this.ANALYTICS_DATA) return;
    
    const id = `analytics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const data = {
      ...analyticsData,
      created_at: new Date().toISOString()
    };
    
    await this.ANALYTICS_DATA.put(id, JSON.stringify(data), {
      expirationTtl: 86400 * 30 // Keep for 30 days
    });
  }

  /**
   * Get analytics for a domain
   * @param {string} domain - The domain to get analytics for
   * @returns {Promise<Array>}
   */
  async getDomainAnalytics(domain) {
    if (!this.ANALYTICS_DATA) return [];
    
    const list = await this.ANALYTICS_DATA.list({ prefix: 'analytics:' });
    const results = [];
    
    for (const key of list.keys) {
      const data = await this.ANALYTICS_DATA.get(key.name, { type: 'json' });
      if (data && data.url && data.url.includes(domain)) {
        results.push(data);
      }
    }
    
    return results.slice(0, 100); // Limit to 100 results
  }

  /**
   * Get analytics for a specific URL
   * @param {string} url - The URL to get analytics for
   * @returns {Promise<Array>}
   */
  async getUrlAnalytics(url) {
    if (!this.ANALYTICS_DATA) return [];
    
    const list = await this.ANALYTICS_DATA.list({ prefix: 'analytics:' });
    const results = [];
    
    for (const key of list.keys) {
      const data = await this.ANALYTICS_DATA.get(key.name, { type: 'json' });
      if (data && data.url === url) {
        results.push(data);
      }
    }
    
    return results.slice(0, 100); // Limit to 100 results
  }

  /**
   * Verify API key
   * @param {string} apiKey - The API key to verify
   * @returns {Promise<Object|null>}
   */
  async verifyApiKey(apiKey) {
    if (!this.API_KEYS) return null;
    
    const key = `api_key:${apiKey}`;
    const data = await this.API_KEYS.get(key, { type: 'json' });
    return data;
  }

  /**
   * Update API key usage
   * @param {string} apiKey - The API key
   * @param {number} usage - Current usage count
   */
  async updateApiKeyUsage(apiKey, usage) {
    if (!this.API_KEYS) return;
    
    const key = `api_key:${apiKey}`;
    const data = await this.API_KEYS.get(key, { type: 'json' });
    
    if (data) {
      data.current_usage = usage;
      data.last_used = new Date().toISOString();
      await this.API_KEYS.put(key, JSON.stringify(data));
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    if (!this.ANALYTICS_DATA) return {};
    
    const list = await this.ANALYTICS_DATA.list({ prefix: 'analytics:' });
    const stats = {
      total_requests: list.keys.length,
      unique_domains: new Set(),
      avg_redirects: 0,
      avg_analysis_time: 0
    };
    
    let totalRedirects = 0;
    let totalTime = 0;
    
    for (const key of list.keys.slice(0, 1000)) {
      const data = await this.ANALYTICS_DATA.get(key.name, { type: 'json' });
      if (data) {
        if (data.url) {
          try {
            const domain = new URL(data.url).hostname;
            stats.unique_domains.add(domain);
          } catch (e) {}
        }
        totalRedirects += data.total_redirects || 0;
        totalTime += data.analysis_time_ms || 0;
      }
    }
    
    const count = list.keys.length || 1;
    stats.unique_domains = stats.unique_domains.size;
    stats.avg_redirects = (totalRedirects / count).toFixed(2);
    stats.avg_analysis_time = (totalTime / count).toFixed(2);
    
    return stats;
  }
}

export default Database;
