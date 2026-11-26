# TravelSphere – Travel Package Management System

A comprehensive, full-stack enterprise Travel Package Management System conforming to the project specification (*Project_spiral.pdf*, LJ Polytechnic). TravelSphere provides multi-role operations, AI itinerary synthesis, payment gateway processing, promotional coupon validation, dynamic inventory management, and complete booking audit trails.

---

## 🏛️ System Architecture & Tech Stack

TravelSphere is engineered with a modular, resilient multi-tier architecture supporting both local offline demonstration and production cloud deployment:

### 1. Frontend Client
- **Framework & Tooling:** React 19, Vite, React Router (`HashRouter` for zero-configuration static and subpath routing)
- **Styling & Aesthetics:** "Timeless Elegance" luxury design system (Warm Cream `#fbf9f5`, Brushed Copper `#a3704c`, Playfair Display & Plus Jakarta Sans typography)
- **Animation & FX:** Canvas Confetti, Framer Motion, GSAP + ScrollTrigger, Lenis smooth scrolling (WCAG 2.1 AA accessible with full `prefers-reduced-motion` compliance)
- **Document Engine:** jsPDF + autoTable for instant, verified cryptographic PDF boarding passes & vouchers with official QR codes

### 2. Backends (Dual API Architecture)
- **Primary Main API (Python Django REST Framework):**
  - Path: `django_backend/`
  - Framework: Django 6.1.3 + Django REST Framework 3.18.3 + `django-cors-headers`
  - Runs on: `http://localhost:8000/api/`
  - Features: Model serializers for all 19 entities, bcrypt credential verification, provider status gating (`PENDING`/`REJECTED` login blocking), coupon calculation engine, and full CRUD endpoints.
- **Node.js Express Server:**
  - Path: `server/server.js`, `server/db.js`
  - Framework: Express 5 + MySQL2
  - Runs on: `http://localhost:5000/api/`
  - Features: Direct WampServer / XAMPP MySQL connection (port 3306), JWT & Bcrypt authentication, PDF generation, REST routes for all entities.
- **Python Flask API:**
  - Path: `server/app.py`
  - Runs on: `http://localhost:5001/api/`
  - Provides alternative lightweight microservice endpoints for travel search and authentication with PyMySQL.

### 3. Database (19 Entities)
- **Database Engine (MySQL / XAMPP / WampServer):**
  - Database Name: `travel_db` (Port: 3306)
  - DDL Schema: `database/schema.sql` (Creates all 19 relational tables with foreign keys and cascade rules)
  - Seed Dataset: `database/seed.sql` (Comprehensive seed data with real bcrypt hashed passwords for all demo accounts)

---

## 👥 6 Supported User Roles

| Role | Default Seed Email | Password | Primary Dashboard Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@travelsphere.org` | `SphereAdmin@2026` | System analytics, account management, provider approvals/rejections, destination CRUD, package CRUD, coupons, FAQs, reviews, audit ledgers. |
| **Travel Agent** | `agent@travelsphere.org` | `SphereAgent@2026` | Tour package catalog creation, pricing, itinerary scheduling, booking confirmation/cancellation, customer inquiries. |
| **Hotel Manager** | `hotel@travelsphere.org` | `SphereHotel@2026` | Room inventory, pricing, availability control, live guest reservations confirm/cancel. |
| **Transport Provider** | `transport@travelsphere.org` | `SphereTransport@2026` | Fleet schedule management (Cars, Flights, Trains, Buses), seat availability, passenger bookings confirm/cancel. |
| **Tour Guide** | `guide@travelsphere.org` | `SphereGuide@2026` | Guide profile & rates, customer tour request accept/reject, tour completion marking, schedule calendar. |
| **Customer** | `customer@travelsphere.org` | `SphereCustomer@2026` | Destination explorer, AI custom itinerary planner, package/hotel/vehicle booking, multi-method payment checkout, coupon codes, PDF vouchers, ratings & reviews. |

---

## 📋 19 Relational Database Tables

1. `users` – Base user authentication and role management.
2. `admin` – Super admin credentials and security permissions.
3. `travel_agents` – Travel agency details and verification status.
4. `hotel_managers` – Hotel representative properties and approvals.
5. `transport_providers` – Fleet operator details and vehicle registries.
6. `tour_guides` – Certified guide profiles, languages, ratings, user links.
7. `destinations` – World destinations catalog with seasonal data.
8. `packages` – Curated tour packages, pricing, durations, categories.
9. `hotels` – Luxury hotel properties and accommodations.
10. `vehicles` – Transport fleets (Cars, SUVs, Bikes, Flights, Trains, Buses).
11. `trip_plans` – User-generated custom AI itineraries and budgets.
12. `bookings` – Master reservations linking users, packages, hotels, fleets.
13. `payments` – Real transaction records (Card, UPI, NetBanking, Wallet).
14. `coupons` – Promotional discount promo codes, usage limits, expiration.
15. `reviews` – Customer ratings and feedback testimonials.
16. `wishlist` – Saved customer favorite tours and packages.
17. `contact_messages` – Customer inquiries, grievance submissions, and replies.
18. `faqs` – System knowledge base and frequently asked questions.
19. `notifications` – Real-time customer and provider transactional alerts.

---

## 🚀 Getting Started

### 1. Frontend Development
```bash
npm install
npm run dev        # Local Vite dev server (http://localhost:5173)
npm run build      # Production build
npm test           # Execute Vitest test suite
```

### 2. Python Django REST Framework Backend
```bash
cd django_backend
python -m venv venv
venv\Scripts\activate       # On Windows
pip install -r requirements.txt
python manage.py check      # Verify configuration
python manage.py runserver  # Starts Django API on http://localhost:8000
```

### 3. Node.js Express Backend
```bash
node server/server.js       # Starts Express API on http://localhost:5000
```

### 4. Database Setup (MySQL WampServer)
1. Open WampServer and start MySQL service.
2. Open phpMyAdmin or MySQL CLI (`mysql -u root -p`).
3. Import schema and seed files:
   ```sql
   source database/schema.sql;
   source database/seed.sql;
   ```

---

## 💳 Checkout, Coupons & Voucher Workflow
1. Navigate to Tour Packages, Hotels, or Vehicles/Cars.
2. Click **Book Now** to open the unified `CheckoutModal`.
3. Choose Payment Method: Credit/Debit Card, Instant UPI QR, Net Banking, or Digital Wallet.
4. Enter promo code (e.g. `TRAVEL20` for 20% off or `EXPLORE50` for $50 off).
5. Confirm booking: Saves payment record to `payments` table, updates `coupons.used_count`, marks booking status, and issues instant downloadable PDF Boarding Voucher.

---

## 🔒 Security & Verification
- Sensitive demo passwords are never hardcoded in plaintext on the client.
- Bcrypt salted hashes stored in database.
- Service provider accounts with status `PENDING` or `REJECTED` are automatically blocked at login with HTTP 403 Forbidden until reviewed by Super Admin.
- Full responsive design verified across mobile, tablet, and desktop viewports.
