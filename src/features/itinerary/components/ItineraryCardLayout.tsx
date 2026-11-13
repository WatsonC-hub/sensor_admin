import {Box, Card, Link, Typography} from '@mui/material';
import React from 'react';

import type {ReactNode} from 'react';

type Props = {
  name: string;
  selected: boolean;
  /** Background of the header bar. */
  headerColor: string;
  /** Opens the tur in the turvindue. */
  onOpen: () => void;
  /** Under the name: the ansvarlig. */
  subtitle: ReactNode;
  /** Right side of the header: dates and actions. */
  headerRight: ReactNode;
  /** Below the header. */
  children: ReactNode;
  /** Opens the tur when anywhere on the card is clicked. */
  clickable?: boolean;
  /** Wraps the card's content, e.g. to make it a drop target. Defaults to a plain box. */
  frame?: (content: ReactNode) => ReactNode;
};

const PlainFrame = ({children}: {children: ReactNode}) => (
  <Box sx={{borderRadius: 2, boxShadow: 8}}>{children}</Box>
);

/**
 * The layout of a turkort, shared by the active list and the Turhistorik: a coloured
 * header with the name and ansvarlig on the left and dates/actions on the right, then a
 * body. What goes in each slot (editable or read-only) is up to the card.
 */
const ItineraryCardLayout = ({
  name,
  selected,
  headerColor,
  onOpen,
  subtitle,
  headerRight,
  children,
  clickable = false,
  frame,
}: Props) => {
  const content = (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <Box
        sx={{
          color: 'white',
          bgcolor: headerColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          // Same left edge as the body (p: 1) for the name, the ansvarlig and the body.
          py: 0.5,
          px: 1,
        }}
      >
        <Box
          sx={{display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, maxWidth: '70%'}}
        >
          <Typography sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            <Link
              sx={{cursor: 'pointer', textDecorationColor: 'rgba(255, 255, 255, 0.5)'}}
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              underline="always"
              color="inherit"
            >
              {name || 'Unavngiven tur'}
            </Link>
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0}}>{subtitle}</Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {headerRight}
        </Box>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, p: 1}}>{children}</Box>
    </Box>
  );

  return (
    <Card
      onClick={clickable ? onOpen : undefined}
      sx={{
        // A Card has overflow: hidden, so in a flex column it would shrink to nothing
        // instead of letting the list scroll.
        flexShrink: 0,
        mx: 1,
        borderRadius: 2.5,
        cursor: clickable ? 'pointer' : undefined,
        outlineWidth: '2px',
        outlineStyle: 'solid',
        outlineColor: selected ? `oklch(70.8% 0.243 264.376)` : 'transparent',
      }}
    >
      {frame ? frame(content) : <PlainFrame>{content}</PlainFrame>}
    </Card>
  );
};

export default ItineraryCardLayout;
