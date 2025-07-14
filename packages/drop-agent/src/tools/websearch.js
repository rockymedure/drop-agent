/**
 * Web Search Tool for Drop Agent
 * Uses Anthropic's built-in web search capability
 */

export default function createWebSearchTool(config = {}) {
  return {
    name: 'web_search',
    description: 'Search the web for real-time, up-to-date information',
    parameters: {
      query: {
        type: 'string',
        description: 'The search query to find current information on the web'
      }
    },
    // This is a special tool that gets handled by the agent's model directly
    // rather than executing locally
    type: 'web_search_20250305',
    config: {
      max_uses: config.maxUses || 5,
      allowed_domains: config.allowedDomains || undefined,
      blocked_domains: config.blockedDomains || undefined,
      user_location: config.userLocation || undefined
    },
    handler: async ({ query }) => {
      // This handler won't actually be called since web search is handled by the model
      // But we include it for consistency with other tools
      return `Searching for: ${query}`;
    }
  };
}

// Export factory function for backward compatibility
export { createWebSearchTool };