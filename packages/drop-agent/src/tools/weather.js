export const createWeatherTool = (config = {}) => ({
  name: 'get_weather',
  description: 'Get weather information for a location',
  parameters: {
    location: { 
      type: 'string', 
      description: 'City name or location (e.g., "New York", "London, UK")' 
    }
  },
  handler: async ({ location }) => {
    // This is a simulated response - in a real implementation you'd call a weather API
    if (config.apiKey) {
      // TODO: Implement real weather API call
      return `Weather in ${location}: Sunny, 72°F (using API key: ${config.apiKey.slice(0, 8)}...)`;
    }
    
    // Simulated response for demo purposes
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly cloudy', 'Clear'];
    const temps = [65, 68, 72, 75, 78, 82];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = temps[Math.floor(Math.random() * temps.length)];
    
    return `Weather in ${location}: ${condition}, ${temp}°F (simulated response)`;
  }
});

export default createWeatherTool;