Full-Stack Engineering Take-Home Assessment
An education-focused AI application powered by Gemini function calling (React + Node/Express)
Overview
You'll design and build a small full-stack AI application that uses the Google Gemini API's function calling (JSON toolcalling) capability. You choose the concept — the goal is to see how you design an LLM-backed API, structure a React app
around it, implement auth, and make good judgment calls under time constraints. Creativity in the concept is part of what's
being evaluated, not a side note.
Suggested time: 4–6 focused hours, spread across up to 2 days. We'd rather see a smaller, well-executed submission than a
rushed, incomplete one. If you're at the time limit and have unfinished items, stop and note them in the README instead of
pushing through.
The Scenario
Build an AI assistant that solves a real problem in education — for students, teachers, or self-learners. You choose the
specific angle, but it must be a genuine education use case (not a generic assistant with an education skin). Some examples to
spark ideas (don't feel limited to these, and we'd genuinely like to see something original):
• A study planner that can break a syllabus into a schedule, look up (mocked) exam dates, and calculate study time needed
per topic.
• A tutoring assistant that can generate practice questions on a topic, check a submitted answer, and explain a concept at a
chosen difficulty level.
• A teacher's assistant that can generate a quiz from a topic, grade short-answer responses against a rubric, and summarize
class performance.
Whatever you choose, the assistant must call backend-implemented functions/tools through Gemini's function calling — not
just generate free text.
Backend Requirements
Build a REST API using Node.js and Express that talks to the Gemini API.
• Define at least 3 distinct tools/functions with proper JSON schema declarations (name, description, typed parameters,
required vs optional fields) passed to Gemini. This is a hard minimum, not a suggestion — the app should meaningfully
use all 3+ in normal conversation.
• Implement the full function-calling round trip: send the user message + tool declarations to Gemini, detect a function call
in the response, execute the corresponding server-side function, send the function result back to Gemini, and return its
final natural-language response.
• Handle the case where Gemini requests a tool with invalid/missing arguments, and the case where the tool execution
itself fails — both should degrade gracefully, not crash the request.
• Use whichever current Gemini model supports function calling (check Google's Gemini API docs for the latest model
name — this changes over time, so don't hardcode based on an old blog post).
Minimum endpoints:
Method Endpoint Behavior
POST /api/auth/register Create a user (email + password). Password must be
hashed before being held in memory. Return a JWT on
success.
POST /api/auth/login Validate credentials against the in-memory user store and
return a JWT.
Method Endpoint Behavior
GET /api/tools Protected. Return the JSON schema definitions of the tools
this app exposes to Gemini (useful for the frontend to
render "available capabilities").
POST /api/chat Protected. Accepts a user message (+ conversation/session
id). Sends it to Gemini with the tool declarations, executes
any function call(s) Gemini returns, sends the function
result back to Gemini, and returns the final response.
GET /api/chat/:sessionId Protected. Return the in-memory message history for a
session (lost on server restart — that's expected, see Data
& Storage below).
Authentication
Auth is required, but keep it lightweight — this is not the part we're stress-testing:
• Email + password register/login, passwords hashed (e.g. bcrypt) before being held anywhere, even in memory.
• Issue a JWT on login/register; require a valid JWT on /api/chat and /api/chat/:sessionId.
• Return proper 401s for missing/invalid/expired tokens.
• No OAuth, no refresh-token rotation, no roles/permissions needed — a single user role is fine.
Data & Storage
No persistent storage for this assessment — no database, no filesystem writes. Keep users, sessions, and chat history in
memory (e.g. plain objects/Maps in a module, or an in-memory store like a simple singleton service). It's expected and fine
that everything resets when the server restarts — including on your deployed host, if it sleeps/cold-starts (e.g. free-tier
Render). Note this in the README so it's not mistaken for a bug.
Frontend Requirements
Build a React app (Vite or Create React App, your choice):
• Register/login screens; unauthenticated users can't reach the assistant.
• A chat-style interface for talking to the assistant, with the conversation held in state (lost on refresh is fine, given no
storage).
• Visible feedback when the assistant is calling a tool — e.g. "Checking the weather…" — not just a generic spinner. This
is where you can be creative with the UX.
• Loading, empty, and error states (e.g. Gemini API failure, network failure, invalid input).
• Fully mobile-responsive: the layout should work cleanly from a small phone width up through desktop, not just
"technically doesn't break." We will resize the browser and test on a real phone-sized viewport.
Use any styling approach you like (plain CSS, CSS modules, Tailwind, a component library) — but visual polish and
originality here do count toward the creativity score.
Expected File Structure
We're specifically evaluating how you organize a project, so please roughly follow this hierarchy (exact file names can flex,
but the separation of concerns should not):
backend/
 src/
 config/ # env loading, Gemini client setup
 routes/ # auth.routes.js, chat.routes.js
 controllers/ # request handling per route
 services/
 gemini.service.js # Gemini API calls, function-call orchestration
 tools/ # one file per tool + a schema registry
 middleware/ # auth.middleware.js, error handler
 store/ # in-memory user/session stores
 utils/
 tests/
 server.js
 .env.example
