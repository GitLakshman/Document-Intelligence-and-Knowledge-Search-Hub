# 📚 DocIntel Hub - Document Intelligence & Knowledge Search

<div align="center">

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?style=for-the-badge&logo=google)

**A full-stack RAG-powered document intelligence platform**

[Features](#-features) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Testing](#-testing) • [Architecture](#-architecture)

</div>

---

## 📋 Overview

DocIntel Hub is a production-ready MERN stack application that enables users to upload documents and query them using AI-powered natural language search. Built with **Retrieval-Augmented Generation (RAG)** architecture, it provides accurate answers grounded in your document content.

### ✨ Features

| Feature                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| 🔐 **Secure Authentication** | JWT-based auth with password hashing             |
| 📄 **Document Upload**       | Support for PDF, TXT, MD, CSV files (up to 10MB) |
| 🤖 **AI-Powered Q&A**        | Google Gemini Flash for intelligent answers      |
| 📚 **Source Citations**      | Every answer includes relevant document excerpts |
| 📜 **Query History**         | Persistent history with pagination               |
| ⚡ **Response Caching**      | Reduces API calls for repeated queries           |
| 🎯 **Rate Limiting**         | Per-user rate limiting (20 requests/hour)        |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Gemini API Key** → [Get one here](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MernApp

# Install all dependencies
npm run install:all
# Or manually:
cd server && npm install && cd ../client && npm install && cd ..
```

### Configuration

**Server** (`server/.env`):

```env
MONGODB_URI=mongodb://localhost:27017/document-hub
JWT_SECRET=your-secure-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env` - optional):

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd server && npm run dev

# Terminal 3: Start Frontend
cd client && npm run dev
```

🌐 Open http://localhost:5173 in your browser

---

## 📁 Project Structure

```
MernApp/
├── client/                      # React Frontend (TypeScript)
│   ├── src/
│   │   ├── api/                 # Axios API client
│   │   ├── components/          # Reusable components
│   │   │   └── ui/              # UI component library
│   │   ├── context/             # React Context providers
│   │   ├── pages/               # Page components
│   │   ├── types/               # TypeScript definitions
│   │   └── __tests__/           # Frontend tests
│   └── package.json
│
├── server/                      # Express Backend
│   ├── config/                  # Configuration & constants
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Express middleware
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API route definitions
│   ├── services/                # Business logic (AI, document processing)
│   ├── __tests__/               # Backend tests
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint             | Description       | Auth |
| ------ | -------------------- | ----------------- | ---- |
| `POST` | `/api/auth/register` | Register new user | ❌   |
| `POST` | `/api/auth/login`    | Login user        | ❌   |
| `GET`  | `/api/auth/me`       | Get current user  | ✅   |

### Documents

| Method   | Endpoint                    | Description           | Auth |
| -------- | --------------------------- | --------------------- | ---- |
| `GET`    | `/api/documents`            | List all documents    | ✅   |
| `POST`   | `/api/documents/upload`     | Upload document       | ✅   |
| `GET`    | `/api/documents/:id`        | Get document details  | ✅   |
| `DELETE` | `/api/documents/:id`        | Delete document       | ✅   |
| `GET`    | `/api/documents/:id/status` | Get processing status | ✅   |

### Search

| Method   | Endpoint                  | Description           | Auth |
| -------- | ------------------------- | --------------------- | ---- |
| `POST`   | `/api/search`             | Ask a question        | ✅   |
| `GET`    | `/api/search/history`     | Get query history     | ✅   |
| `GET`    | `/api/search/history/:id` | Get specific query    | ✅   |
| `DELETE` | `/api/search/history/:id` | Delete query          | ✅   |
| `DELETE` | `/api/search/history`     | Clear all history     | ✅   |
| `GET`    | `/api/search/rate-limit`  | Get rate limit status | ✅   |

---

## 🧪 Testing

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Structure

```
server/__tests__/
├── unit/
│   ├── controllers/         # Controller unit tests
│   ├── middleware/          # Middleware unit tests
│   └── services/            # Service unit tests
└── integration/
    └── routes/              # API integration tests

client/src/__tests__/
├── components/              # Component tests
├── pages/                   # Page tests
└── context/                 # Context tests
```

---

## 🏗️ Architecture

### Backend Architecture

```
Request → Routes → Middleware → Controllers → Services → Database
                      ↓
               (auth, validation)
```

**Key Design Patterns:**

- **MVC Architecture** - Separation of concerns
- **Middleware Chain** - Modular request processing
- **Service Layer** - Reusable business logic
- **Repository Pattern** - Mongoose models as data access

### Frontend Architecture

```
App → Router → Pages → Components → API Client
         ↓
    AuthContext (Global State)
```

**Key Features:**

- **Context API** - Authentication state management
- **Protected Routes** - Client-side route guards
- **Modular Components** - Reusable UI components
- **TypeScript** - Full type safety

---

## 📝 Available Scripts

### Server

| Script                  | Description                 |
| ----------------------- | --------------------------- |
| `npm run dev`           | Development with hot reload |
| `npm start`             | Production server           |
| `npm test`              | Run tests                   |
| `npm run test:coverage` | Tests with coverage         |

### Client

| Script                  | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Development server       |
| `npm run build`         | Production build         |
| `npm run preview`       | Preview production build |
| `npm run lint`          | Run ESLint               |
| `npm test`              | Run tests                |
| `npm run test:coverage` | Tests with coverage      |

---

<div align="center">

**Built with ❤️ using the MERN Stack + Gemini AI**

**AI Assistance:** AI tools were used to assist in the development process. Primarily for debugging, code optimization, and documentation, Testing was performed by the developer to ensure quality and correctness.

<sub>Last updated: January 2026</sub>

</div>
 "