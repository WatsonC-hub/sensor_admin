# Feltobservation icons

Icons for point feltobservationer on the map and in the legend. An observationstype names one in
`register.observation_type.style.icon` (e.g. `"icon": "soil"`); the name is the file name without
`.svg`. The list of valid names is `ICONS` in `src/features/fieldObservation/styles.ts`; add the
name there too.

## The standard (every icon must follow it)

- **`viewBox="0 0 24 24"`**, the Material Icons grid. Keep the shape inside about 2–22, so it isn't
  cut off in the round marker.
- **No `width` or `height`** attributes: the app sizes the icon.
- **One colour, as shape only.** The app recolours the icon with a CSS mask, so only the shape
  (alpha) matters; any fill colour in the file is ignored. Don't rely on strokes, gradients,
  opacity or several colours: draw everything as filled paths. Use `fill-rule="evenodd"` for holes.
- **Plain `<path>` elements** (plus `<svg>`). No `<style>`, `<script>`, `<image>`, `<use>`,
  `<defs>`, ids, classes, transforms or external references.
- **Small**: one or a few paths, ideally under 2 kB.
- **Local file** in this folder, named in lowercase English without spaces (`manhole.svg`).

Most icons are copied from Material Icons (Apache License 2.0), which already follow the standard.
Shapes that aren't in Material Icons (soil, manhole, borehole) are drawn by hand on the same grid.

## Why a mask and not an `<img>` or inline SVG

An `<img>` can't be recoloured, and inlining SVG markup into the page means sanitising it. A CSS
mask (`mask-image: url(icon.svg)`) uses the file's shape and paints it in any colour, and the app
never parses the file as markup. It also works offline: everything in `public` is precached by the
service worker.
