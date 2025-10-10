# Pokecat Hunt -- Frontend

This is the **frontend client** for the **Pokecat Hunt** project --- a real-time, location-based cat-catching game inspired by Pokémon GO.\
It is built with **React 19**, **Vite**, and **Leaflet**, using **Socket.IO** for live updates.

------------------------------------------------------------------------

## Overview

The frontend displays a real-time interactive map that shows wild Pokecats around the player's location.\
Players can start a session, move across the map, and catch Pokecats before they disappear.

It connects to:
- The **backend** (`apps/backend`) for real-time events (spawn, catch, expire)
- The **Go service** (`apps/services`) for REST API data (`/api/cats`)
- The **storages** (`apps/storages`) for acting as an object bucket for saving and serving Pokecat images

------------------------------------------------------------------------

## Tech Stack

-   **React 19** + **TypeScript**
-   **Vite 7** for bundling and HMR
-   **Leaflet** + **React-Leaflet** for interactive maps
-   **Socket.IO Client** for real-time updates
-   **Zustand** for state management
-   **Sass (SCSS)** for component-based styling
-   **Vitest** + **Testing Library** for unit testing

------------------------------------------------------------------------

## Folder Structure

    apps/frontend/
    ├── public/                  # Static assets
    ├── src/
    │   ├── components/          # Reusable React components
    │   ├── scenes/              # Game scenes (MapView, CatchView, etc.)
    │   ├── stores/              # Zustand stores
    │   ├── icons/               # SVG icon components
    │   ├── styles/              # Global SCSS theme
    │   ├── utils/               # Helper functions
    │   └── main.tsx             # Entry point
    ├── vite.config.ts           # Vite configuration
    ├── vitest.config.ts         # Test configuration
    ├── vitest.setup.ts          # Test setup (Testing Library, etc.)
    ├── tsconfig.app.json
    ├── Dockerfile               # Optional Docker build config
    ├── Dockerfile.dev           # Optional Docker build config (for dev)
    └── README.md                # This file

------------------------------------------------------------------------

## Available Scripts

### Development

``` bash
pnpm dev
```

Starts the Vite dev server at **http://localhost:5173**.

### Build

``` bash
pnpm build
```

Builds the production bundle to `dist/`.

### Preview

``` bash
pnpm preview
```

Serves the built frontend locally for testing.

### Lint

``` bash
pnpm lint
```

Runs ESLint on the project.

### Test

``` bash
pnpm test
```

Runs unit tests using **Vitest**.

### Test (UI Mode)

``` bash
pnpm test:ui
```

Opens **Vitest UI** to view and debug test results in real-time.

------------------------------------------------------------------------

## Testing

This project uses [Vitest](https://vitest.dev/) together with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for component testing.

Snapshot files (`__snapshots__/`) are automatically generated when using `toMatchSnapshot()` assertions,\
but they are **ignored in `.gitignore`** to avoid unnecessary version noise.

Example test:

``` tsx
import { render } from '@testing-library/react';
import WishCash from '../WishCash';

it('renders WishCash icon correctly', () => {
  const { getByLabelText } = render(<WishCash />);
  expect(getByLabelText('Wish Cash')).toBeInTheDocument();
});
```

------------------------------------------------------------------------

## Integration

  -----------------------------------------------------------------------
  Service              Purpose              Default Port
  -------------------- -------------------- -----------------------------
  Backend (Express +   Handles Pokecat      `4000`
  Socket.IO)           spawn & catch events 

  Services (Go +       Provides `/api/cats` `5000`
  MongoDB)             endpoint            

  Storages (Node.js)   Provides `/cats/{}`  `7621`
                       endpoint             

  Frontend (React +    Player client UI     `5173`
  Vite)                                     
  -----------------------------------------------------------------------

Make sure all services are running before launching the frontend.

------------------------------------------------------------------------

## Environment Variables

You can define environment variables in a `.env` file if needed:

    VITE_API_BASE_URL=http://localhost:5000
    VITE_SOCKET_URL=http://localhost:3000

------------------------------------------------------------------------

## Docker Usage

You can build and run the frontend inside Docker using the provided
`Dockerfile`.

### Build the Docker image

``` bash
docker build -t pokecat-frontend .
```

### Run the container

``` bash
docker run -it --rm -p 5173:5173 pokecat-frontend
```

The app will be available at **http://localhost:5173**.

> Note: This setup is meant for **development and preview purposes**.\
> For production deployment, consider using a multi-stage build to serve
> the app with Nginx.

------------------------------------------------------------------------

## Styling

SCSS is organized using **BEM naming conventions** for maintainability and clarity.\
Global styles are defined in `src/styles/App.scss` and imported from `main.tsx`.

Animations and transitions (such as fade-out effects) use CSS transitions to keep performance smooth.

------------------------------------------------------------------------

## License

This sub-project inherits the main [Pokecat Hunt
License](../../LICENSE).

------------------------------------------------------------------------

## Notes

-   This frontend is part of a **monorepo** managed with **pnpm
    workspaces**.\
-   Use root commands like `pnpm dev` to start all services
    concurrently.\
-   To test or debug only the frontend, run commands from this folder.

------------------------------------------------------------------------

## Roadmap

-   Add player profile and collection UI\
-   Improve mobile responsiveness\
-   Integrate WebSocket reconnect handling\
-   Add UI tests for map interactions and modals\
-   Expand visual effects (rarity glow, capture animation)
