
# 🌾 Krishi-Net: AI-Powered Smart Agriculture Platform

![Krishi-Net Banner](https://via.placeholder.com/1200x300/22c55e/ffffff?text=KRISHI-NET+|+Smart+Agriculture+Ecosystem)

<div align="center">

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Project Overview

**Krishi-Net** is a comprehensive, AI-driven digital ecosystem designed to empower Indian farmers. By bridging the gap between traditional farming and modern technology, Krishi-Net provides real-time disease detection, personalized advisory services, market intelligence, and farm management tools—all in the farmer's local language.

Our mission is to democratize access to agricultural expertise, reducing crop loss and maximizing farmer profitability through data-driven decisions.

---

## 🎯 Problem vs. Solution

| The Problem 🔴 | The Krishi-Net Solution 🟢 |
| :--- | :--- |
| **Crop Diseases:** Delayed diagnosis leads to massive yield loss (up to 40%). | **Instant AI Diagnosis:** Detects diseases in seconds from a simple photo with treatment plans. |
| **Lack of Expertise:** Expert agronomists are often inaccessible to rural farmers. | **AI Advisory:** 24/7 Chatbot providing scientific advice in Hindi, Urdu, and English. |
| **Market Opacity:** Farmers sell at low rates due to lack of price awareness. | **Market Intelligence:** Real-time Mandi prices and "Sell vs. Hold" AI recommendations. |
| **Unpredictable Weather:** Reliance on generic forecasts. | **Hyper-local Weather:** Farming-specific weather insights and rain alerts. |

---

## ✨ Key Features

### 1. 🦠 AI Disease Detection
*   Upload a photo of a crop leaf.
*   Get instant analysis: Disease Name, Severity, Confidence Score.
*   Receive chemical and organic treatment recommendations.

### 2. 🤖 Smart Advisory (Chatbot)
*   Multilingual support (English, Hindi, Urdu).
*   Context-aware answers based on weather and crop data.
*   Powered by Google Gemini models.

### 3. 📈 Market Intelligence
*   Real-time price tracking for various crops (Wheat, Rice, Tomato, etc.).
*   Historical price trends visualization (Charts).
*   **Profit Estimator** and **Sell/Hold Advisory**.

### 4. 🚜 Farm Management
*   Digital record-keeping for crops.
*   Track planting dates, area, and expected harvest.
*   Empty state guidance for new users.

### 5. 🔐 Secure Authentication
*   Dual Login: Password or OTP (SMS/Email).
*   Robust Onboarding flow.
*   Password strength meters and secure session management.

---

## 🛠️ Tech Stack

<div align="center">

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | High-performance UI library. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for modern design. |
| **Animations** | Framer Motion | Smooth transitions and micro-interactions. |
| **Backend** | Python, FastAPI | High-speed, async web framework. |
| **Database** | PostgreSQL, SQLAlchemy | Relational database for users and farm data. |
| **AI/ML** | Google Gemini, TensorFlow | GenAI for chat/analysis, CNN for image classification. |
| **External APIs** | Open-Meteo, Twilio | Weather data and SMS services. |

</div>

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[📱 Farmer (Mobile/Web)]
    
    subgraph "Frontend Layer"
        UI[React UI]
        Auth_FE[Auth Manager]
        State[Context API]
    end
    
    subgraph "Backend Layer"
        API[FastAPI Gateway]
        Auth_BE[Auth Service (JWT/OTP)]
        ML_Service[ML Inference Service]
        DB_Service[Database Service]
    end
    
    subgraph "External Services"
        Gemini[Google Gemini API]
        Weather[Open-Meteo API]
        Postgres[(PostgreSQL DB)]
        SMS[Twilio/SMTP]
    end

    Client --> UI
    UI --> Auth_FE
    Auth_FE --> API
    API --> Auth_BE
    API --> ML_Service
    API --> DB_Service
    
    ML_Service --> Gemini
    Auth_BE --> SMS
    DB_Service --> Postgres
    ML_Service --> Weather
```

---

## 📂 Project Structure

```bash
krishi-net/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Routes (Auth, Crops, etc.)
│   │   ├── core/             # Config & Security
│   │   ├── models/           # SQLAlchemy Database Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── services/         # Business Logic (OTP, ML)
│   │   └── main.py           # App Entry Point
│   └── requirements.txt
│
├── src/                      # React Frontend
│   ├── components/           # Reusable UI Components
│   │   ├── Auth.tsx          # Login/Signup/OTP Logic
│   │   ├── Dashboard.tsx     # Main User Interface
│   │   ├── DiseaseDetector.tsx
│   │   └── ...
│   ├── contexts/             # Global State (Theme, Language)
│   ├── services/             # API Connectors
│   ├── types/                # TypeScript Interfaces
│   ├── App.tsx               # Root Component
│   └── main.tsx
│
├── public/                   # Static Assets
├── index.html                # Entry HTML
├── vite.config.ts            # Vite Config
└── README.md                 # Documentation
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register a new user with password/OTP. |
| **POST** | `/api/auth/login` | Login via Password. |
| **POST** | `/api/auth/login-otp` | Login via OTP (Passwordless). |
| **POST** | `/api/auth/send-otp` | Trigger SMS/Email OTP. |
| **POST** | `/api/predict` | Upload image for disease detection. |
| **GET** | `/api/weather` | Get localized weather data. |

---

## 💾 Database Schema Overview

*   **Users:** Stores profile info, hashed passwords, location, onboarding status.
*   **OTPs:** Stores temporary OTP codes, expiry, and verification status.
*   **Scans:** History of disease detection scans, image URLs, and analysis results.
*   **Crops:** User's farm data, crop types, planting dates.

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/techlions/krishi-net.git
cd krishi-net
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure Environment Variables (.env)
# DATABASE_URL=postgresql://user:pass@localhost/krishidb
# SECRET_KEY=your_secret
# GOOGLE_API_KEY=your_gemini_key

uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal
cd ..
npm install

# Configure Environment Variables (.env)
# VITE_API_URL=http://localhost:8000

npm run dev
```

---

## ☁️ Deployment

### Frontend (Vercel/Netlify)
1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Set Build Command: `npm run build`.
4.  Set Output Directory: `dist`.

### Backend (Render/Railway)
1.  Push code to GitHub.
2.  Create a Web Service on Render connecting to the repo.
3.  Set Build Command: `pip install -r backend/requirements.txt`.
4.  Set Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 10000`.

---

## 🔮 Future Roadmap

- [ ] **IoT Integration:** Connect with soil moisture sensors.
- [ ] **Drone Analytics:** Aerial view analysis for large fields.
- [ ] **Offline Mode:** Lite version for areas with low connectivity.
- [ ] **Community Forum:** Farmer-to-farmer interaction platform.
- [ ] **Voice-First Navigation:** Full voice control for accessibility.

---

<div align="center">

### 👨‍💻 Made by Team Techlions

**Team Leader:** Shivam Singh  
**Institution:** IIT Patna

<img src="https://upload.wikimedia.org/wikipedia/en/5/52/Indian_Institute_of_Technology%2C_Patna.svg" width="100" alt="IIT Patna Logo"/>

*"Innovating for a Greener Tomorrow"*

</div>
