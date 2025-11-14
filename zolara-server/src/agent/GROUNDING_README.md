# Google Search Grounding Implementation

## Overview

The Zolara Agent service now supports Google Search grounding, allowing the AI to access real-time web information to provide more accurate and up-to-date responses.

## Features Implemented

### 1. Google Search Tool (Simple)
- Enables basic web search functionality
- Automatically searches for relevant information when needed
- Provides current, real-time data

### 2. Google Search Retrieval Tool (Dynamic)
- Uses confidence thresholds to determine when to search
- Only searches when the model's confidence is below the specified threshold
- More efficient as it reduces unnecessary searches

## Configuration

The grounding configuration is set in the `defaultConfig`:

```typescript
grounding: {
  enableGoogleSearch: true,           // Simple Google Search
  enableGoogleSearchRetrieval: false, // Dynamic retrieval with threshold
  dynamicThreshold: 0.7,              // Confidence threshold (0.0 to 1.0)
}
```

## Usage Examples

### Enable Simple Google Search
```typescript
// Google Search is enabled by default
// The agent will automatically search for information when needed
```

### Enable Dynamic Google Search Retrieval
```typescript
agent.updateGroundingConfig({
  enableGoogleSearch: false,
  enableGoogleSearchRetrieval: true,
  dynamicThreshold: 0.7  // Search when confidence < 70%
});
```

### Adjust Confidence Threshold
```typescript
agent.updateGroundingConfig({
  dynamicThreshold: 0.8  // More conservative - search when confidence < 80%
});
```

## Response Structure

When grounding is used, responses include metadata:

```typescript
{
  content: "...",
  sessionId: "...",
  timestamp: "...",
  tokensUsed: 1234,
  groundingMetadata: {
    wasGrounded: true,
    webSearchQueries: ["latest tech news", "AI developments 2024"],
    searchResults: [...]
  }
}
```

## System Prompt Update

The system prompt now includes instructions for the agent to:
- Mention when information comes from web search
- Provide source attribution when appropriate
- Indicate the recency of information

## Testing

You can test the grounding functionality by asking questions that require current information:

- "What are the latest news about AI?"
- "Current stock price of Google"
- "Recent developments in renewable energy"
- "Latest sports scores"

## Notes

- Google Search grounding requires internet connectivity
- Some queries may not trigger grounding if the model has sufficient confidence in its existing knowledge
- The agent will log when grounding is used and which queries were performed
- Grounding adds some latency to responses due to web search operations

## Troubleshooting

If grounding is not working:
1. Ensure your GEMINI_API_KEY has grounding permissions
2. Check that the model version supports grounding (gemini-2.5-flash does)
3. Verify internet connectivity
4. Check logs for grounding activation messages