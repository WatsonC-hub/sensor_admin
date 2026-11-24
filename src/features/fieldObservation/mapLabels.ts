import L from 'leaflet';

/** A feltobservation's map label, to the right of its badge. */
export type MapLabel = {id: string; latlng: L.LatLng; text: string; offsetX: number};

/**
 * Map labels as tooltips, but only for the feltobservationer in view and only from `minZoom`.
 * Leaflet moves every tooltip on each frame of a zoom, so labels that exist but are hidden still
 * make zooming slow with many feltobservationer.
 */
export const createMapLabels = (map: L.Map, minZoom: number) => {
  let labels: MapLabel[] = [];
  let excluded: string | null = null;
  const shown = new Map<string, L.Tooltip>();

  const update = () => {
    const area = map.getZoom() >= minZoom ? map.getBounds().pad(0.2) : null;
    const wanted = new Map<string, MapLabel>();
    if (area) {
      for (const label of labels) {
        if (label.id !== excluded && area.contains(label.latlng)) wanted.set(label.id, label);
      }
    }
    for (const [id, tooltip] of shown) {
      if (wanted.has(id)) continue;
      tooltip.remove();
      shown.delete(id);
    }
    for (const [id, label] of wanted) {
      if (shown.has(id)) continue;
      // As text, not HTML: the label is a typefelt value someone typed.
      const content = document.createElement('span');
      content.textContent = label.text;
      const tooltip = L.tooltip({
        permanent: true,
        direction: 'right',
        offset: [label.offsetX, 0],
        className: 'fo-label',
        interactive: false,
      })
        .setLatLng(label.latlng)
        .setContent(content)
        .addTo(map);
      shown.set(id, tooltip);
    }
  };

  const clear = () => {
    shown.forEach((tooltip) => tooltip.remove());
    shown.clear();
  };

  // moveend also fires after a zoom.
  map.on('moveend', update);

  return {
    /** Replace all labels (after the feltobservationer are drawn again). */
    set: (next: MapLabel[]) => {
      labels = next;
      clear();
      update();
    },
    /** Hide one feltobservation's label, e.g. while it is edited; null shows it again. */
    exclude: (id: string | null) => {
      excluded = id;
      update();
    },
    remove: () => {
      map.off('moveend', update);
      clear();
    },
  };
};
