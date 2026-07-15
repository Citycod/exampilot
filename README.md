# ExamPilot

ExamPilot is an AI-powered exam-prep assistant for students studying for standardized exams (like WAEC, JAMB, SAT). It helps students look up exam dates, generate practice questions, grade submitted answers, and build a personalized study schedule.

## Chosen Concept & Rationale
**Concept:** An AI exam-prep assistant.
**Why:** It's a genuine educational use case that naturally requires multi-tool structuring. A student can ask "When is WAEC and can you make a study schedule?" which perfectly demonstrates the ability of the LLM to chain multiple tools (lookup -> generate schedule) to return a cohesive result. The tools produce actionable, structured artifacts rather than just prose.

## Architecture & Tech Stack
- **Backend:** Node.js, Express, `@google/genai` (gemini-3.5-flash), in-memory data store, JWT authentication, bcrypt.
- **Frontend:** React, Vite, Tailwind CSS, React Router.

## Setup Instructions

### Backend
1. `cd backend`
2. `pnpm install`
3. Rename `.env.example` to `.env` and fill in your `GEMINI_API_KEY` and `JWT_SECRET`.
4. `pnpm start` (or `node server.js`) - The server will run on `http://localhost:5000`.

### Frontend
1. `cd frontend`
2. `pnpm install`
3. `pnpm run dev` - The React app will run on `http://localhost:5173`.

## Assumptions & Tradeoffs
- **In-Memory Store:** Per the brief, no database is used. Users, sessions, and chat history are held in memory. **Data will be lost when the server restarts.** This is an expected design choice.
- **Gemini API Execution:** For the `generate_practice_questions` tool, rather than making nested LLM calls inside the tool execution, the tool returns a prompt fragment instructing the main Gemini instance to generate the questions in its final response. This keeps the architecture simple and avoids nested latency.
- **Styling:** Used Tailwind CSS to rapidly implement a responsive, modern interface.
- **Streaming:** Not implemented to save time and focus on the core requirements of accurate tool execution and state management.

## Testing
Run backend tests using Vitest:
```bash
cd backend
npx vitest run
```

## Deployment
Both frontend and backend are designed to be deployed to free-tier hosts like Render or Vercel. 
- **Backend:** Host on Render. Set environment variables.
- **Frontend:** Host on Vercel. Set `VITE_API_URL` to the backend URL.

*Note: Since the backend uses an in-memory store, data will reset on cold starts on free-tier hosts.*
