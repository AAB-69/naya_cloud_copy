# Nayatel Cloud - Full-Stack Authentication System

Built with **React (Vite)** on the frontend and **Django REST Framework (DRF)** on the backend.

---

## 🚀 Quick Start (Running the Project)

You can start both servers easily:

### Option 1: Double-Click the Launcher Scripts
1. Double-click `start_backend.bat` to launch the Django API server at `http://127.0.0.1:8000/`.
2. Double-click `start_frontend.bat` to launch the React frontend at `http://127.0.0.1:5173/`.

### Option 2: Running via Terminal / Command Prompt

**1. Start the Django REST Backend:**
```powershell
# In the project root (naya_cloud):
.\env\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```

**2. Start the React Frontend:**
```powershell
# In a second terminal:
cd frontend
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser.

---

## 🔑 Pre-Configured Demo Accounts

You can log in immediately using:
- **Username:** `demo_user`  | **Password:** `demo1234`
- **Username:** `admin`      | **Password:** `admin123`

Or click **"Create account"** to register a new user!

---

## 🎓 Beginner's Guide: How This REST API Works

As an intern, you may be asked to explain how the frontend and backend talk to each other. Here is what happens under the hood:

```
[ React Browser UI ] 
        │
        │ 1. User enters username & password, clicks "Login"
        │ 2. JavaScript sends an HTTP POST request with JSON body
        ▼
[ Django REST Framework (Port 8000) ]
        │
        │ 3. LoginSerializer validates credentials in SQLite database
        │ 4. Generates an Authentication Token (e.g., '6631c7a057dc...')
        │ 5. Returns HTTP 200 OK with { "token": "...", "user": { ... } }
        ▼
[ React Browser UI ]
        │
        │ 6. React saves token in localStorage ('nayatel_token')
        │ 7. Redirects user to the Cloud Console Dashboard
        │ 8. For subsequent requests, attaches header:
        │    Authorization: Token 6631c7a057dc...
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Authenticates user; returns auth token | No (Public) |
| `POST` | `/api/auth/register/` | Registers new user; returns auth token | No (Public) |
| `GET` | `/api/auth/user/` | Returns current user profile details | **Yes** (`Token <key>`) |
| `POST` | `/api/auth/logout/` | Invalidates current token on server | **Yes** (`Token <key>`) |
| `POST` | `/api/auth/forgot-password/` | Simulates password reset link dispatch | No (Public) |

---

## 🧪 Testing with Postman

Since you have **Postman** installed on your desktop, you can test the APIs directly:

1. **Test Login:**
   - Method: `POST`
   - URL: `http://127.0.0.1:8000/api/auth/login/`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "demo_user",
       "password": "demo1234"
     }
     ```
   - Hit **Send**. You will receive your token key and user details.

2. **Test Protected User Profile:**
   - Method: `GET`
   - URL: `http://127.0.0.1:8000/api/auth/user/`
   - Headers:
     - `Authorization`: `Token <paste_your_token_here>`
   - Hit **Send**. You will see your user data returned directly from Django!
