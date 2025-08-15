import {useEffect} from 'react';

interface LocationHighlighterProps {
  selectedLocId: number | string | null; // The loc_id to highlight
  color: string; // The color to use for highlighting
}

function LocationHighlighter({selectedLocId, color}: LocationHighlighterProps) {
  useEffect(() => {
    const styleId = 'dynamic-loc-style';
    let styleTag = document.getElementById(styleId);

    // Remove the old style tag if it exists
    if (styleTag) styleTag.remove();

    // Create a new style tag
    styleTag = document.createElement('style');
    styleTag.id = styleId;

    // Insert rule with the selected loc_id and a CSS variable for color
    styleTag.textContent = `
      svg[data-loc-id~="${selectedLocId}"] path.droplet {
        stroke: ${color};
        stroke-width: 2.5px;
      }
    `;

    document.head.appendChild(styleTag);

    return () => {
      // Optional cleanup
      styleTag.remove();
    };
  }, [selectedLocId, color]);

  return null; // Nothing to render
}

export default LocationHighlighter;
