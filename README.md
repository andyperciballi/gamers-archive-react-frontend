# 🎮 Gamers Archive

![Gamers Archive Logo](./public/Gamers-Archive-Logo.png)

## 📖 Description

Gamers Archive is a full-stack MERN application that allows users to discover, save, and manage their favorite video games.  

The application integrates with the IGDB API to fetch game data and allows authenticated users to create, update, and delete personalized game entries.

Users can:
- Sign up / Sign in securely using JWT authentication
- Browse game data powered by IGDB
- Create and manage personal game collections
- Perform full CRUD operations on their saved games
- Edit only the content they created

This project was built as a group MERN Stack CRUD application to demonstrate full-stack development skills including authentication, authorization, RESTful routing, and secure API integration.

---

## 🚀 Getting Started

### 🔗 Deployed Application
[Live App Link Here]

### 📋 Planning Materials
[Trello Board / Miro Board / ERD / Wireframes Link Here]

### 🛠 Back-End Repository
[Link to Back-End GitHub Repo Here]

---

## 🧱 Technologies Used

### Front-End
- React
- React Router
- JavaScript (ES6+)
- CSS (Flexbox / Grid)
- Axios (or Fetch API)

### Back-End
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt

### External API
- IGDB API (accessed securely via back-end)

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Secure sign up, sign in, sign out functionality
- Protected routes on front-end and back-end
- Only the creator of a resource can edit or delete it
- Guests cannot create, update, or delete data

---

## 🗂 Entity Relationship Overview

- **User**
- **Game**
- **(Second Entity – e.g., Review / Collection / Comment)**

At least one entity maintains a relationship with the User model.

(Insert ERD image here if desired)

---

## 🎨 UI/UX Features

- Consistent visual theme and color palette
- Responsive layout using Flexbox/Grid
- WCAG AA color contrast compliance
- Styled buttons throughout
- Forms are pre-filled when editing data
- Navigation via links (no manual URL typing required)
- All images include alt text

---

## 📸 Screenshots

### Home Page
![Home Screenshot](./public/home.png)

### Dashboard
![Dashboard Screenshot](./public/dashboard.png)

---

## 🙏 Attributions

- [IGDB API](https://api-docs.igdb.com/)
- Any icon libraries (e.g., Font Awesome)
- Any UI inspiration or assets used

(If none required, you may remove this section.)

---

## 🔮 Next Steps (Stretch Goals)

- Add user profile customization
- Add game rating system
- Add sorting and filtering functionality
- Add pagination or infinite scroll
- Improve search functionality
- Add social features (friends, sharing lists)
- Add dark mode

---

## 👥 Contributors

- Name 1
- Name 2
- Name 3

---

## 📦 Repositories

Front-End Repo: [Link Here]  
Back-End Repo: [Link Here]
