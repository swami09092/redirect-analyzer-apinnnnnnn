/**
 * Data Validation Schemas - JavaScript Implementation
 * Provides validation functions for request and response data
 */

/**
 * Validate URL Analysis Request
 * @param {Object} data - The request data
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validateURLAnalysisRequest(data) {
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    throw new Error('URL cannot be empty');
  }

  const url = data.url.trim();
  
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ftp://')) {
    if (!url.includes('.')) {
      throw new Error('Invalid URL format');
    }
  }

  return {
    url: url,
    user_agent: data.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };
}

/**
 * Validate Bulk Analysis Request
 * @param {Object} data - The request data
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validateBulkAnalysisRequest(data) {
  if (!data.urls || !Array.isArray(data.urls)) {
    throw new Error('URLs must be an array');
  }

  if (data.urls.length === 0) {
    throw new Error('URLs array cannot be empty');
  }

  if (data.urls.length > 100) {
    throw new Error('Maximum 100 URLs allowed per request');
  }

  const validatedUrls = data.urls.map((url, index) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new Error(`URL at index ${index} is empty or invalid`);
    }
    return url.trim();
  });

  return {
    urls: validatedUrls,
    user_agent: data.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
}

/**
 * Validate Mobile Comparison Request
 * @param {Object} data - The request data
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validateMobileComparisonRequest(data) {
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    throw new Error('URL cannot be empty');
  }

  return {
    url: data.url.trim(),
    user_agent_desktop: data.user_agent_desktop || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    user_agent_mobile: data.user_agent_mobile || 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  };
}

/**
 * Validate Bot Test Request
 * @param {Object} data - The request data
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validateBotTestRequest(data) {
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    throw new Error('URL cannot be empty');
  }

  const validBotTypes = ['googlebot', 'bingbot', 'facebookbot', 'twitterbot', 'linkedinbot'];
  const botTypes = data.bot_types || ['googlebot', 'bingbot', 'facebookbot'];

  const invalidBots = botTypes.filter(bot => !validBotTypes.includes(bot));
  if (invalidBots.length > 0) {
    throw new Error(`Invalid bot types: ${invalidBots.join(', ')}`);
  }

  return {
    url: data.url.trim(),
    bot_types: botTypes
  };
}

/**
 * Validate CSV Export Request
 * @param {Object} data - The request data
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validateCSVExportRequest(data) {
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    throw new Error('URL cannot be empty');
  }

  return {
    url: data.url.trim(),
    user_agent: data.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
}

/**
 * Validate Redirect Step
 * @param {Object} step - The redirect step data
 * @returns {Object} Validated step
 */
function validateRedirectStep(step) {
  if (!step.url || typeof step.url !== 'string') {
    throw new Error('Redirect step URL is required');
  }

  if (typeof step.status_code !== 'number') {
    throw new Error('Redirect step status_code must be a number');
  }

  if (!step.domain || typeof step.domain !== 'string') {
    throw new Error('Redirect step domain is required');
  }

  if (typeof step.response_time !== 'number') {
    throw new Error('Redirect step response_time must be a number');
  }

  return {
    url: step.url,
    status_code: step.status_code,
    location_header: step.location_header || null,
    domain: step.domain,
    response_time: step.response_time,
    headers: step.headers || {}
  };
}

/**
 * Validate URL Analysis Response
 * @param {Object} response - The response data
 * @returns {Object} Validated response
 */
function validateURLAnalysisResponse(response) {
  if (!response.input_url || typeof response.input_url !== 'string') {
    throw new Error('input_url is required');
  }

  if (!response.final_url || typeof response.final_url !== 'string') {
    throw new Error('final_url is required');
  }

  if (!Array.isArray(response.redirect_chain)) {
    throw new Error('redirect_chain must be an array');
  }

  const validatedChain = response.redirect_chain.map(step => validateRedirectStep(step));

  if (typeof response.total_redirects !== 'number') {
    throw new Error('total_redirects must be a number');
  }

  if (!Array.isArray(response.time_taken_per_redirect)) {
    throw new Error('time_taken_per_redirect must be an array');
  }

  if (typeof response.is_affiliate_url !== 'boolean') {
    throw new Error('is_affiliate_url must be a boolean');
  }

  if (typeof response.is_tracking_url !== 'boolean') {
    throw new Error('is_tracking_url must be a boolean');
  }

  if (typeof response.safety_score !== 'number') {
    throw new Error('safety_score must be a number');
  }

  if (!Array.isArray(response.redirect_domains)) {
    throw new Error('redirect_domains must be an array');
  }

  if (typeof response.analysis_time_ms !== 'number') {
    throw new Error('analysis_time_ms must be a number');
  }

  return {
    input_url: response.input_url,
    final_url: response.final_url,
    redirect_chain: validatedChain,
    total_redirects: response.total_redirects,
    time_taken_per_redirect: response.time_taken_per_redirect,
    is_affiliate_url: response.is_affiliate_url,
    is_tracking_url: response.is_tracking_url,
    safety_score: response.safety_score,
    redirect_domains: response.redirect_domains,
    analysis_time_ms: response.analysis_time_ms
  };
}

/**
 * Get example URL Analysis Response
 * @returns {Object} Example response
 */
function getExampleURLAnalysisResponse() {
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

export {
  validateURLAnalysisRequest,
  validateBulkAnalysisRequest,
  validateMobileComparisonRequest,
  validateBotTestRequest,
  validateCSVExportRequest,
  validateRedirectStep,
  validateURLAnalysisResponse,
  getExampleURLAnalysisResponse
};
