import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Leaflet finds its default marker image by reading "marker-icon.png" out of leaflet.css.
// The production build renames the file with a hash, so that lookup fails and markers
// (for example Geoman's marker while placing a point) show as a broken image.
// Give Leaflet the bundled URLs directly and an empty imagePath so it skips the lookup.
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({iconRetinaUrl, iconUrl, shadowUrl});
