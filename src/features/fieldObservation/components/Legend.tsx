import CloseIcon from '@mui/icons-material/Close';
import LegendToggleIcon from '@mui/icons-material/LegendToggle';
import {
  Box,
  Checkbox,
  Fab,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from '@mui/material';
import {useAtom} from 'jotai';
import React, {useRef, useState} from 'react';

import {hiddenLegendAtom, hiddenProjectLayersAtom} from '~/features/fieldObservation/state';
import {
  iconMaskStyle,
  legendVariants,
  resolveStyle,
  typeKey,
  variantKey,
} from '~/features/fieldObservation/styles';

import type {LegendVariant} from '~/features/fieldObservation/styles';
import type {
  LocalObservation,
  ObservationType,
  ProjectLayer,
} from '~/features/fieldObservation/types';

type SwatchProps = {
  kind: 'POINT' | 'LINESTRING' | 'POLYGON';
  color: string;
  icon: string;
  dashArray?: string;
  fillOpacity?: number;
  /** Lines and flader of a feltobservation carry their type's badge; projektlag don't. */
  badge?: boolean;
};

/** A round badge in `color` with the icon in white, as on the map. */
const Badge = ({color, icon, size}: {color: string; icon: string; size: number}) => (
  <Box
    sx={{
      width: size,
      height: size,
      boxSizing: 'border-box',
      borderRadius: '50%',
      bgcolor: color,
      border: size < 20 ? '1px solid #fff' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: Math.round(size * 0.64),
        height: Math.round(size * 0.64),
        ...iconMaskStyle(icon, '#fff'),
      }}
    />
  </Box>
);

/** What a feature looks like on the map, small: badge with icon, line or flade. */
export const Swatch = ({
  kind,
  color,
  icon,
  dashArray,
  fillOpacity = 0.2,
  badge = true,
}: SwatchProps) => {
  if (kind === 'POINT') return <Badge color={color} icon={icon} size={22} />;
  const alpha = Math.round(Math.min(Math.max(fillOpacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  const shape =
    kind === 'LINESTRING' ? (
      <svg width="28" height="12" aria-hidden style={{display: 'block'}}>
        <line
          x1="1"
          y1="6"
          x2="27"
          y2="6"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={dashArray}
        />
      </svg>
    ) : (
      <Box
        sx={{
          width: 24,
          height: 18,
          border: 2,
          borderColor: color,
          borderStyle: dashArray ? 'dashed' : 'solid',
          bgcolor: `${color}${alpha}`,
        }}
      />
    );
  if (!badge) return shape;
  return (
    <Box sx={{position: 'relative', display: 'flex', alignItems: 'center'}}>
      {shape}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Badge color={color} icon={icon} size={14} />
      </Box>
    </Box>
  );
};

const geometryKind = (type: ObservationType): SwatchProps['kind'] => {
  const first = type.geometry_types?.[0];
  return first === 'LINESTRING' || first === 'POLYGON' ? first : 'POINT';
};

/** Whether a legend key is the type's own key or one of its variants' keys. */
const isKeyOfType = (key: string, typeId: number) =>
  key === typeKey(typeId) || key.startsWith(`${typeKey(typeId)}:`);

const DOUBLE_TAP_MS = 350;

/**
 * Click handling that tells a single tap from a double tap on the same row. We time it
 * ourselves because mobile browsers don't fire dblclick reliably. The first tap still runs
 * `onSingle`; the second runs `onDouble`, which sets the state outright.
 */
const useDoubleTap = () => {
  const last = useRef<{key: string; time: number} | null>(null);
  return (key: string, onSingle: () => void, onDouble: () => void) => {
    const now = Date.now();
    if (last.current?.key === key && now - last.current.time < DOUBLE_TAP_MS) {
      last.current = null;
      onDouble();
    } else {
      last.current = {key, time: now};
      onSingle();
    }
  };
};

type AllCheckboxProps = {
  /** How many of the group's rows are shown, out of `total`. */
  shown: number;
  total: number;
  onChange: (showAll: boolean) => void;
};

/** Tri-state checkbox in a group heading: show or hide every row in the group. */
const AllCheckbox = ({shown, total, onChange}: AllCheckboxProps) => (
  <Checkbox
    edge="start"
    size="small"
    checked={shown === total}
    indeterminate={shown > 0 && shown < total}
    onChange={() => onChange(shown < total)}
    slotProps={{input: {'aria-label': shown < total ? 'Vis alle' : 'Skjul alle'}}}
    sx={{mr: 0.5}}
  />
);

type Props = {
  /** The feltobservationer in the chosen projekt, before the legend's own filter. */
  observations: LocalObservation[];
  types: ObservationType[];
  projectLayers: ProjectLayer[];
};

/**
 * Signaturforklaring: what each type (and each style rule) looks like, with a count and a
 * checkbox to hide it, and the projekt's projektlag. Scrolls when it gets long on a phone.
 */
const Legend = ({observations, types, projectLayers}: Props) => {
  const [open, setOpen] = useState(false);
  // State, not a ref: the Popper needs the element during render.
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [hidden, setHidden] = useAtom(hiddenLegendAtom);
  const [hiddenLayers, setHiddenLayers] = useAtom(hiddenProjectLayersAtom);

  const typesById = new Map(types.map((type) => [type.id, type]));
  const counts = new Map<string, number>();
  for (const observation of observations) {
    if (observation.deleted_at) continue;
    const type = typesById.get(observation.type_id);
    const {variant} = resolveStyle(type, observation.properties);
    for (const key of [typeKey(observation.type_id), variantKey(observation.type_id, variant)]) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const shownTypes = types.filter((type) => counts.has(typeKey(type.id)));

  const toggle = (key: string) =>
    setHidden((current) =>
      current.includes(key) ? current.filter((candidate) => candidate !== key) : [...current, key]
    );
  const toggleLayer = (id: string) =>
    setHiddenLayers((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]
    );
  const tap = useDoubleTap();

  // The "all" checkboxes and double taps only change the rows in the legend now. Keys for
  // types and projektlag of other projekter stay as the user left them.
  const withoutShownTypes = (current: string[]) =>
    current.filter((key) => !shownTypes.some((type) => isKeyOfType(key, type.id)));
  const setAllTypes = (show: boolean) =>
    setHidden((current) => [
      ...withoutShownTypes(current),
      ...(show ? [] : shownTypes.map((type) => typeKey(type.id))),
    ]);
  /** Show only this type, or only this one variant of it. */
  const soloType = (type: ObservationType, variant?: LegendVariant['variant']) =>
    setHidden((current) => [
      ...withoutShownTypes(current),
      ...shownTypes.filter((other) => other.id !== type.id).map((other) => typeKey(other.id)),
      ...(variant === undefined
        ? []
        : legendVariants(type)
            .filter((other) => other.variant !== variant)
            .map((other) => variantKey(type.id, other.variant))),
    ]);
  const withoutShownLayers = (current: string[]) =>
    current.filter((id) => !projectLayers.some((layer) => layer.id === id));
  const setAllLayers = (show: boolean) =>
    setHiddenLayers((current) => [
      ...withoutShownLayers(current),
      ...(show ? [] : projectLayers.map((layer) => layer.id)),
    ]);
  const soloLayer = (id: string) =>
    setHiddenLayers((current) => [
      ...withoutShownLayers(current),
      ...projectLayers.filter((layer) => layer.id !== id).map((layer) => layer.id),
    ]);

  const hiddenTypeCount = shownTypes.filter((type) =>
    hidden.some((key) => isKeyOfType(key, type.id))
  ).length;
  const hiddenLayerCount = projectLayers.filter((layer) => hiddenLayers.includes(layer.id)).length;
  const hiddenCount = hiddenTypeCount + hiddenLayerCount;

  return (
    <>
      <Tooltip title="Signaturforklaring">
        <Fab
          ref={setAnchor}
          size="small"
          color={open ? 'primary' : 'default'}
          aria-label="Signaturforklaring"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <LegendToggleIcon />
        </Fab>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchor}
        placement="top-start"
        sx={{zIndex: 1100}}
        modifiers={[{name: 'offset', options: {offset: [0, 8]}}]}
      >
        <Paper
          elevation={4}
          sx={{
            width: 300,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'min(60vh, 520px)',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              pl: 2,
              pr: 0.5,
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{flex: 1}}>
              Signaturforklaring
              {hiddenCount > 0 && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ml: 1, color: 'text.secondary'}}
                >
                  ({hiddenCount} skjult)
                </Typography>
              )}
            </Typography>
            <IconButton size="small" aria-label="Luk" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <List dense disablePadding>
            <ListSubheader
              sx={{top: 41, lineHeight: '32px', display: 'flex', alignItems: 'center'}}
            >
              {shownTypes.length > 0 && (
                <AllCheckbox
                  shown={shownTypes.length - hiddenTypeCount}
                  total={shownTypes.length}
                  onChange={setAllTypes}
                />
              )}
              Feltobservationer
            </ListSubheader>
            {shownTypes.length === 0 && (
              <Typography variant="body2" sx={{px: 2, py: 1, color: 'text.secondary'}}>
                Ingen feltobservationer på kortet.
              </Typography>
            )}
            {shownTypes.map((type) => {
              const kind = geometryKind(type);
              const base = resolveStyle(type, {});
              const variants = legendVariants(type);
              const typeHidden = hidden.includes(typeKey(type.id));
              return (
                <li key={type.id}>
                  <ListItemButton
                    onClick={() =>
                      tap(
                        typeKey(type.id),
                        () => toggle(typeKey(type.id)),
                        () => soloType(type)
                      )
                    }
                    sx={{py: 0}}
                  >
                    <ListItemIcon sx={{minWidth: 32}}>
                      <Checkbox
                        edge="start"
                        size="small"
                        checked={!typeHidden}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <Box sx={{width: 28, display: 'flex', justifyContent: 'center', mr: 1}}>
                      <Swatch
                        kind={kind}
                        color={base.color}
                        icon={base.icon}
                        dashArray={base.dashArray}
                        fillOpacity={base.fillOpacity}
                      />
                    </Box>
                    <ListItemText primary={type.name} />
                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                      {counts.get(typeKey(type.id))}
                    </Typography>
                  </ListItemButton>
                  {variants.length > 1 &&
                    variants.map((variant) => {
                      const key = variantKey(type.id, variant.variant);
                      return (
                        <ListItemButton
                          key={key}
                          disabled={typeHidden}
                          onClick={() =>
                            tap(
                              key,
                              () => toggle(key),
                              () => soloType(type, variant.variant)
                            )
                          }
                          sx={{py: 0, pl: 5}}
                        >
                          <ListItemIcon sx={{minWidth: 32}}>
                            <Checkbox
                              edge="start"
                              size="small"
                              checked={!hidden.includes(key)}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <Box sx={{width: 28, display: 'flex', justifyContent: 'center', mr: 1}}>
                            <Swatch
                              kind={kind}
                              color={variant.color}
                              icon={variant.icon}
                              dashArray={base.dashArray}
                              fillOpacity={base.fillOpacity}
                            />
                          </Box>
                          <ListItemText
                            primary={variant.label}
                            slotProps={{primary: {variant: 'body2'}}}
                          />
                          <Typography variant="caption" sx={{color: 'text.secondary'}}>
                            {counts.get(key) ?? 0}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                </li>
              );
            })}
            {projectLayers.length > 0 && (
              <>
                <ListSubheader
                  sx={{top: 41, lineHeight: '32px', display: 'flex', alignItems: 'center'}}
                >
                  <AllCheckbox
                    shown={projectLayers.length - hiddenLayerCount}
                    total={projectLayers.length}
                    onChange={setAllLayers}
                  />
                  Projektlag
                </ListSubheader>
                {projectLayers.map((layer) => (
                  <ListItemButton
                    key={layer.id}
                    onClick={() =>
                      tap(
                        `layer:${layer.id}`,
                        () => toggleLayer(layer.id),
                        () => soloLayer(layer.id)
                      )
                    }
                    sx={{py: 0}}
                  >
                    <ListItemIcon sx={{minWidth: 32}}>
                      <Checkbox
                        edge="start"
                        size="small"
                        checked={!hiddenLayers.includes(layer.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <Box sx={{width: 28, display: 'flex', justifyContent: 'center', mr: 1}}>
                      <Swatch
                        kind="POLYGON"
                        color={layer.style.color ?? '#e65100'}
                        icon="pin"
                        badge={false}
                        fillOpacity={layer.style.fillOpacity ?? 0.1}
                      />
                    </Box>
                    <ListItemText primary={layer.name} />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
          <Typography
            variant="caption"
            sx={{display: 'block', px: 2, py: 1, color: 'text.secondary'}}
          >
            Dobbelttryk på en linje for kun at vise den.
          </Typography>
        </Paper>
      </Popper>
    </>
  );
};

export default Legend;
