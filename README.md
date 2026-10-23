# Voyanta 🌍✈️
> **AI-Powered Collaborative Travel Planning Platform**

Voyanta is a modern full-stack web application designed to help travelers plan trips seamlessly, generate AI-assisted itineraries, explore destinations with interactive maps, track and split travel budgets, and coordinate collaboratively with travel companions.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express.js (RESTful APIs)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing

### Integrations & Services
- **AI Engine**: LLM API (Google Gemini / OpenAI)
- **Maps & Places**: Google Maps Platform APIs (Places, Maps, Directions)
- **Weather API**: OpenWeather / WeatherAPI

---

## 📁 Repository Structure

```text
voyanta/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, graphics, illustrations
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Maps, Modals)
│   │   ├── pages/              # Route pages (Landing, Explore, Dashboard, Trips, AI Planner, Profile)
│   │   ├── context/            # React context providers (AuthContext, TripContext)
│   │   ├── services/           # API call services
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx             # App routing and layout
│   │   ├── main.jsx            # React root entry
│   │   └── index.css           # Global Tailwind styles
│   └── package.json
│
├── server/                     # Backend Node.js & Express API
│   ├── src/
│   │   ├── config/             # DB and service configurations
│   │   ├── controllers/        # Route controllers (Auth, Trips, Itinerary, Expenses, AI)
│   │   ├── models/             # Mongoose schemas (User, Trip, TripMember, ItineraryItem, Expense)
│   │   ├── routes/             # Express API route endpoints
│   │   ├── middlewares/        # Auth, validation, and error middlewares
│   │   ├── services/           # AI, Maps, and Weather service integrations
│   │   └── utils/              # Helper utilities
│   ├── server.js               # Express application entry point
│   ├── .env.example            # Backend environment variable template
│   └── package.json
│
├── .gitignore                  # Git ignore rules for node_modules, build & env files
└── README.md                   # Project documentation
```

---

## 🛠️ Quick Start

### 1. Backend Setup (`server`)
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend Setup (`client`)
```bash
cd client
npm install
npm run dev
```

---

## 👥 Contributors
- **Sudhan M** ([@Sudhan-Morgan](https://github.com/Sudhan-Morgan))
