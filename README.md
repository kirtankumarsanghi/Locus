# 🚀 LOCUS

### AI-Powered Smart Library & Study Space Management Platform

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge\&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge\&logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge\&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-black?style=for-the-badge\&logo=socket.io)

### 🎯 *"Your Seat. Not Your Bag's."*

Transforming traditional libraries into intelligent, real-time study ecosystems with AI-powered recommendations, live desk tracking, gamification, analytics, and seamless room booking.

---

### 🌟 Live Capabilities

⚡ Real-Time Desk Tracking
🤖 AI Smart Seat Recommendations
🏆 Achievement & Gamification System
📊 Advanced Analytics & Heatmaps
🔔 Instant Notifications
📱 Fully Responsive Design
🔐 Enterprise-Grade RBAC Security
📈 170+ Integrated Features

</div>

---

# 🎬 Overview

LOCUS is a next-generation Library Desk Management System built to solve one of the most common challenges in academic institutions:

> Students occupy study desks with bags and personal belongings while being absent for long periods, making it difficult for others to find available spaces.

LOCUS provides:

* Live desk occupancy monitoring
* Smart study space discovery
* Automated session management
* AI-powered recommendations
* Real-time synchronization
* Gamified student engagement
* Powerful administrative analytics

All powered through a modern full-stack architecture.

---

# ✨ Key Highlights

## 🤖 AI-Powered Intelligence

### Smart Seat Recommendation Engine

LOCUS analyzes:

* Previous desk usage
* Preferred study zones
* Noise preferences
* Availability patterns
* Study habits

and generates personalized desk rankings.

### Study Insights

* Learning streak tracking
* Productivity trends
* Peak study hour analysis
* Favorite location detection
* Goal progress monitoring

---

# 👨‍🎓 Student Features

## 🔑 Smart Check-In System

### 3 Check-In Methods

* ⚡ Quick Desk Selection
* 📷 QR Code Scanner
* ⌨️ Manual Desk Entry

### Session Management

* Live study timer
* Temporary Away Mode
* Return Session Recovery
* Manual Checkout
* Auto Session Expiry
* Status Indicators

---

## 📊 Personal Dashboard

### Study Statistics

* Total Study Hours
* Weekly Study Hours
* Active Session Tracking
* Recent Session History
* Desk Availability Overview

### Goals & Streaks

* Daily Goals
* Weekly Goals
* Monthly Goals
* Consecutive Study Day Streaks

---

## 🏆 Achievement System

Unlock achievements as you study:

| Achievement           | Description           |
| --------------------- | --------------------- |
| 🌅 Early Bird         | Check-in before 8 AM  |
| 🔥 Consistent Learner | 7-Day Streak          |
| 🏃 Marathon Session   | Study 4+ Hours        |
| 🏛 Room Master        | Use Every Room        |
| 🌙 Night Owl          | Study After 8 PM      |
| 💯 Century Club       | Complete 100 Sessions |

---

## 🔍 Smart Seat Finder

Find the perfect study space using:

* Live Availability
* Zone Filters
* Floor Filters
* Room Filters
* Search by Desk
* Instant Check-In

---

## 📅 Room Booking

Students can:

* Browse Rooms
* Reserve Time Slots
* Track Approval Status
* Cancel Bookings
* View Capacity Details
* Check Noise Levels

---

# 👨‍💼 Staff Features

## 🗺 Interactive Library Map

Real-time visual floor map with:

🟢 Available Desks

🔴 Occupied Desks

🟡 Away Desks

🟣 Abandoned Desks

Features:

* Pan & Zoom
* Live Updates
* Session Timers
* Desk Inspection
* Status Monitoring

---

## 🚨 Desk Operations

Staff can:

* Reset Desks
* End Sessions
* Flag Issues
* Manage Occupancy
* Review Alerts

---

## 📊 Operational Analytics

### Live Metrics

* Occupancy Rate
* Active Sessions
* Available Desks
* Abandoned Desks

### Visual Reports

* Pie Charts
* Bar Charts
* Line Charts
* Usage Trends

---

# 🔧 Admin Features

## 👥 User Management

### Complete User Lifecycle

