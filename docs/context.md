

# 🧠 AgileLens — AI-Powered Sprint Planning Dashboard

> *Data-driven sprint forecasting and capacity planning for Agile teams.*

---

## 📋 Overview

AgileLens is a lightweight, full-stack web app that helps Agile teams **plan sprints more intelligently** using AI. It predicts sprint capacity, visualizes team velocity trends, and provides actionable recommendations to prevent overcommitment or idle time.

The project showcases end-to-end technical project management: requirements gathering, agile execution, and measurable outcomes — built entirely on **free-tier infrastructure** for zero-cost hosting.

---

## 🎯 Objectives

* **Forecast Sprint Capacity:** Analyze past velocity to predict optimal story points for upcoming sprints.
* **Identify Risks:** Flag overcommitments, blockers, or under-utilization.
* **Recommend Improvements:** Provide AI-generated planning insights.
* **Visualize Performance:** Display burndown charts, velocity trends, and team workload.
* **Free & Scalable:** Host entirely on free-tier platforms (Vercel, Supabase, OpenRouter AI).

---

## 🚀 Key Features

| Feature                      | Description                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| 📈 **AI Forecasting Engine** | Predict sprint capacity using historical velocity data and task completion rates.                  |
| 💡 **Recommendation Panel**  | AI-suggested sprint goals and risk flags (“Reduce story points by 15% to match past performance”). |
| 🧭 **Planning Assistant**    | Natural language Q&A: “What’s our ideal sprint size for 5 devs over 10 days?”                      |
| 📊 **Analytics Dashboard**   | Interactive charts: velocity, burndown, workload distribution.                                     |
| 📥 **Data Import**           | Upload CSV of past sprint data (story points, completed tasks).                                    |
| 🔐 **Team Accounts**         | Supabase Auth (email/password or magic link) with separate team spaces.                            |
| ⚙️ **Zero Cost Hosting**     | Frontend on Vercel, backend on Supabase Edge Functions, AI via OpenRouter free tier.               |

---

## 🧱 Architecture

```mermaid
graph TD
  subgraph Frontend [Frontend - React + Tailwind]
    A1[Login Page]
    A2[Dashboard]
    A3[Forecast View]
    A4[Recommendations]
    A5[Charts (Recharts/D3)]
  end

  subgraph Backend [Supabase Backend + Edge Function]
    B1[Auth]
    B2[Database (Sprint Data)]
    B3[Edge Function: AI Forecast API]
  end

  subgraph AI [AI Layer - OpenRouter API]
    C1[GPT-4/Claude Free Model]
  end

  A1 --> B1
  A2 --> B2
  A3 --> B3
  B3 --> C1
```

**Flow:**

1. User logs in via Supabase Auth
2. Uploads past sprint CSV → stored in Supabase DB
3. Edge Function triggers AI forecast (via OpenRouter)
4. Returns recommendations and renders dashboard visualizations

---

## 🧠 AI / ML Logic

* **Option 1: Lightweight ML**

  * Use **scikit-learn linear regression** (run client-side or in Edge Function)
  * Predict future velocity = function(story_points_completed, team_size, sprint_length)
* **Option 2: LLM-Powered Reasoning**

  * Use **OpenRouter’s GPT-4 or Claude 3 Haiku** (free-tier)
  * Input: JSON summary of past 5 sprints
  * Output: Recommended story point range, risks, tips

---

## 🧰 Tech Stack

| Layer               | Technology                                   | Notes                              |
| ------------------- | -------------------------------------------- | ---------------------------------- |
| **Frontend**        | React (Vite) + Tailwind CSS                  | Fast, lightweight, and free        |
| **Backend**         | Supabase (DB + Auth + Edge Functions)        | Free tier includes generous limits |
| **Database**        | Supabase PostgreSQL                          | Store users, sprints, metrics      |
| **AI**              | OpenRouter API (Claude 3 Haiku / GPT-4 Mini) | Free-tier LLM endpoint             |
| **Charts**          | Recharts / Chart.js                          | Interactive data visualization     |
| **Hosting**         | Vercel                                       | Free hosting with CI/CD            |
| **Version Control** | GitHub                                       | Public repo                        |
| **Docs**            | Notion / Markdown                            | For project artifacts              |

---

## 🧩 Data Model

### 🧾 `users`

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| id    | UUID | Supabase Auth user ID |
| name  | Text | Display name          |
| email | Text | User email            |

### 📊 `sprints`

| Field                  | Type | Description               |
| ---------------------- | ---- | ------------------------- |
| id                     | UUID | Primary key               |
| user_id                | UUID | Foreign key → users       |
| sprint_name            | Text | Name/label of sprint      |
| start_date             | Date | Sprint start              |
| end_date               | Date | Sprint end                |
| story_points_committed | Int  | Planned story points      |
| story_points_completed | Int  | Completed story points    |
| blockers               | Int  | # of blockers encountered |
| team_size              | Int  | # of active team members  |
| notes                  | Text | Observations, risks       |

### 📈 `forecasts`

| Field                | Type      | Description           |
| -------------------- | --------- | --------------------- |
| id                   | UUID      | PK                    |
| sprint_id            | UUID      | FK → sprints          |
| recommended_capacity | Int       | AI-predicted capacity |
| risk_summary         | Text      | AI risk description   |
| recommendation_text  | Text      | Full AI response      |
| created_at           | Timestamp | When generated        |

---

## 💸 Cost & Hosting Plan

| Service        | Tier  | Monthly Cost | Notes                                     |
| -------------- | ----- | ------------ | ----------------------------------------- |
| **Vercel**     | Hobby | $0           | Free static hosting                       |
| **Supabase**   | Free  | $0           | 500MB DB, 50k monthly requests            |
| **OpenRouter** | Free  | $0           | Free LLM access (Claude/Haiku/GPT-4-mini) |
| **GitHub**     | Free  | $0           | Repo + CI/CD                              |
| **Total**      |       | **$0/month** |                                           |

✅ **Total Cost:** $0/month
No paid API keys, no premium infra, fully sustainable free stack.

---

## 📦 Deliverables

* ✅ Live Demo (Vercel link)
* 🧭 Dashboard UI (Forecast + Charts)
* 🧱 ERD Diagram
* 🧠 Forecast Function (Edge Function w/ OpenRouter)
* 📄 README + context.md (this file)
* 📘 Case Study (Problem → Solution → Results)

---

## 🧭 Roadmap (MVP → v1)

### 🥇 MVP (Core)

* [ ] Supabase Auth (email/magic link)
* [ ] Sprint CRUD (create, edit, view)
* [ ] CSV Import (basic template)
* [ ] Velocity Chart
* [ ] AI Forecast (Edge Function)
* [ ] Recommendations UI

### 🥈 v1.0 (Enhancements)

* [ ] Multi-Team Workspaces
* [ ] Burndown Chart
* [ ] Sprint Comparison View
* [ ] AI Q&A Chatbox
* [ ] Export Reports (PDF/CSV)

---

## 📘 Summary

AgileLens is an **AI-assisted Agile Planning Tool** that helps teams forecast, plan, and visualize sprint performance. Built entirely on **free-tier tools**, it’s sustainable, maintainable, and production-ready for portfolio or demo purposes.

> 🧠 *“Plan smarter, sprint faster.”*

---
