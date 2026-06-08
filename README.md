# 🚀 English Chat Club (ECC)

```text
╔══════════════════════════════════════════════════════════════╗
║                  ENGLISH CHAT CLUB (ECC)                    ║
║             Learn • Practice • Connect • Improve            ║
╚══════════════════════════════════════════════════════════════╝


███████╗ ██████╗ ██████╗
██╔════╝██╔════╝██╔════╝
█████╗  ██║     ██║
██╔══╝  ██║     ██║
███████╗╚██████╗╚██████╗
╚══════╝ ╚═════╝ ╚═════╝

English Chat Club Platform
```

## 📖 Overview

English Chat Club (ECC) là nền tảng luyện nói tiếng Anh trực tuyến kết hợp mạng xã hội học tập, giúp người học phát triển kỹ năng giao tiếp thông qua các phòng hội thoại theo chủ đề, chat thời gian thực, gamification và cộng đồng tương tác.

Hệ thống hướng tới người học từ trình độ **A1 → C2**, tạo môi trường thực hành giao tiếp tiếng Anh sinh động, có tính tương tác và khích lệ cao.

---

# ✨ Key Features

## 👤 Member

### Authentication & Profile

* Register / Login
* Google OAuth2
* JWT Authentication
* Refresh Token
* Email Verification
* Forgot Password
* Two-Factor Authentication (2FA)
* Profile Management
* Google Calendar Integration

### Live Chat Rooms

* Search & Filter Rooms
* Room Registration & Waiting List
* Real-time Chat (WebSocket)
* File Attachments
* Emoji Reactions
* Read Status Tracking
* Raise Hand Voice Feature
* Speaking Practice Recording
* Chat History
* Automatic Scoring

### Direct Messaging

* One-to-One Messaging
* File Sharing
* Message Reactions
* Read Receipts
* Message Recall

### Community & Gamification

* Forum & Discussions
* Friends & Referrals
* Challenges & Achievements
* Badges & Levels
* Leaderboards
* Reward Store

### Support

* Session Ratings
* Support Tickets
* FAQ System

---

## 🛡 Moderator

* Create & Manage Chat Rooms
* Pin Important Messages
* Delete Violating Messages
* Warn Members
* Highlight Vocabulary
* Session Summaries
* Learning Session Analytics

---

## ⚙ Admin

* User Management
* Role Management
* Content Moderation
* Event Management
* Reward Store Management
* Email Marketing Campaigns
* Dashboard & Reports
* System Configuration
* Audit Logs

---

# 🔐 Security

## Authentication

* JWT Access Token (15 minutes)
* Refresh Token (7 days)
* Token Rotation
* Redis Token Blacklist
* Email Verification
* Password Reset
* Google OAuth2
* Two-Factor Authentication (TOTP)

## Protection

* Brute Force Protection
* Temporary Account Lock
* Secure Password Hashing
* Role-Based Access Control (RBAC)

---

# 🔑 RBAC Authorization

```text
                     GUEST
                       ▲
                       │
                     MEMBER
                       ▲
                       │
                   MODERATOR
                       ▲
                       │
                     ADMIN
```

### Member

Access learning, chat, booking and community features.

### Moderator

All Member permissions plus room management and moderation capabilities.

### Admin

Full system access including user management, analytics and configuration.

---

# 🏗 System Architecture

## Architectural Style

```text
Modular Monolith
        +
Hexagonal Architecture
        +
Domain Driven Design
        +
Event Driven Communication
```

---

## Project Structure

```text
ecc-backend
│
├── ecc-bootstrap
│
├── ecc-common
│
├── ecc-identity-module
│
├── ecc-session-module
│
├── ecc-community-module
│
└── ecc-content-module
```

### Module Responsibilities

| Module               | Responsibility                 |
| -------------------- | ------------------------------ |
| ecc-bootstrap        | Application Startup            |
| ecc-common           | Shared Components              |
| ecc-identity-module  | Authentication & Authorization |
| ecc-session-module   | Chat Rooms & Sessions          |
| ecc-community-module | Forum, Friends, Gamification   |
| ecc-content-module   | Events, Notifications, Rewards |

---

# 💬 Chat Architecture

```text
                              WebSocket
                                  │
                                  ▼
                               Backend
                             ┌────┴────┐
                             ▼         ▼
                            Redis    MySQL
```

### Real-Time Layer

* WebSocket Messaging
* Online Presence
* Reactions
* Read Status

### Cache Layer

* Redis
* Fast Message Retrieval

### Persistence Layer

* MySQL
* Permanent Chat History

---

# ⚡ Technology Stack

## Backend

* Java 21
* Spring Boot 3
* Spring Security
* Spring Data JPA
* Spring Data Redis
* Hibernate ORM
* WebSocket
* JWT Authentication
* OAuth2
* Maven Multi Module

## Database

* MySQL 8

## Cache

* Redis 7

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Infrastructure

* Docker
* Docker Compose

---

# 🐳 Docker Deployment

```bash
docker-compose --env-file application-env.properties up -d
```

### Services

* ECC Backend
* MySQL Database
* Redis Cache

---

# 🚀 Future Improvements

* AI Speaking Evaluation
* Speech-to-Text
* Pronunciation Scoring
* Video Chat Rooms
* Mobile Application
* Recommendation System
* Microservice Migration

---

# 🎓 Academic Project

English Chat Club được xây dựng nhằm áp dụng các kiến thức:

* Software Architecture
* Spring Boot Development
* Security & Authentication
* Real-Time Communication
* Event-Driven Design
* Docker Deployment
* Database Design
* Modular Monolith Architecture

---

## ⭐ Project Highlights

✅ Modular Monolith Architecture

✅ Hexagonal Architecture

✅ JWT + Refresh Token + Redis Blacklist

✅ WebSocket Real-Time Chat

✅ RBAC Authorization

✅ Gamification System

✅ Dockerized Deployment

✅ Event-Driven Communication

---

### ❤Empowering learners to practice, connect and grow through real-time English communication❤
