import createCalculatorTool from './calculator.js';
import createWeatherTool from './weather.js';

export { createCalculatorTool, createWeatherTool };

// Helper function to add common tools to an agent
export const addCommonTools = (agent, config = {}) => {
  const calculator = createCalculatorTool();
  agent.addTool(calculator.name, calculator.description, calculator.parameters, calculator.handler);
  
  const weather = createWeatherTool(config.weather);
  agent.addTool(weather.name, weather.description, weather.parameters, weather.handler);
  
  return agent;
};

// Tool registry for easy management
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    this.register('calculator', createCalculatorTool);
    this.register('weather', createWeatherTool);
  }

  register(name, factory) {
    this.tools.set(name, factory);
  }

  create(name, config = {}) {
    const factory = this.tools.get(name);
    if (!factory) {
      throw new Error(`Tool '${name}' not found in registry`);
    }
    return factory(config);
  }

  list() {
    return Array.from(this.tools.keys());
  }

  addToAgent(agent, toolName, config = {}) {
    const tool = this.create(toolName, config);
    agent.addTool(tool.name, tool.description, tool.parameters, tool.handler);
    return agent;
  }
}

export default { createCalculatorTool, createWeatherTool, addCommonTools, ToolRegistry };