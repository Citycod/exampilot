# MASTER BUILD PROMPT — "ExamPilot" Take-Home Assessment

> Paste this entire document as the system/task prompt for your coding assistant (Claude Code, Cursor, etc.). It is self-contained: concept, architecture, endpoints, folder structure, and acceptance criteria are all specified so nothing from the original brief gets lost.

---

## 0. Role & Working Agreement

You are acting as a senior full-stack engineer pair-programming with me to complete a timed take-home assessment for a Software Engineer role at Wekoya. Time budget is 4–6 focused hours across up to 2 days, **submission deadline: Wednesday, July 15, 2026**. Work in small, logical commits (a plus, not required, but cheap to do as you go). If something is genuinely ambiguous, make the most reasonable assumption, write it down in the README under "Assumptions & Tradeoffs," and keep moving — do not stall on clarification. A smaller, fully-working submission beats a bigger broken one — **if you hit the time limit with items still unfinished, stop building and note the unfinished items in the README instead of pushing through**; don't sacrifice a working core to chase a half-built extra.

---

## 1. Chosen Concept: ExamPilot

**What it is:** An AI-powered exam-prep assistant for students studying for a standardized exam (e.g. WAEC, JAMB, SAT — keep the copy generic/configurable so it isn't hardcoded to one exam board). A student chats with the assistant about a subject/topic; the assistant can look up the exam date, generate practice questions, grade a submitted answer against a rubric, and build a day-by-day study schedule that accounts for how many days remain and how many hours the student can study per day.

**Why this concept (for the README):** It's a genuine education use case with natural multi-tool structure (lookup → generate → grade → schedule), it supports real function chaining (a single "help me prepare for my exam" request can trigger 2–3 tools in sequence — covers the bonus goal), and it's distinct from a generic tutoring chatbot because the tools produce structured, actionable artifacts (a schedule, a graded score) rather than just prose.

### The 4 Tools (3 is the hard minimum — build all 4; the 4th also unlocks the multi-step chaining bonus)

1. **`lookup_exam_date`**
   - Description: Look up the (mocked) date of a named exam.
   - Parameters: `exam_name` (string, required), `country` (string, optional)
   - Returns: `{ examName, date, daysRemaining }`
   - Mock this with a small in-memory lookup table (e.g. WAEC, JAMB, SAT, IGCSE with plausible 2026 dates) plus a sensible fallback for unknown exams (e.g. "no confirmed date, estimate 90 days out") — must not crash on an unrecognized exam name.

2. **`generate_practice_questions`**
   - Description: Generate practice questions on a topic at a given difficulty.
   - Parameters: `subject` (string, required), `topic` (string, required), `difficulty` (enum: easy/medium/hard, required), `count` (integer, optional, default 3, max 10)
   - Returns: `{ questions: [{ id, question, difficulty }] }`
   - This tool's "execution" can itself just structure/validate the request — the actual question text can be produced by Gemini in its function response, OR you can have the tool deterministically build a prompt fragment. Either is fine; pick the simpler one and note it in the README. Validate `count` bounds and reject silently-clamped values rather than crashing.

3. **`grade_answer`**
   - Description: Grade a student's submitted answer against a simple rubric and return a score + feedback.
   - Parameters: `question` (string, required), `submittedAnswer` (string, required), `rubric` (string, optional — if omitted, use a generic correctness/clarity rubric)
   - Returns: `{ score (0–100), feedback (string), strengths: string[], improvements: string[] }`
   - This is the tool most worth unit-testing (see Testing section) — it's pure logic/formatting once given inputs, so it's easy to test deterministically without hitting the live Gemini API in tests.

4. **`build_study_schedule`**
   - Description: Build a day-by-day study schedule across topics given an exam date and available hours per day.
   - Parameters: `topics` (string[], required), `examDate` (string, ISO date, required), `hoursPerDay` (number, required)
   - Returns: `{ schedule: [{ day, date, topic, hours }] }`
   - Handle invalid dates (past dates, malformed strings) gracefully — return a clear structured error object the model can relay in natural language, don't throw an unhandled exception.
   - This is the one designed to **chain** naturally after `lookup_exam_date` (get the date, then build the plan against it) — showcase that flow explicitly in one of your demo conversations.

---

## 2. Backend Requirements (Node.js + Express)

- Talks to the **Gemini API**. As of now (mid-2026) the current recommended model for function calling is **`gemini-3.5-flash`** via the `@google/genai` SDK, using either the legacy `generateContent` method (fully supported, simplest to implement in a time-boxed assessment) or the newer Interactions API. **Do not hardcode this blindly** — the brief explicitly calls out that this changes over time, so add a `GEMINI_MODEL` env var (defaulting to `gemini-3.5-flash`) so it's a one-line config change if Google renames the model again before you submit, and quickly confirm on https://ai.google.dev/gemini-api/docs/function-calling before you start coding.
- Define all 3–4 tools above as proper JSON schema function declarations (name, description, typed parameters, required vs optional) passed to Gemini.
- Implement the **full round trip**: user message + tool declarations → Gemini → detect function call → execute server-side function → send function result back to Gemini → return Gemini's final natural-language response to the client.
- **Error handling (required, don't skip):**
  - Gemini requests a tool with invalid/missing arguments → validate before executing, return a graceful structured error back to Gemini (or to the client) instead of crashing.
  - Tool execution itself throws → catch it, return a graceful degraded response ("I couldn't complete that calculation because ___") instead of a 500.
  - Gemini API call itself fails (network/rate limit) → surface a clean error to the frontend, don't crash the server.

### Minimum Endpoints (exact contract from the brief — keep these)

| Method | Endpoint | Behavior |
|---|---|---|
| POST | `/api/auth/register` | Create user (email + password). Hash password (bcrypt) before holding in memory. Return JWT. |
| POST | `/api/auth/login` | Validate against in-memory store, return JWT. |
| GET | `/api/tools` | Protected. Return JSON schema definitions of the exposed tools (frontend renders these as "available capabilities"). |
| POST | `/api/chat` | Protected. Accepts `{ message, sessionId }`. Runs the full Gemini round trip (including any tool calls) and returns the final response. |
| GET | `/api/chat/:sessionId` | Protected. Returns in-memory message history for that session. |

### Auth

- Email + password register/login, bcrypt-hashed before being held anywhere (even in memory).
- JWT issued on register/login; required on `/api/chat` and `/api/chat/:sessionId`.
- Proper 401s for missing/invalid/expired tokens.
- No OAuth, no refresh tokens, no roles — single user role only. Don't over-engineer this part; it's explicitly not what's being stress-tested.

### Data & Storage

- **No database, no filesystem writes.** Users, sessions, and chat history live in-memory (plain objects/Maps or a small singleton store module).
- It's expected and correct that state resets on server restart, including cold-starts on a free-tier host. **State this explicitly in the README** so it isn't mistaken for a bug.

### Required Backend File Structure (keep this separation of concerns — exact file names can flex)

```
backend/
  src/
    config/          # env loading, Gemini client setup
    routes/          # auth.routes.js, chat.routes.js
    controllers/     # request handling per route
    services/
      gemini.service.js   # Gemini API calls, function-call orchestration
      tools/              # one file per tool + a schema registry
    middleware/      # auth.middleware.js, error handler
    store/           # in-memory user/session stores
    utils/
  tests/
  server.js
  .env.example
```

---

## 3. Frontend Requirements (React — Vite or CRA, your choice)

- Register/login screens; unauthenticated users cannot reach the assistant.
- Chat-style interface, conversation held in React state (fine if lost on refresh — no storage requirement).
- **Visible, specific tool-call feedback** — not a generic spinner. E.g. "📅 Checking the exam date…", "✍️ Grading your answer…", "🗓️ Building your study schedule…". This is an explicit creativity/UX scoring point — don't skip it or generalize it into one spinner state.
- Loading, empty, and error states: Gemini API failure, network failure, invalid input — all three need real handling, not just a try/catch that silently fails.
- **Fully mobile-responsive** from small phone width up through desktop. It will be tested by literally resizing the browser and on a real phone-sized viewport — don't just eyeball it at desktop width and call it done.
- Any styling approach is fine (plain CSS, CSS modules, Tailwind, component library) — visual polish and originality count toward the creativity score, so don't default to unstyled Bootstrap-looking defaults if you have time to make it feel like a real product.

### Required Frontend File Structure

```
frontend/
  src/
    components/      # ChatWindow, MessageBubble, ToolCallIndicator, etc.
    pages/           # LoginPage, RegisterPage, ChatPage
    context/         # AuthContext (or your state approach)
    services/        # api.js — the layer that talks to the backend
    hooks/
    styles/
  App.jsx
```

---

## 4. Testing (required, not optional — 5% of score but also a rubric line item)

Minimum bar, don't gold-plate this given the time budget:
1. One test for a tool's execution logic — `grade_answer` or `build_study_schedule` are the easiest to test deterministically without live Gemini calls.
2. One test for an auth flow — e.g. rejecting an invalid/missing JWT on a protected route.

Use whatever test runner you're fastest in (Jest/Vitest + Supertest is a reasonable default for this stack).

TypeScript is welcome but not required — use whichever you'll be most productive and correct in under the time budget; don't switch to TS for this assessment if it'll cost you debugging time you don't have.

---

## 5. Deployment (required — both links are mandatory in the submission)

- Deploy backend somewhere reachable (Render/Railway/Fly.io free tier is fine — cold starts and resets on sleep are expected and acceptable, note this in the README).
- Deploy frontend somewhere reachable (Vercel/Netlify).
- Confirm the deployed frontend can actually reach the deployed backend (CORS configured correctly, env var for API base URL set on the frontend host, not hardcoded to localhost).
- **Never commit a real Gemini API key.** `.env.example` with placeholders only; real key goes into the host's secret/env-var settings.

---

## 6. Evaluation Rubric (use this to prioritize your remaining time — highest weight first)

| Category | What's being evaluated | Weight |
|---|---|---|
| Gemini function-calling integration | Correct tool/schema declarations, proper handling of the function-call round trip, sensible execution and error handling of tool results. | 20% |
| Backend design, auth & structure | Clean REST API, working JWT auth on protected routes, sensible in-memory session handling, matches expected file hierarchy. | 20% |
| Frontend implementation & responsiveness | Component structure, state management, works cleanly on mobile and desktop breakpoints, loading/empty/error states. | 20% |
| Creativity & uniqueness | Originality of the chosen use case and tools, thoughtful UX touches, doesn't feel like a generic chatbot clone. | 15% |
| Code quality & file organization | Readable code, consistent naming, no dead code, matches the requested folder hierarchy, appropriate comments. | 15% |
| Testing | Automated tests for at least the tool-calling logic and one auth flow. | 5% |
| Communication (README) | Clear setup instructions, explanation of decisions/tradeoffs, notes on what was skipped and why. | 5% |

**Practical read on this:** function-calling integration + backend + frontend together are 60% of the score — that's where a time-crunched build should go first. Creativity and code quality (30% combined) come from doing the core well, not from extra features. Testing and README are only 10% combined but are nearly free once the core works — don't skip them for the sake of a stretch goal worth less.

---

## 7. README (required, 5% of score, and directly read by the evaluator)

Must include:
- Local setup steps for both backend and frontend (install, env vars, how to run tests).
- The deployed link(s) — both frontend and backend if separately hosted.
- **Chosen education use case + why** (use the "Why this concept" paragraph from Section 1, expand if you want).
- Decisions/tradeoffs made, and what you'd do with more time.
- Explicit note that state is in-memory-only and resets on restart/cold-start — this is a design choice per the brief, not a bug.
- Any assumptions made to resolve ambiguity in the brief.

---

## 8. Bonus / Stretch (only attempt after core is solid — do not sacrifice core quality for these)

- Multi-step tool chaining: demonstrate `lookup_exam_date` → `build_study_schedule` in one user turn.
- Streaming responses to the frontend.
- A visual "available tools" panel driven by `/api/tools`.
- Dark mode/theming.
- Dockerized setup (`docker-compose up` runs both services).

---

## 9. Explicitly Out of Scope (per the brief — don't spend time here)

- No persistent storage of any kind.
- No zero-downtime/production-grade hosting — a working free-tier deploy is sufficient.
- No OAuth, refresh tokens, or roles/permissions.
- No requirement for 100% test coverage.

---

## 10. Submission Checklist (do this last, don't forget it)

- [ ] GitHub repo is **public**.
- [ ] Both deployed link and repo link are ready.
- [ ] README covers setup, deployed link, use-case rationale, tradeoffs, and assumptions.
- [ ] `.env.example` present, no real API key committed anywhere in git history.
- [ ] Submit both links via the submission form (not by replying to the email directly): https://forms.gle/XoP5S2ZadqDqwN1aA
- [ ] Submit by **Wednesday, July 15, 2026**.
