# Al-Quran Web Application

A premium web application to search, read, and track reading progress of the Holy Quran, inspired by Quran.com.

## Tech Stack
* **Frontend**: React (Vite), Zustand (Global State & LocalStorage Persistence), Vanilla CSS.
* **Backend**: Node.js, Express.js.
* **Database**: MySQL (local database `AlQuran` with table `quran`).

---

## Getting Started

### Prerequisites
1. **Node.js**: Version 18+ is recommended.
2. **MySQL Server**: Ensure your local MySQL server is running.
   * Host: `localhost` (or `127.0.0.1`)
   * Database: `AlQuran`
   * Table name: `quran`

---

### Step 1: Backend Setup
1. Open your terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Verify your database settings in the `.env` file:
   * Open `server/.env` and update `DB_USER` and `DB_PASSWORD` if they differ from:
     ```env
     PORT=5000
     DB_HOST=127.0.0.1
     DB_USER=dev
     DB_PASSWORD=test111
     DB_NAME=AlQuran
     ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on [http://localhost:5000](http://localhost:5000).*

---

### Step 2: Frontend Setup
1. In a new terminal window, navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on [http://localhost:3000](http://localhost:3000).*

---

## Key Features & Folder Structure

### Key Features
1. **Interactive Settings Drawer**: Adjust Arabic and translation text sizes dynamically using slider controls, and toggle translations.
2. **Dual-Theme Support**: Light & dark modes styled premium to match Quran.com screenshots.
3. **Scroll-based Progress Tracking**: Automatically updates your last read position in the background using an `IntersectionObserver` and saves it to the browser's `localStorage`.
4. **Instant Resumption**: Home page features a resume banner that links to the exact verse where you left.
5. **Robust Substring Search**: Easily search across Urdu and English translations or Surah names.

### Directories Tree
* `client/`
  * `src/store/useQuranStore.js` - Zustand store (theme, font sizes, translations, history).
  * `src/components/atoms/` - Primitive inputs (`Badge`, `Button`, `Toggle`, `Slider`).
  * `src/components/molecules/` - Grouped UI elements (`SearchBar`, `VerseCard`, `HistoryCard`).
  * `src/components/organisms/` - High-level modules (`SettingsDrawer`, `SurahList`).
  * `src/pages/` - Core views (`Home.jsx`, `Reader.jsx`).
* `server/`
  * `config/db.js` - MySQL pool connections.
  * `controllers/quran.controller.js` - Database query logic.
  * `routes/quran.routes.js` - Endpoint routers.
