import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Summarize card content
export const summarizeContent = async (content) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Please provide a concise summary of the following text in 1-2 sentences:

${content}`
      }]
    });

    return {
      summary: response.content[0].text.trim()
    };
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw error;
  }
};

// Extract key concepts from content
export const extractConcepts = async (content) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Extract 3-7 key concepts or topics from the following text. Return them as a simple comma-separated list:

${content}`
      }]
    });

    const conceptsText = response.content[0].text.trim();
    const concepts = conceptsText.split(',').map(c => c.trim()).filter(c => c.length > 0);

    return {
      concepts: concepts.slice(0, 7) // Limit to 7 concepts max
    };
  } catch (error) {
    console.error('Error extracting concepts:', error);
    throw error;
  }
};

// Analyze canvas layout and provide insights
export const analyzeCanvas = async (cards) => {
  try {
    const cardsDescription = cards.map(card => ({
      id: card.id,
      type: card.type,
      content: card.content.substring(0, 200), // Limit content length
      summary: card.summary,
      concepts: card.concepts,
      position: { x: card.x, y: card.y }
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze this canvas layout with ${cards.length} cards. Provide 2-3 insights about patterns, themes, or relationships you notice. Format as a JSON array of insights with "type", "message", and "details" fields.

Cards:
${JSON.stringify(cardsDescription, null, 2)}`
      }]
    });

    let insights = [];
    try {
      const responseText = response.content[0].text.trim();
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a single insight from the text
        insights = [{
          type: 'analysis',
          message: responseText,
          details: null
        }];
      }
    } catch (parseError) {
      console.error('Error parsing insights:', parseError);
      insights = [{
        type: 'analysis',
        message: response.content[0].text.trim(),
        details: null
      }];
    }

    return { insights };
  } catch (error) {
    console.error('Error analyzing canvas:', error);
    throw error;
  }
};

// Suggest connections between cards
export const suggestConnections = async (cards) => {
  try {
    const cardsDescription = cards.map(card => ({
      id: card.id,
      content: card.content.substring(0, 150),
      summary: card.summary,
      concepts: card.concepts
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Analyze these cards and suggest 2-3 meaningful connections between them. Format as a JSON array with "type", "message", and "details" fields.

Cards:
${JSON.stringify(cardsDescription, null, 2)}`
      }]
    });

    let connections = [];
    try {
      const responseText = response.content[0].text.trim();
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        connections = JSON.parse(jsonMatch[0]);
      } else {
        connections = [{
          type: 'connection',
          message: responseText,
          details: null
        }];
      }
    } catch (parseError) {
      connections = [{
        type: 'connection',
        message: response.content[0].text.trim(),
        details: null
      }];
    }

    return { connections };
  } catch (error) {
    console.error('Error suggesting connections:', error);
    throw error;
  }
};

// Organize cards based on conceptual similarity
export const organizeCards = async (cards) => {
  try {
    const cardsDescription = cards.map(card => ({
      id: card.id,
      content: card.content.substring(0, 100),
      concepts: card.concepts,
      summary: card.summary
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Organize these cards based on conceptual similarity. Suggest optimal X,Y positions for each card where related cards are grouped together. Use a 800x600 canvas space. Return as JSON array with "id", "x", "y" fields.

Cards:
${JSON.stringify(cardsDescription, null, 2)}`
      }]
    });

    let positions = [];
    try {
      const responseText = response.content[0].text.trim();
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        positions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing positions:', parseError);
      // Fallback: arrange cards in a grid
      positions = cards.map((card, index) => ({
        id: card.id,
        x: (index % 3) * 280 + 50,
        y: Math.floor(index / 3) * 200 + 50
      }));
    }

    return { positions };
  } catch (error) {
    console.error('Error organizing cards:', error);
    throw error;
  }
};