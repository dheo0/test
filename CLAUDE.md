# CLAUDE.md — AI Assistant Guide for photomon-print

This file provides context for AI assistants (Claude, Copilot, etc.) working on this codebase.

---

## Project Overview

**photomon-print** is a React-based photo printing web application for the Photomon service (`https://www.photomon.com`). It allows users to:

- Upload photos from a local device or from the Smartbox cloud storage service
- Arrange and edit photos in a print layout
- Crop, rotate, and apply print options to individual photos
- Submit completed photo print orders

The app is embedded inside a parent page via a single bundled JS file (`photomon_photoprint_app.js`) and communicates with the Photomon backend API.

---

## Node & Tooling Requirements

- **Node**: v14.17.0 (pinned in `.nvmrc` — use `nvm use` before working)
- **Package Manager**: npm
- **Global tools required for builds**: `sass`, `webpack-cli`

---

## Common Commands

```bash
# Start development server
npm run start

# Start with Smartbox environment
npm run smartbox

# Run tests
npm test

# Production build
npm run build          # uses .env.production

# Development build
npm run build:dev      # uses .env.development

# Standalone build scripts (also installs global deps)
bash build_prod.sh
bash build_dev.sh
```

### Build Output

The build process runs in two stages:
1. `react-scripts build` compiles the React app into `build/`
2. `webpack --config webpack.config.js` bundles everything into `photomon_photoprint_app.js`

Images from `public/images/` are copied to the output `images/` directory.

---

## Directory Structure

```
/
├── public/
│   ├── index.html          # HTML entry; defines global JS variables
│   ├── manifest.json       # PWA manifest
│   └── images/             # Static image assets (150+ files)
├── src/
│   ├── index.js            # App entry point, Redux store initialization
│   ├── App.js              # Root component, routing, device detection
│   ├── App.test.js         # Basic smoke test
│   ├── actions/            # Redux action creators
│   ├── apis/               # Axios-based API call functions
│   ├── components/         # Reusable presentational components
│   ├── containers/         # Smart components connected to Redux
│   ├── constants/          # App-wide constants
│   ├── middlewares/        # Redux middlewares
│   ├── models/             # Immutable.js Record-based data models
│   ├── reducers/           # Redux reducers (pure functions)
│   ├── sagas/              # Redux-Saga async effect handlers
│   ├── selectors/          # Reselect memoized selectors
│   ├── resources/styles/   # Global SCSS variables, mixins, and base styles
│   └── utils/              # Shared utility functions
├── webpack.config.js       # Post-build bundler configuration
├── package.json
├── .nvmrc                  # Node version lock (14.17.0)
├── .env.production         # Production env vars
├── .env.development        # Development env vars
├── .env.smartbox           # Smartbox-specific env vars
├── build_prod.sh           # Shell build script (production)
└── build_dev.sh            # Shell build script (development)
```

---

## Technology Stack

| Category | Library / Tool | Version |
|---|---|---|
| UI Framework | React | 16.8.4 |
| Routing | React Router DOM | 5.x |
| State Management | Redux | 4.x |
| Async Effects | Redux-Saga | 1.x |
| Memoized Selectors | Reselect | 4.x |
| Immutable State | Immutable.js | 4.x |
| HTTP Client | Axios | 0.18 |
| Styling | SCSS + styled-components | — |
| Date Handling | Moment.js | 2.24 |
| Utilities | Lodash | 4.17 |
| ID Generation | UUID | 3.3 |
| Number Formatting | Numeral.js | 2.0 |
| Image Cropping | react-image-crop | 8.6 |
| Device Detection | ismobilejs | 1.0 |
| Build | react-scripts (CRA) + Webpack 4 | — |

---

## Architecture & Key Patterns

### Redux Store Layout

State is divided into domain slices managed by separate reducers:

- `UIReducer` — UI state (modal visibility, active panels, etc.)
- `AppInfoReducer` — Global app configuration and metadata
- `PhotoReducer` — Uploaded photos and editing state
- `SmartboxReducer` — Smartbox cloud photo/album state
- `PrintOptionReducer` — Selected print options and sizes
- `OrderReducer` — Order submission state

### Action Lifecycle Middleware

A custom middleware (`src/middlewares/`) enables promise-based action dispatching. Actions carry:
- `uuid`: unique action identifier
- `meta.lifecycle`: `{ resolve, reject }` callbacks

This allows containers to await async Redux actions.

### Redux-Saga Patterns

Sagas handle all async side effects:

```
src/sagas/
├── index.js       # Root saga — registers all watchers
├── AppSaga.js     # App initialization
├── PhotoSaga.js   # Photo upload, edit, order submission
└── SmartboxSaga.js # Smartbox API pagination, album loading
```

Common saga patterns used:
- `takeLatest` — cancels in-flight ops when a new action arrives (search/filter)
- `takeEvery` — runs every action independently (uploads)
- Retry logic with exponential backoff
- Concurrent limit (1 for direct upload, 2 for Smartbox)

### Component Architecture

```
containers/        ← Connected to Redux, own business logic
components/        ← Presentational, receive props only
```

