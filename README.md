# Star Wars Databank

A responsive Star Wars databank application that allows users to explore the film universe, manage their favorites, and authenticate securely.

## Tech Stack

**Frontend:** React, Bootstrap  
**Backend:** Flask, SQLAlchemy  
**Authentication:** JWT, Bcrypt  
**Email Services:** smtplib  
**External API:** swapi.tech  

## Installation

### Frontend
```bash
npm install
npm start
```

### Backend
```bash
pipenv install
pipenv run start
```

---

## Environment Configuration

The project requires an `.env` file for both the frontend and the backend.  
These variables are not included in the repository, as they depend on your local setup.

Here is a minimal example of what should it look like:

```env
\# Back-End Variables
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
FLASK_APP_KEY="any key works"
FLASK_APP=src/app.py
FLASK_DEBUG=1
DEBUG=TRUE

\# Front-End Variables
VITE_BASENAME=/
VITE_BACKEND_URL=your_database_url

\# JWT Flask Extended
JWT_SECRET_KEY=your_jwt_secret

\# smtplib
EMAIL_USER=your_email
EMAIL_PASS=your_email_application_password \# It's not your conventional password
SMTP_SERVER=smtp.example.com
SMTP_PORT=465
```

---

## Usage

Once both servers are running:

- The React application will start at port `http://localhost:3000`
- The Flask API will be available at its configured port `http://localhost:3001`

---

## Features

- Secure authentication system using **JWT** and **Bcrypt**
- Automated password recovery using **smtplib**
- Flask REST API integrated with **swapi.tech**
- Optimized database queries with SQLAlchemy
- Persistent user state with `localStorage` (favorites + sessions)
- Fully responsive UI built with **React** and **Bootstrap**
- Cross-device consistent UX

---

## 📁 Project Structure (Simplified)

```
src/front/     → React app (frontend)
src/api/       → Flask API with SQLAlchemy (backend)
```

---

## 🤝 Contributing

Contributions are welcome!  
Please feel free to open an issue or submit a pull request.

---

## 📄 License

MIT License (or specify your preferred license here).
