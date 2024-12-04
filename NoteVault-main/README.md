# NoteVault

### Project Overview

NoteVault is a full-stack application designed for creating, managing, and categorizing notes. The frontend is built using React, and the backend is powered by Django REST Framework with MongoDB for data storage.

### Features

1. User authentication (Login, Signup, Logout)
2. Create, update, delete notes
3. Categorize and organize notes
4. Pin/Unpin notes for easy access
5. Use AI to fix spelling and grammatical errors
6. Download an copy notes

### Technologies Used

Frontend:

1. React.js (with React Router for navigation)
2. TailwindCSS (for styling)

Backend:

1. Django
2. Django REST Framework
3. MongoDB (via Djongo)

### Setup Instructions

Clone the Repository

```
git clone https://github.com/keerthireddy2000/notevault.git
cd notevault
cd NoteVault-main

```

#### Frontend (React):

Navigate to the Frontend Directory and Install Dependencies

```
cd frontend
npm install
```

Run the Development Server

```
npm start
```

This will run the React app at http://localhost:3000.

#### Backend (Django):

Navigate to the Backend Directory

```
cd ../notevaultBackend
```

Install Python Dependencies

```
pip install -r requirements.txt
```

Set Up the Environment Variables

```
DATABASE_URL=mongodb+srv://<your_mongodb_cluster>
API_KEY=<your_genai_api_key>
```

Run Database Migrations

```
python manage.py makemigrations
python manage.py migrate
```

Start the Django Development Server

```
python manage.py runserver
```

This will run the backend server at http://localhost:8000.

### Deployment on EC2:

#### Frontend

Build the source code for production

```
npm run build
```
Clone github repository on EC2 instance and navigate to the frontend build directory

```
cd notevault/NoteVault-main/frontend/build
```

Run the Application Using PM2

```
pm2 start http-server -p 8080
```

#### Backend

```
Clone github repository on EC2 instance and navigate to the notevaultBackend directory

```
cd notevault/NoteVault-main/notevaultBackend
```

Create and activate virtual environment

```
pip install virtualenv
virtualenv venv
source venv/bin/activate
```

Install Backend Dependencies

```
pip install -r requirements.txt
```

Configure Gunicorn and PM2 for Production

```
pm2 start "gunicorn --workers 3 --bind 0.0.0.0:8000 notevaultBackend.wsgi:application" --name django-app
```


#### Deployment Link

 http://52.7.128.221:8080/