Major containers:
- `PhotoAppender` — Select and upload photos
- `PhotoEditor` / `PhotoEditorMobile` — Edit photo grid
- `PhotoDetailEditor` — Crop/rotate individual photo
- `PhotoOrder` — Order checkout flow
- `SmartboxUploader` — Cloud photo selection with infinite scroll

### Data Models (Immutable.js Records)

All domain data is typed using Immutable.js Records:

| Model | Description |
|---|---|
| `Photo` | Directly uploaded photo with metadata |
| `SmartboxPhoto` | Cloud photo from Smartbox |
| `SmartboxAlbum` | Album collection |
| `PrintOption` | Print configuration |
| `PrintSize` | Available size definitions |
| `ImageUpload` | Upload progress tracking |
| `ImageMeta` | Image dimensions and orientation |

Always use Immutable.js APIs (`.get()`, `.set()`, `.update()`, `.toJS()`) when working with these models.

### Selectors

Selectors in `src/selectors/` are written with `reselect` and must:
- Be pure functions with no side effects
- Use `createSelector` for any derived/computed state
- Never access `state` directly in components — always go through selectors

### API Client

`src/utils/client.js` is the single Axios instance:
- Base URL: `https://www.photomon.com`
- Timeout: 10s (production), 5s (development)
- A timestamp param is appended to all GET requests for cache busting
- All API functions live in `src/apis/`

---

## Styling Conventions

- **SCSS Modules**: Component-scoped styles in `[ComponentName].module.scss` files
- **Global SCSS**: Variables, mixins, and reset styles in `src/resources/styles/`
- **styled-components**: Used for dynamic/conditional styles
- **Mobile overrides**: Each component's SCSS includes `@media` blocks or separate `.mobile.scss` files
- Never use inline styles unless absolutely required by a third-party library

---

## Device Detection & Responsive Behavior

`App.js` detects device type at startup (via `ismobilejs`) and stores it in Redux state. Components check this flag to render either the desktop or mobile variant:

- Desktop: `PhotoEditor`
- Mobile/Tablet: `PhotoEditorMobile`
- iPad Safari has special-cased behavior in several components

Always handle both mobile and desktop paths when modifying editor components.

---

## Environment Variables

Variables are prefixed with `REACT_APP_` per CRA convention:

| Variable | Purpose |
|---|---|
| `REACT_APP_ENV` | `production` or `development` |
| `REACT_APP_USER_ID` | Default user ID for testing |
| `REACT_APP_ORDER_KEY` | Order key for test transactions |
| `REACT_APP_ORDER_TYPE` | Order type (`classic`, etc.) |

Additionally, the host HTML page injects global variables at runtime:

```javascript
window.AppUserId
window.AppOrderKey
window.AppOrderType
window.AppPFYoonMode
window.EzwelBool
```

These are read during app initialization in `src/index.js` / `App.js`.

---

## Smartbox Integration

Smartbox is a cloud photo storage service. Key details:

- Photos are fetched with **offset-based pagination**: offsets `1, 51, 101, 151, ...` (limit = 50)
- The saga (`SmartboxSaga.js`) handles pagination via `getPhotosSaga`
- The `SmartboxUploader.jsx` component renders the paginated list (currently being converted to infinite scroll)
- A `possiblyMoreItems` flag determines if more pages exist
- Albums, favorites, and tags are separate API endpoints

When modifying Smartbox pagination or infinite scroll logic, refer to `SmartboxSaga.js` and `SmartboxUploader.jsx` together.

---

## Upload Handling

- **Direct upload**: max 1 concurrent upload
- **Smartbox upload**: max 2 concurrent uploads
- Each upload retries up to 2 times on failure
- CMYK images are rejected before upload
- Large files trigger an artificial delay (file-size-based)
- Each in-flight upload is tracked by a UUID in `ImageUpload` model

---

## Modal System

Modals are rendered via `ReactDOM.createPortal` into a global modal root:
- Modals are created dynamically without being mounted in JSX
- Types: `confirm`, `message`, `order`
- The modal service in `src/utils/` exposes imperative `open()`/`close()` API

---

## Testing

- Framework: Jest (via `react-scripts test`)
- Current coverage: minimal (one smoke test in `src/App.test.js`)
- Run: `npm test`

When adding features, at minimum add a render smoke test for new containers/components.

---

## Versioning

The project uses **date-based versioning** in `package.json` (e.g., `2024.02.08.01`). Update this when making a significant release.

---

## Development Notes & Known Conventions

1. **No TypeScript** — this is a plain JavaScript project. Do not introduce TypeScript.
2. **No ESLint custom rules** — only the `react-app` preset is active. Follow React best practices.
3. **Immutable.js everywhere** — state values returned from selectors are Immutable Records or Maps. Always call `.toJS()` before passing data to third-party libraries expecting plain objects.
4. **No direct `state` access in components** — always use selectors.
5. **Sagas own all API calls** — do not call API functions directly from components or reducers.
6. **Action constants** live in `src/constants/` — always define a new constant before creating a new action.
7. **`uuid` package v3** uses named exports: `import { v4 as uuidv4 } from 'uuid'` won't work — use `import uuid from 'uuid/v4'` or check existing usage patterns.
8. **README.md is written in Korean** — do not modify it unless changing Korean documentation.
9. **No CI/CD** — deployments are manual builds using the shell scripts.
