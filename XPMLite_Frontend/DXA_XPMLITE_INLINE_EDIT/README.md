# Configure and Build the XPMLITE Inline Edit App for Dyndle Webapp

## Prerequisites

Ensure the following are installed:

- Node.js (v18 or later recommended)
- npm (included with Node.js)

Verify the installation:

```bash
node -v
npm -v
```

---

## 1. Navigate to the Project

Open a terminal and navigate to the project's root directory.

```bash
cd /path/to/your/DXA_XPMLITE_INLINE_EDIT
```

Example:

```bash
cd C:\Projects\DXA_XPMLITE_INLINE_EDIT
```

or

```bash
cd ~/Projects/DXA_XPMLITE_INLINE_EDIT
```

---

## 2. Install Project Dependencies

If this is your first time using the project or the `node_modules` directory does not exist, install the project dependencies.

```bash
npm install
```

This command reads the `package.json` file and installs all required packages.

---

## 3. Make Your Changes

Modify the required source files under the `src/` directory.

---

## 4. Build the Application

Generate an optimized production build.

```bash
npm run build
```

The compiled application is generated in the `dist` directory.

Example:

```text
dist/
├── xpmlite-editor.bundle.css
├── xpmlite-editor.bundle.js
└── ...
```

> **Note:** The contents of the `dist` directory may vary depending on the project configuration.

---

## 5. Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Installs project dependencies |
| `npm run build` | Generates the production build |

---

## 6. Deploy the Build Output

After running:

```bash
npm run build
```

The production-ready assets are available in the `dist` directory.

Deploy the generated CSS and JavaScript files to the website's assets directory and update the corresponding file references in the application.

> **Note:** This application depends on the build output from the **DXA XPMLITE React App**. Ensure that the React application's generated assets are deployed to the same directory before deploying the Inline Edit application.

---

## Quick Reference

```bash
# Navigate to the project
cd /path/to/your/DXA_XPMLITE_INLINE_EDIT

# Install dependencies
npm install

# Build the application
npm run build
```