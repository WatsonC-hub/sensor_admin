import {useAtomValue} from 'jotai';
import React, {useMemo} from 'react';

import {useItinerariesLinks} from '~/features/itinerary/api/useItinerary';
import {locationsOnTur} from '~/features/itinerary/helpers';
import {ItineraryColors} from '~/features/notifications/consts';
import {highlightedItinerariesAtom} from '~/state/atoms';

/**
 * Colours the map markers of the highlighted ture. Renders a <style> element, so React only
 * touches the DOM when the CSS text actually changes.
 */
const ItineraryHighlighter = () => {
  const highlightedItineraries = useAtomValue(highlightedItinerariesAtom);
  const linksPerItinerary = useItinerariesLinks(highlightedItineraries);

  const css = useMemo(() => {
    // Besøgte lokationer are no longer on the tur in the map data, so they are matched by
    // loc_id and drawn dimmed. These rules come first, so a lokation that is active on a
    // highlighted tur gets that tur's full colour.
    const visitedRules = highlightedItineraries.map((_, index) => {
      const selectors = locationsOnTur(linksPerItinerary[index] ?? [])
        .filter((location) => location.besoegt)
        .map((location) => `svg[data-loc-id~="${location.loc_id}"] circle`);
      return selectors.length > 0
        ? `${selectors.join(',\n')} {fill: ${ItineraryColors[index]}; fill-opacity: 0.35;}`
        : '';
    });

    const activeRules = highlightedItineraries.map(
      (itinerary, index) =>
        `svg[data-itinerary-id="${itinerary}"] circle {fill: ${ItineraryColors[index]}; fill-opacity: 1;}`
    );

    return [...visitedRules, ...activeRules].filter(Boolean).join('\n');
  }, [highlightedItineraries, linksPerItinerary]);

  return css ? <style>{css}</style> : null;
};

export default ItineraryHighlighter;
