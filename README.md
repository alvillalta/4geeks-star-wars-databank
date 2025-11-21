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

### Create a .env file

---

## Environment Configuration

The project requires an `.env` file for both the frontend and the backend.  
These variables are not included in the repository, as they depend on your local setup.

Here is a minimal example of what should it look like:

```env
# Back-End Variables
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
FLASK_APP_KEY="any key works"
FLASK_APP=src/app.py
FLASK_DEBUG=1
DEBUG=TRUE

# Front-End Variables
VITE_BASENAME=/
VITE_BACKEND_URL=your_database_url

# JWT Flask Extended
JWT_SECRET_KEY=your_jwt_secret

# smtplib
EMAIL_USER=your_email
EMAIL_PASS=your_email_application_password # It's not your conventional password
SMTP_SERVER=smtp.example.com
SMTP_PORT=465
```

---

## Backend Setup & Migrations

Here's how to manage the backend API

### 1. Generate new migrations
*(Skip this step if you haven’t made changes to `./src/api/models.py`)*

```bash
pipenv run migrate
```

### 2. Apply migrations

```bash
pipenv run upgrade
```

### 3. Start the backend server

```bash
pipenv run start
```

### 4. Reset all with the newest database configuration
*(Optional)*


```bash
pipenv run reset_db
```

---


## Usage

Once both servers are running:

- The React application will start at port `http://localhost:3000`
- The Flask API will be available at its configured port `http://localhost:3001`

---

## Features

- Implemented secure authentication with **JWT** and **Bcrypt**, and **smtplib** for automated password recovery.
- Integrated a Flask REST API with third-party services (**swapi.tech**), optimizing database query performance.
- Managed persistent state and `localStorage` for user favorites and sessions.
- Developed a fully responsive interface with **React** and **Bootstrap**, ensuring consistent UX across devices.

---

## Project Structure

```
src/front/     Front-end
src/api/       Back-end
```

---

## Contributing

Contributions are welcome!  
Please feel free to open an issue or submit a pull request.

---

## License

MIT License
