# Single page: map background with feature windows

The app used to have two separate pages, Field and Admin. We merged them into one page so that users can see and work with everything without switching pages. The page is a map background with windows on top, and each feature (location, station, trips, task lists, QA, …) lives in a window.

## Consequences

- Navigation changes app state, not the URL. Selecting a location, station or borehole updates the shared display state, and that state decides which windows are shown. The router only covers entry points: the home page, the create-station flow and the QR-scan landing.
- New features are added as windows, not as routes.
- The `src/pages/admin` and `src/pages/field` folders keep the old structure and still hold code that is in use. They are legacy, not a boundary to follow. New code goes in `src/features/`.
