ENCORE - IMY 220 Project - Deliverable 2
=============================================
Livia Ami Webber u24607852 

-------------------------------------------------
GitHub repository: https://github.com/livi-ami/IMY-220-Project.git

MongoDB connection string (Atlas): mongodb+srv://<db_username>:<db_password>@encore.usf9v2s.mongodb.net/?appName=Encore

Database name: encore

Structure
---------
frontend/   Vite + React app
backend/    Express API + MongoDB (db/ = one file of CRUD functions per collection,
            routes/ = Express routes, middleware/, utils/, seed/, tests/)
API.md      Every API route, with request/response notes (handy for Postman)

-------------------------------------------------
DATABASE SETUP
-------------------------------------------------
MongoDB Atlas
pAswordd123
-------------------------------------------------
RUNNING WITH DOCKER
-------------------------------------------------
Run from the project root

1) Backend (http://localhost:5000)

   cd backend
   docker build -t encore-backend .
   docker run -p 5000:5000 --env-file .env --name encore-backend encore-backend

2) Frontend (http://localhost:5173) - second terminal

   cd frontend
   docker build -t encore-frontend .
   docker run -p 5173:5173 --name encore-frontend encore-frontend

Clean up:
   docker stop encore-frontend encore-backend
   docker rm encore-frontend encore-backend

-------------------------------------------------
USING THE APP
-------------------------------------------------
Open http://localhost:5173 and log in with a sample account
   concertkid@encore.test / Password123
   admin@encore.test / Admin1234
or register a new one

The frontend finds the API at http://localhost:5000

-------------------------------------------------