* Create Users
* Edit Users
* Delete Users
* Suspend Accounts
* Activate Accounts
* Role Assignment

Supported Roles:

* Student
* Staff
* Administrator

---

## 🪑 Desk Management

* Create Desks
* Assign Rooms
* Monitor Status
* Remove Desks
* Handle Active Sessions

---

## 🏢 Room Management

* Create Rooms
* Configure Capacity
* Set Noise Levels
* Assign Zones
* Remove Rooms

---

## 📈 Enterprise Analytics

### System Reports

* User Statistics
* Session Statistics
* Room Utilization
* Occupancy Trends
* Department Usage
* Peak Hour Heatmaps

---

## 📤 Export Center

Generate reports in:

* CSV
* Excel
* JSON
* PDF (Planned)

---

# 🔔 Real-Time Notification System

Supported Notification Types:

* SESSION_STARTED
* AWAY_WARNING
* SESSION_EXPIRED
* BOOKING_REMINDER
* ABANDONED_DESK
* NEW_BOOKING
* SYSTEM_ALERT

Features:

* Instant Delivery
* Browser Notifications
* Unread Counters
* Priority Levels
* Notification History

---

# ⚡ Real-Time Architecture

Powered by Socket.IO

### Live Events

* desk:updated
* session:checkin
* session:away
* session:back
* session:checkout
* session:expired
* notification:new
* analytics:updated
* admin:user_updated

### Benefits

* Sub-second Updates
* Auto Reconnection
* Offline Recovery
* Zero Manual Refresh

---

# 📊 Analytics Engine

## Visualizations

* Daily Study Trends
* Weekly Study Trends
* Monthly Study Trends
* Occupancy Distribution
* Usage Heatmaps
* Goal Progress Charts

### Student Analytics

* Favorite Desk
* Favorite Room
* Total Hours
* Session History
* Study Streaks

---

# 🔐 Security

LOCUS includes enterprise-grade security features:

✅ Role-Based Access Control

✅ Protected Routes

✅ Session Persistence

✅ Input Validation

✅ SQL Injection Protection

✅ User Status Verification

✅ Type-Safe Backend

✅ Error Boundaries

---

# 🎨 User Experience

### Modern UI Features

* Material Design 3
* Responsive Layout
* Mobile Navigation
* Desktop Sidebar
* Skeleton Loading
* Smooth Animations
* Accessibility Support
* High Contrast Compatibility

---

# 🏗 System Architecture

```text
┌─────────────────────┐
│      React App      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Socket.IO Layer   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Express API Server  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SQLite Database     │
└─────────────────────┘
```

---

# 🛠 Tech Stack

## Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Socket.IO Client

## Backend

* Node.js
* Express
* TypeScript
* Socket.IO
* SQLite
* ExcelJS

## Database

* SQLite3
* WAL Mode
* Indexed Queries
* Foreign Key Constraints

---

# 📈 Project Statistics

| Metric             | Count |
| ------------------ | ----- |
| Student Features   | 40+   |
| Staff Features     | 25+   |
| Admin Features     | 50+   |
| API Endpoints      | 60+   |
| Real-Time Events   | 13    |
| Database Tables    | 8     |
| Notification Types | 7     |
| User Roles         | 3     |
| Export Formats     | 4     |
| Chart Types        | 10+   |
| Total Features     | 170+  |

---

# 🚀 Unique Innovations

### What Makes LOCUS Different?

✅ AI Recommendation Engine

✅ Achievement System

✅ Study Streak Tracking

✅ Heatmap Analytics

✅ Multi-Method Check-In

✅ Smart Session State Machine

✅ Real-Time Synchronization

✅ Notification Broadcasting

✅ Bulk Operations

✅ Time-Travel Analytics

✅ PWA Ready

✅ Connection Resilience

---

# 🌍 Future Roadmap

* AI Study Partner
* Mobile App
* Predictive Occupancy Forecasting
* Smart Library IoT Integration
* QR Attendance Analytics
* Campus-Wide Space Management

---

<div align="center">

## ⭐ If you like LOCUS, give it a star!

Built with ❤️ for students, libraries, and academic institutions.

### LOCUS — Smart Study Spaces. Smarter Learning.

</div>

