# Bolter.new Backend

The backend server powering [bolt.new](https://bolt.new) - an AI-powered instant code template generator that helps developers quickly scaffold React.js and Node.js projects.

## About

Bolt.new is designed to streamline the development process by instantly generating high-quality code templates based on natural language descriptions. Using Google's Gemini AI, it can understand project requirements and generate appropriate React.js or Node.js code templates in real-time.

## Features

- 🚀 Instant code generation powered by Google's Gemini AI
- ⚡ Real-time streaming responses
- 🎯 Automatic project type detection (React.js/Node.js)
- 📦 Production-ready code templates
- 🔄 Stateless architecture for scalability

## Prerequisites

Before running the backend, ensure you have:

- Node.js installed (version 14.0 or higher recommended)
- A Google Gemini AI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[organization]/bolt-new-backend.git
cd bolt-new-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000 # Optional, defaults to 3000
```

## API Endpoints

### POST /template
Generates code templates based on the provided prompt.

**Request Body:**
```json
{
  "prompt": "Your project description or requirements"
}
```

**Response:**
- Content-Type: text/plain
- Streaming response with generated code

### GET /
Health check endpoint that returns "working".

## Architecture

The backend uses:
- Express.js for the server framework
- Google's Gemini AI API with model "gemini-2.0-flash-exp"
- Separate system prompts for React.js and Node.js templates
- Chunked transfer encoding for streaming responses
- Environment-based configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port number | 3000 |
| GEMINI_API_KEY | Google Gemini AI API key | Required |

## Error Handling

The server implements comprehensive error handling for:
- Missing or invalid prompts
- Project type detection failures
- Internal server errors
- API communication issues

## Development

To start the development server:
```bash
npm run dev
```

## Deployment

The backend is designed to be deployed to your preferred cloud platform. Make sure to:
1. Set the appropriate environment variables
2. Configure your cloud provider's settings
3. Set up proper error monitoring and logging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Before contributing:
1. Check existing issues or create a new one
2. Fork the repository
3. Create your feature branch
4. Submit a pull request

## Related

- [Bolter.new Frontend](https://github.com/[organization]/bolt-new-frontend)
