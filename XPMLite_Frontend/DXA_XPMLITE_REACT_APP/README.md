# XPM Lite React App Setup and Usage Guide for Dyndle Website

## Prerequisites

Before starting, ensure you have:

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js)

Verify the installation:

```bash
node -v
npm -v
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/RWS-Open/tridion-sites-xpmlite-dyndle
```

Navigate to the project folder:

```bash
cd <project-folder>
```

---


## 2. Configuration

- Update Configuration values in index.html

- Update site url in .env file

## 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

---

## 3. Start the Development Server

Using npm:

```bash
npm start
```

Or (for Vite projects):

```bash
npm run dev
```

Using Yarn:

```bash
yarn start
```

Or:

```bash
yarn dev
```

---

## 4. Open the Application

After the server starts, open your browser and navigate to:

```
http://localhost:3000
```

---

## 5. Make Changes

- Edit the source files inside the `src/` directory.
- The application automatically reloads when changes are saved.

---


## 6. Build for Production

Using npm:

```bash
npm run build
```

Using Yarn:

```bash
yarn build
```

The production-ready files will be generated in the `dist/` (Vite) directory.

---

---

## Common Scripts

| Command | Description |
|----------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create a production build |

---

## Troubleshooting

### Port Already in Use

If the default port is occupied, stop the conflicting process or run the application on a different port.

### Dependencies Not Installed

Delete `node_modules` and the lock file, then reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear npm Cache

```bash
npm cache clean --force
```

Then reinstall dependencies:

```bash
npm install
```