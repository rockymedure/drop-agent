export const createCalculatorTool = () => ({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: {
    expression: { 
      type: 'string', 
      description: 'Mathematical expression to evaluate (e.g., "2 + 2", "Math.sqrt(16)", "Math.PI * 2")' 
    }
  },
  handler: async ({ expression }) => {
    try {
      // Basic security: only allow mathematical operations
      const sanitized = expression.replace(/[^0-9+\-*/().\s,Math.sqrt\d\w]/g, '');
      if (sanitized !== expression) {
        throw new Error('Invalid characters in expression');
      }
      
      const result = eval(expression);
      return `The result of ${expression} is ${result}`;
    } catch (error) {
      return `Error calculating ${expression}: ${error.message}`;
    }
  }
});

export default createCalculatorTool;