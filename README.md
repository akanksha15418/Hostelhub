# HostelHub — Campus Peer-to-Peer Marketplace

HostelHub is a clean, student-to-student marketplace designed for hostel and college students to buy, sell, and discover academic items, hostel essentials, electronics, and snacks within their campus community.

The project is built to look like a genuine, student-made application: it uses clean cards, standard forms, and simple navigation, avoiding futuristic or overdesigned elements to remain interview-friendly.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (v4), React Router DOM, Lucide Icons, Axios.
- **Backend:** Java 17/23, Spring Boot 3.3.4, Spring Security 6, JWT Authentication, Spring Data JPA.
- **Database:** PostgreSQL.
- **Image Storage:** Cloudinary (with automatic fallback to local directory storage).

---

## Directory Structure

```
HostelHub/
├── backend/            # Spring Boot Web API
│   ├── src/            # Java backend source code
│   ├── uploads/        # Local fallback directory for user-uploaded product images
│   ├── pom.xml         # Maven dependencies configuration
│   └── mvnw.cmd        # Maven wrapper script for Windows
│
├── frontend/           # React + Vite Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, Footer, ProductCard)
│   │   ├── context/    # AuthContext for session & JWT handling
│   │   ├── pages/      # Views (Landing, Marketplace, login, register, profile, etc.)
│   │   └── services/   # Axios client and API request helper
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md           # Instructions
```

---

## Setup & Running Locally

### 1. Prerequisites
- **Java 17 or higher** (Java 23 is confirmed working)
- **Node.js 18 or higher**
- **PostgreSQL** database server

---

### 2. Database Configuration
1. Ensure your PostgreSQL server is running.
2. Create a new empty database named `hostelhub`:
   ```sql
   CREATE DATABASE hostelhub;
   ```
3. Open `backend/src/main/resources/application.properties` and verify/update the database credentials if your local database username/password are different from `postgres`/`postgres`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/hostelhub
   spring.datasource.username=postgres
   spring.datasource.password=your_postgres_password
   ```

---

### 3. Running the Backend
1. Open a terminal and navigate to the `backend` folder:
   ```cmd
   cd backend
   ```
2. Run the Spring Boot application using the Maven wrapper:
   ```cmd
   .\mvnw spring-boot:run
   ```
   *The backend server will start on `http://localhost:8080`.*

---

### 4. Running the Frontend
1. Open a second terminal window/tab and navigate to the `frontend` folder:
   ```cmd
   cd frontend
   ```
2. Run the Vite development server:
   ```cmd
   npm run dev
   ```
   *The frontend application will start on `http://localhost:5173`.*
3. Open your browser and navigate to `http://localhost:5173` to browse the app!

---

## Key Features & Logic Implemented

1. **Dual Login Identity:** Users can login using either their registered **Email** or their registered **Phone Number**.
2. **WhatsApp Contact Redirection:** Clicking "Contact Seller" automatically formats a custom WhatsApp URL assuming an Indian mobile format (automatically prepends `+91` if it is a standard 10-digit number).
3. **Smart Image Storage Fallback:** If you do not configure Cloudinary credentials in `application.properties`, the backend automatically saves product images in a local `backend/uploads` directory and serves them statically at `http://localhost:8080/uploads/`.
4. **Ownership-Aware Actions:** On the Product Details page, if the product belongs to the currently logged-in student, they will see an "Edit Listing" button instead of the "Contact Seller" button.
5. **Mark as Sold Toggle:** On the "My Listings" page, users can toggle their product availability status (`AVAILABLE` vs `SOLD`) with a single click.
