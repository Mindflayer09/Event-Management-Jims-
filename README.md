# 📅 PlannEx - Event Management Platform

A comprehensive, full-stack **MERN application** engineered to streamline operations for university and college organizations.  
PlannEx manages the entire event lifecycle—from **pre-event task delegation** to **post-event public reports**—featuring role-based dashboards, **passwordless authentication**, automated email notifications, and AI-generated event summaries.

---

## ✨ Key Features

- 🔐 **Passwordless Authentication**  
  Secure and frictionless login using **Email OTP (One-Time Password)** verification

- 🛡️ **Role-Based Access Control (RBAC)**  
  Dedicated workflows and dashboards for:
  - Organization Admins  
  - Sub-Admins  
  - Volunteers  

- ✅ **Approval Workflows**  
  Admin-controlled access system to approve new users before granting platform access

- 📊 **Event Lifecycle Management**  
  Track events across:
  - `Pre-event`  
  - `During-event`  
  - `Post-event`  

- 📌 **Task Delegation & Tracking**  
  Assign tasks with:
  - Priority levels  
  - Deadlines  
  - Image submissions  

- 🤖 **AI-Powered Reporting**  
  Integration with **Google Gemini AI** to generate structured, Markdown-based event reports

- 🌍 **Public Event Gallery**  
  Public portal to showcase finalized reports and media galleries

- 📧 **Automated Email Notifications**  
  Real-time alerts using **Twilio SendGrid** for:
  - OTP verification  
  - Account approvals  
  - Task assignments  
  - Event updates  

- ☁️ **Cloud Media Storage**  
  Optimized image storage via **Cloudinary**

---

## 🛠️ Tech Stack

### 💻 Frontend
- React (Vite)
- Tailwind CSS v4
- React Router DOM
- React Hook Form + Zod (Validation)
- Lucide React (Icons)
- React Markdown + Tailwind Typography

---

### ⚙️ Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Twilio SendGrid API
- Google Generative AI (Gemini 1.5 Flash)
- Cloudinary & Multer

---

## 🚀 Getting Started

### 📌 Prerequisites

Make sure you have installed:

- Node.js  
- Git  
- MongoDB (Atlas recommended)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mindflayer09/PlannEx-EMS.git
cd PlannEx-EMS