frontend/
 src/
 components/ # ChatWindow, MessageBubble, ToolCallIndicator, etc.
 pages/ # LoginPage, RegisterPage, ChatPage
 context/ # AuthContext (or your state approach)
 services/ # api.js — the layer that talks to the backend
 hooks/
 styles/
 App.jsx
Technical Expectations
• Both apps should run locally with clear setup steps in a README (install, env vars including your Gemini API key
placeholder, how to run tests).
• Include a .env.example — never commit a real API key.
• Meaningful git history is a plus (a handful of logical commits beats one giant commit), but not required.
• TypeScript is welcome but not required — use whatever you're most productive and correct in.
• Automated tests for at least: one tool's execution logic, and one auth flow (e.g. rejecting an invalid token).
• Deploy both the frontend and backend somewhere reachable by URL (any host you like — e.g. Vercel/Netlify for the
frontend, Render/Railway/Fly.io for the backend). The deployed link is required, not optional, alongside the local setup
instructions.
Bonus / Stretch Goals (optional)
Only attempt these if the core requirements are solid and you have time left. A complete, well-tested core submission beats a
partial one with extras.
• Multi-step tool chaining (Gemini calls more than one tool in sequence to answer a single request)
• Streaming responses to the frontend
• A visual "available tools" panel driven by the /api/tools schema
• Dark mode / theming
• Dockerized setup (docker-compose up and both services run)
What We Are Not Evaluating
To help you spend time in the right places, we explicitly do not expect:
• Persistent storage of any kind — in-memory is correct, not a shortcut
• Zero-downtime or production-grade hosting — a free-tier deploy that works when tested is completely fine
• Enterprise-grade auth (OAuth, refresh tokens, roles) — basic JWT is enough
• 100% test coverage — a handful of well-chosen tests is enough
Evaluation Rubric
Category What we're looking for Weight
Gemini function-calling integration Correct tool/schema declarations, proper handling of the functioncall round trip, sensible execution and error handling of tool
results.
20%
Backend design, auth & structure Clean REST API, working JWT auth on protected routes, sensible
in-memory session handling, matches expected file hierarchy.
20%
Frontend implementation &
responsiveness
Component structure, state management, works cleanly on mobile
and desktop breakpoints, loading/empty/error states.
20%
Creativity & uniqueness Originality of the chosen use case and tools, thoughtful UX
touches, doesn't feel like a generic chatbot clone.
15%
Code quality & file organization Readable code, consistent naming, no dead code, matches the
requested folder hierarchy, appropriate comments.
15%
Testing Automated tests for at least the tool-calling logic and one auth
flow.
5%
Communication (README) Clear setup instructions, explanation of decisions/tradeoffs, notes
on what was skipped and why.
5%
Submission Instructions
• Push your code to a public GitHub repository (please make sure visibility is set to public, not private).
• Deploy the app and get a working live link — both the deployed link and the repo link are required.
• Make sure the README includes local setup steps, the deployed link, your chosen education use case + why, and a
short section on decisions/tradeoffs and what you'd do with more time.
• Do not commit your Gemini API key — use .env locally and the equivalent secret/env-var settings on your hosting
provider.
• Submit both links (repo + deployed app) using the submission form included in the email you were sent — please don't
reply directly with just the links, submit through the form.
• If anything in this brief is ambiguous, make a reasonable assumption, note it in the README, and move on — resolving
ambiguity is part of the exercise