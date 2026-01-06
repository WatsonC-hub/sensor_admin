import {useEffect} from 'react';
import {ItineraryColors} from '~/features/notifications/consts';
import {highlightedItinerariesAtom} from '~/state/atoms';
import {useAtomValue} from 'jotai';

const ItineraryHighlighter = () => {
  const highlightedItineraries = useAtomValue(highlightedItinerariesAtom);

  useEffect(() => {
    const styleId = 'dynamic-itinerary-style';
    let styleTag = document.getElementById(styleId);

    if (styleTag) styleTag.remove();

    styleTag = document.createElement('style');
    styleTag.id = styleId;

    let rules = '';
    if (highlightedItineraries && highlightedItineraries.length > 0) {
      rules = highlightedItineraries
        .map((itinerary, index) => {
          return `
      svg[data-itinerary-id="${itinerary}"] circle {
        fill: ${ItineraryColors[index]};

      }
    `;
        })
        .join('');
    }

    styleTag.textContent = rules;

    document.head.appendChild(styleTag);

    return () => {
      // Optional cleanup
      styleTag.remove();
    };
  }, [highlightedItineraries]);
  return null; // Nothing to render
};

export default ItineraryHighlighter;
