
# 📚 BookNook

> **A modern, AI-powered social platform for book lovers.**

![BookNook Banner](https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&h=300&q=80)

**BookNook** is a full-stack web application that reimagines the online reading community. It seamlessly blends social networking features with robust library management, a FastAPI backend, and cutting-edge **Google Gemini AI** integration.

---

## 📖 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Access URLs](#-access-urls)
- [API Documentation](#-api-documentation)
- [Admin Panel](#-admin-panel)
- [AI Features](#-ai-features)
- [License](#-license)

---

## ✨ Key Features

| Category | Features |
| :--- | :--- |
| **User System** | Authentication (JWT), profiles, following, activity feeds |
| **Social** | Review feeds, messaging, book clubs/groups |
| **Books** | Detailed pages, price comparison, reviews, AI insights |
| **Admin Panel** | Dashboard, user management, content moderation, audit logs |
| **AI Integration** | Book recommendations, deep insights, chatbot assistant |
| **Theming** | Light, Dark, and Gray themes |

---

## 🛠 Tech Stack

### Frontend
| Tool | Usage |
| :--- | :--- |
| React 19 | UI Library |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router DOM v7 | Routing |

### Backend
| Tool | Usage |
| :--- | :--- |
| FastAPI | Web framework |
| SQLAlchemy | ORM |
| SQLite | Database |
| JWT (python-jose) | Authentication |
| Pydantic | Validation |

### AI
| Tool | Usage |
| :--- | :--- |
| Google Gemini API | Recommendations, insights, chatbot |

---

## 📂 Project Structure

```
BookNook/
├── backend/                    # FastAPI Backend
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # App entry point
│       ├── config.py          # Settings
│       ├── database.py        # SQLAlchemy setup
│       ├── models/            # Database models
│       ├── schemas/           # Pydantic schemas
│       ├── routers/           # API endpoints
│       ├── services/          # Auth service
│       └── utils/             # Seed utility
│
├── frontend/                   # React Frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   └── admin/         # Admin pages
│       └── services/
│           ├── api.ts         # Backend API client
│           └── geminiService.ts
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **Google Cloud API Key** (for AI features)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python -m app.utils.seed

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file for AI features
echo "GEMINI_API_KEY=your_google_api_key" > .env

# Start development server
npm run dev
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |
| **Admin Panel** | http://localhost:3000/#/admin |

---

## 📚 API Documentation

The FastAPI backend auto-generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main API Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `GET /users`, `PATCH /users/me`, `POST /users/{id}/follow` |
| Books | `GET /books`, `POST /books`, `PATCH /books/{id}` |
| Authors | `GET /authors`, `POST /authors` |
| Reviews | `GET /reviews`, `POST /reviews` |
| Posts | `GET /posts`, `POST /posts` |
| Groups | `GET /groups`, `POST /groups/{id}/join` |
| Messages | `GET /messages`, `POST /messages` |
| Admin | `GET /admin/dashboard/stats`, `GET /admin/users` |

---

## 🛡️ Admin Panel

Access the private admin panel at `/admin` (requires admin login).

### Default Admin Credentials
| Email | Password |
|-------|----------|
| admin@booknook.com | admin123 |

### Admin Features
- **Dashboard** - Overview statistics
- **User Management** - List, ban, toggle admin, delete users
- **Content Moderation** - Approve/reject pending reviews and posts
- **Audit Logs** - Track all admin actions

---

## 🤖 AI Features

BookNook uses **Google Gemini API** for intelligent features:

| Feature | Description |
| :--- | :--- |
| **Book Concierge** | Get personalized recommendations based on vibes/preferences |
| **Deep Insights** | AI-generated literary analysis on book pages |
| **BookBot Chat** | Context-aware chatbot assistant |

To enable AI features, add your Google API key to `frontend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
