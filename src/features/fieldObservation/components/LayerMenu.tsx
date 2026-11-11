import LayersIcon from '@mui/icons-material/Layers';
import {
  Alert,
  Badge,
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
} from '@mui/material';
import {useAtom} from 'jotai';
import React, {useMemo, useState} from 'react';

import {useGisLayers} from '~/features/fieldObservation/api/useGisLayers';
import {BACKGROUND_MAPS, useOrtofotoYears} from '~/features/fieldObservation/backgroundMaps';
import {
  activeGisLayersAtom,
  backgroundMapAtom,
  ortofotoYearAtom,
} from '~/features/fieldObservation/state';

import type {GisLayer} from '~/features/fieldObservation/api/useGisLayers';
import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';

const NO_GROUP = 'Andre lag';

const BackgroundTab = () => {
  const [background, setBackground] = useAtom(backgroundMapAtom);
  const [year, setYear] = useAtom(ortofotoYearAtom);
  const {data: years, isPending, isError} = useOrtofotoYears(background === 'ortofoto');

  return (
    <Box sx={{px: 2, py: 1}}>
      <RadioGroup
        value={background}
        onChange={(event) => setBackground(event.target.value as BackgroundMapId)}
      >
        {BACKGROUND_MAPS.map((map) => (
          <FormControlLabel key={map.id} value={map.id} control={<Radio />} label={map.title} />
        ))}
      </RadioGroup>
      {background === 'ortofoto' && (
        <Box sx={{pl: 4, pt: 1}}>
          {isPending && <CircularProgress size={20} />}
          {isError && <Alert severity="warning">Kunne ikke hente årgangene.</Alert>}
          {years && years.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel id="ortofoto-year">Årgang</InputLabel>
              <Select
                labelId="ortofoto-year"
                label="Årgang"
                value={year ?? years[0]}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {years.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}
    </Box>
  );
};

const GisLayersTab = () => {
  const [active, setActive] = useAtom(activeGisLayersAtom);
  const {data: layers, isPending, isError} = useGisLayers();

  const groups = useMemo(() => {
    const byGroup = new Map<string, GisLayer[]>();
    for (const layer of layers ?? []) {
      const group = layer.group || NO_GROUP;
      byGroup.set(group, [...(byGroup.get(group) ?? []), layer]);
    }
    return [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'da'))
      .map(([group, items]) => ({
        group,
        items: items.sort((a, b) => a.title.localeCompare(b.title, 'da')),
      }));
  }, [layers]);

  const toggle = (id: string) =>
    setActive((current) =>
      current.includes(id) ? current.filter((layerId) => layerId !== id) : [...current, id]
    );

  return (
    <>
      {isPending && <CircularProgress size={24} sx={{m: 2}} />}
      {isError && (
        <Alert severity="warning" sx={{m: 2}}>
          Kunne ikke hente lagene fra Explorer.
        </Alert>
      )}
      <List dense>
        {groups.map(({group, items}) => (
          <li key={group}>
            <ul style={{padding: 0}}>
              <ListSubheader>{group}</ListSubheader>
              {items.map((layer) => (
                <ListItemButton key={layer.id} onClick={() => toggle(layer.id)}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <Checkbox
                      edge="start"
                      size="small"
                      checked={active.includes(layer.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={layer.title} />
                </ListItemButton>
              ))}
            </ul>
          </li>
        ))}
      </List>
    </>
  );
};

/** Background maps and Explorer's GIS layers, in two tabs as in Explorer's layer panel. */
const LayerMenu = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<'baggrund' | 'gis'>('baggrund');
  const [active] = useAtom(activeGisLayersAtom);

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Kortlag"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Badge badgeContent={active.length} color="secondary" invisible={active.length === 0}>
          <LayersIcon />
        </Badge>
      </IconButton>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          paper: {sx: {width: 320, maxWidth: 'calc(100vw - 32px)', maxHeight: '70vh'}},
        }}
      >
        <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="fullWidth">
          <Tab value="baggrund" label="Baggrund" />
          <Tab value="gis" label="GIS-lag" />
        </Tabs>
        {tab === 'baggrund' ? <BackgroundTab /> : <GisLayersTab />}
      </Popover>
    </>
  );
};

export default LayerMenu;
