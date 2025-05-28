import {useEffect} from 'react';
import {useMapFilterStore} from '../store';
import {ItineraryColors} from '~/features/notifications/consts';

const ItineraryHighlighter = () => {
  const {filters} = useMapFilterStore((state) => ({
    filters: state.filters,
  }));

  useEffect(() => {
    const styleId = 'dynamic-itinerary-style';
    let styleTag = document.getElementById(styleId);

    if (styleTag) styleTag.remove();

    styleTag = document.createElement('style');
    styleTag.id = styleId;

    let rules = '';
    if (filters.itineraries.length > 0) {
      rules = filters.itineraries
        .map((itinerary, index) => {
          return `
      svg[data-itinerary-id="${itinerary.id}"] circle {
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
  }, [filters.itineraries]);
  return null; // Nothing to render
};

export default ItineraryHighlighter;
