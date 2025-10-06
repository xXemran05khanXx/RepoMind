# Overview

RepoMind is an AI-powered code analysis platform that helps developers understand and interact with their GitHub repositories through natural language queries. The application connects to GitHub repositories, analyzes their codebase using AI, and provides intelligent responses to questions about the code structure, functionality, and patterns.

The platform features a modern web interface built with React and TypeScript, backed by a Node.js/Express server with PostgreSQL database storage. It integrates with GitHub's API for repository access and OpenAI's services for code analysis and natural language processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL database (Neon serverless)
- **Authentication**: GitHub OAuth integration with session-based auth
- **API Design**: RESTful endpoints with structured error handling and logging middleware

## Database Design
- **Users**: GitHub user profiles with OAuth tokens and usage tracking
- **Repositories**: Connected GitHub repositories with analysis status and metadata
- **Repository Files**: Stored file contents with vector embeddings for semantic search
- **Commits**: Commit history tracking with AI-generated summaries
- **Queries**: User questions and AI responses with conversation history

## AI Integration
- **Code Analysis**: OpenAI GPT models for repository analysis and insights generation
- **Vector Search**: Text embeddings using OpenAI's text-embedding-ada-002 model
- **Natural Language**: AI-powered question answering about codebases with context awareness

## Development Environment
- **Build System**: Vite with TypeScript compilation and hot module replacement
- **Code Quality**: ESLint and TypeScript strict mode for type safety
- **Development Tools**: Replit integration with runtime error overlay and cartographer

## Authentication Flow
GitHub OAuth flow handles user authentication, storing access tokens for repository access. Session-based authentication maintains user state across requests.

## Data Processing Pipeline
1. Repository connection via GitHub API
2. File content extraction and preprocessing
3. AI analysis for code insights and summaries
4. Vector embedding generation for semantic search
5. Storage in PostgreSQL with Drizzle ORM

# External Dependencies

## Core Services
- **GitHub API**: Repository access, user authentication, and metadata retrieval via Octokit
- **OpenAI API**: Code analysis, embeddings generation, and natural language processing
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

## Authentication
- **GitHub OAuth**: User authentication and repository authorization
- **Environment Variables**: GitHub client credentials and OpenAI API keys

## Development Tools
- **Replit Services**: Development environment integration and error tracking
- **Vite Plugins**: Development server enhancements and runtime error handling

## UI Framework Dependencies
- **Radix UI**: Accessible component primitives for dialogs, forms, and navigation
- **Tailwind CSS**: Utility-first styling with PostCSS processing
- **Lucide Icons**: Consistent iconography throughout the application

## Data Persistence
- **PostgreSQL**: Primary database for user data, repositories, and analysis results
- **Drizzle Kit**: Database migrations and schema management
- **Connection Pooling**: Neon serverless database with WebSocket support

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns, leveraging AI services for intelligent code analysis while maintaining a responsive and accessible user interface.