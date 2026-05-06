# ByteBrain Quiz App

ByteBrain is a MERN-style quiz app with separate dashboards for quiz users and admins.

## Project Structure

- `Frontend/client` - React frontend
- `Backend` - Express and MongoDB backend

## Environment Setup

Create local env files from the examples:

```bash
cp Frontend/client/.env.example Frontend/client/.env
cp Backend/.env.example Backend/.env
```

Frontend:

```env
REACT_APP_API_URL=http://localhost:5000
```

Backend:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizDB
CLIENT_URL=http://localhost:3000
```

## Run Locally

Install and start the backend:

```bash
cd Backend
npm install
node server.js
```

Install and start the frontend:

```bash
cd Frontend/client
npm install
npm start
```
