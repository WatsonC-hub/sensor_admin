import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LayersIcon from '@mui/icons-material/Layers';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Badge,
  Box,
  ButtonBase,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {useMemo, useState} from 'react';

import Button from '~/components/Button';
import {useGisLayers} from '~/features/fieldObservation/api/useGisLayers';
import {gisLegendGraphicUrl, useGisLegend} from '~/features/fieldObservation/api/useGisLegend';
import {isSavedOffline} from '~/features/fieldObservation/api/useVectorLayers';
import {BACKGROUND_MAPS, useOrtofotoYears} from '~/features/fieldObservation/backgroundMaps';
import OfflineArea from '~/features/fieldObservation/components/OfflineArea';
import {
  activeGisLayersAtom,
  backgroundMapAtom,
  gisLayerOpacityAtom,
  hiddenProjectLayersAtom,
  projectLayerOrderAtom,
  ortofotoYearAtom,
} from '~/features/fieldObservation/state';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type {GisLayer} from '~/features/fieldObservation/api/useGisLayers';
import type {VectorLayerStatus} from '~/features/fieldObservation/api/useVectorLayers';
import type {MapView} from '~/features/fieldObservation/offlineTiles';
import type {ProjectLayer} from '~/features/fieldObservation/types';

const NO_GROUP = 'Andre lag';
const PANEL_WIDTH = 340;
const PROJECT_GROUP = 'projektlag';
// Rows are tall enough to tap on a phone; the desktop list stays compact.
const ROW_HEIGHT = {xs: 48, sm: 40};

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

/** Every word of the search must appear in the text. */
const matches = (words: string[], text: string) => {
  const haystack = text.toLocaleLowerCase('da');
  return words.every((word) => haystack.includes(word));
};

const SectionTitle = ({children, extra}: {children: React.ReactNode; extra?: React.ReactNode}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      px: 2,
      pt: 2,
      pb: 0.5,
    }}
  >
    <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
      {children}
    </Typography>
    {extra}
  </Box>
);

const ProjectSwatch = ({layer}: {layer: ProjectLayer}) => (
  <Box
    sx={{
      width: 14,
      height: 14,
      flexShrink: 0,
      borderRadius: 0.5,
      border: 2,
      borderColor: layer.style.color ?? '#e65100',
      bgcolor: layer.style.fillColor ?? 'transparent',
    }}
  />
);

const BackgroundSection = ({getMapView}: {getMapView: () => MapView | null}) => {
  const [background, setBackground] = useAtom(backgroundMapAtom);
  const [year, setYear] = useAtom(ortofotoYearAtom);
  const {data: years, isPending, isError} = useOrtofotoYears(background === 'ortofoto');

  return (
    <>
      <SectionTitle>Baggrundskort</SectionTitle>
      <Box sx={{px: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
        {BACKGROUND_MAPS.map((map) => {
          const selected = map.id === background;
          return (
            <ButtonBase
              key={map.id}
              aria-pressed={selected}
              onClick={() => setBackground(map.id)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                minHeight: 44,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                border: 1,
                borderColor: selected ? 'primary.main' : 'divider',
                boxShadow: (theme) =>
                  selected ? `inset 0 0 0 1px ${theme.palette.primary.main}` : 'none',
                bgcolor: selected ? 'action.selected' : 'transparent',
                typography: 'body2',
              }}
            >
              {map.title}
            </ButtonBase>
          );
        })}
      </Box>
      {background === 'ortofoto' && (
        <Box sx={{px: 2, pt: 1.5}}>
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
      {background === 'luftfoto' && <OfflineArea getMapView={getMapView} />}
    </>
  );
};

const GisLegend = ({layerId}: {layerId: string}) => {
  const {data: rows, isPending, isError} = useGisLegend(layerId);
  if (isPending) return <CircularProgress size={16} />;
  if (isError) {
    return (
      <Typography variant="body2" sx={{color: 'text.secondary'}}>
        Signaturen kunne ikke hentes.
      </Typography>
    );
  }
  if (rows.length === 0) {
    return (
      <Box component="img" src={gisLegendGraphicUrl(layerId)} alt="" sx={{maxWidth: '100%'}} />
    );
  }
  return (
    <Box component="ul" sx={{listStyle: 'none', m: 0, p: 0}}>
      {rows.map((row) => (
        <Box
          component="li"
          key={`${row.name}|${row.swatch ?? ''}`}
          sx={{display: 'flex', alignItems: 'center', gap: 1, py: 0.25}}
        >
          {row.swatch ? (
            <img src={row.swatch} alt="" width={17} height={17} />
          ) : (
            <Box sx={{width: 17, flexShrink: 0}} />
          )}
          <Typography variant="body2">{row.name}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const formatFetchedAt = (iso: string) =>
  new Date(iso).toLocaleString('da-DK', {dateStyle: 'short', timeStyle: 'short'});

const savedText = (record: {feature_count: number; fetched_at: string; truncated: boolean}) =>
  `${record.feature_count.toLocaleString('da-DK')} objekter · hentet ${formatFetchedAt(record.fetched_at)}` +
  (record.truncated ? ' · kun en del af området (for mange objekter)' : '');

/** Tooltip text for a layer that isn't shown offline, by why it isn't. */
const NOT_SAVED_TEXT: Partial<Record<VectorLayerStatus['state'], string>> = {
  'online-only': 'Kun online: laget kan ikke gemmes på enheden',
  'no-project': 'Vises ikke offline. Vælg et projekt, så gemmes laget for projektets område',
  'no-area':
    'Vises ikke offline. Projektet har ingen feltobservationer eller projektlag at gemme laget for',
  'not-saved': 'Ikke gemt endnu. Laget gemmes på enheden, når du er online',
  unknown: 'Vises ikke, før du er online igen',
};

/** Whether the layer is saved on the device for the projekt, being saved, failed, or online only. */
const OfflineStatusIcon = ({
  status,
  projectNo,
  online,
}: {
  status: VectorLayerStatus | undefined;
  projectNo: string | null;
  online: boolean;
}) => {
  if (!status) return null;
  let title: string;
  let icon: React.ReactElement;
  if (status.state === 'saving') {
    title = status.record ? 'Henter laget igen …' : 'Gemmer laget på enheden …';
    icon = <CircularProgress size={16} aria-label={title} />;
  } else if (status.state === 'saved') {
    title = `Gemt på enheden for ${projectNo} · ${savedText(status.record)}`;
    icon = <OfflinePinIcon fontSize="small" color="success" aria-label={title} />;
  } else if (status.state === 'error') {
    title = status.record
      ? `Kunne ikke hentes igen (${status.message}). Viser den gemte udgave: ${savedText(status.record)}`
      : `Kunne ikke gemmes på enheden (${status.message}). Vises ikke offline`;
    icon = <WarningAmberIcon fontSize="small" color="warning" aria-label={title} />;
  } else {
    // Online, a layer that only isn't saved yet or whose metadata is still loading needs no icon.
    if (online && (status.state === 'unknown' || status.state === 'not-saved')) return null;
    title = NOT_SAVED_TEXT[status.state] ?? '';
    icon = (
      <CloudOffIcon fontSize="small" color={online ? 'disabled' : 'warning'} aria-label={title} />
    );
  }
  return (
    <Tooltip title={title} enterTouchDelay={0}>
      <Box sx={{display: 'flex', alignItems: 'center', mr: 0.5}}>{icon}</Box>
    </Tooltip>
  );
};

type ActiveGisRowProps = {
  layerId: string;
  layer: GisLayer | undefined;
  online: boolean;
  projectNo: string | null;
  status: VectorLayerStatus | undefined;
  /** Null when the layer is already at the top or bottom. */
  onRaise: (() => void) | null;
  onLower: (() => void) | null;
  onRemove: () => void;
};

const ActiveGisRow = ({
  layerId,
  layer,
  online,
  projectNo,
  status,
  onRaise,
  onLower,
  onRemove,
}: ActiveGisRowProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [opacities, setOpacities] = useAtom(gisLayerOpacityAtom);
  const visibility = Math.round((opacities[layerId] ?? 1) * 100);
  const title = layer?.title ?? layerId;

  return (
    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
      <Box
        sx={{display: 'flex', alignItems: 'center', gap: 0.5, pl: 2, pr: 1, minHeight: ROW_HEIGHT}}
      >
        <OfflineStatusIcon status={status} projectNo={projectNo} online={online} />
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography variant="body2" noWrap title={title}>
            {title}
          </Typography>
          {layer?.group && (
            <Typography variant="caption" component="div" noWrap sx={{color: 'text.secondary'}}>
              {layer.group}
            </Typography>
          )}
        </Box>
        <Tooltip title="Synlighed, rækkefølge og signatur">
          <IconButton
            size="small"
            color={open ? 'primary' : 'default'}
            aria-label={`Indstillinger for ${title}`}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fjern fra kortet">
          <IconButton size="small" aria-label={`Fjern ${title}`} onClick={onRemove}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box sx={{px: 2, pb: 1.5}}>
          <Typography variant="caption" component="div" sx={{color: 'text.secondary'}}>
            Synlighed: {visibility} %
          </Typography>
          <Slider
            size="small"
            min={0}
            max={100}
            step={10}
            value={visibility}
            aria-label="Synlighed"
            onChange={(_event, value) =>
              setOpacities((current) => ({...current, [layerId]: Number(value) / 100}))
            }
          />
          <Box sx={{display: 'flex', gap: 1, mb: 1.5}}>
            <Button
              bttype="tertiary"
              size="small"
              startIcon={<KeyboardArrowUpIcon />}
              disabled={onRaise === null}
              onClick={() => onRaise?.()}
            >
              Flyt op
            </Button>
            <Button
              bttype="tertiary"
              size="small"
              startIcon={<KeyboardArrowDownIcon />}
              disabled={onLower === null}
              onClick={() => onLower?.()}
            >
              Flyt ned
            </Button>
          </Box>
          {projectNo !== null && (status?.state === 'saved' || status?.state === 'error') && (
            <Box sx={{mb: 1.5}}>
              <Button
                bttype="tertiary"
                size="small"
                startIcon={<RefreshIcon />}
                disabled={!online}
                onClick={() =>
                  void queryClient.refetchQueries({
                    queryKey: queryKeys.fieldObservationVectorLayer(layerId, projectNo),
                  })
                }
              >
                Hent igen
              </Button>
              <Typography variant="caption" component="div" sx={{color: 'text.secondary'}}>
                {online
                  ? `Henter laget for ${projectNo} igen og gemmer det på enheden.`
                  : 'Kræver, at du er online.'}
              </Typography>
            </Box>
          )}
          <Typography variant="caption" component="div" sx={{color: 'text.secondary', mb: 0.5}}>
            Signatur
          </Typography>
          <GisLegend layerId={layerId} />
        </Box>
      </Collapse>
    </Box>
  );
};

/** What is on the map now, top layer first: the projekt's shown projektlag, then GIS layers. */
type OnMapSectionProps = {
  projectNo: string | null;
  projectLayers: ProjectLayer[];
  vectorLayerStatuses: Record<string, VectorLayerStatus>;
};

const OnMapSection = ({projectNo, projectLayers, vectorLayerStatuses}: OnMapSectionProps) => {
  const online = useOnlineStatus();
  // Bottom layer first, as the map draws them.
  const [active, setActive] = useAtom(activeGisLayersAtom);
  const [hidden, setHidden] = useAtom(hiddenProjectLayersAtom);
  const {data: layers} = useGisLayers();
  const byId = useMemo(() => new Map((layers ?? []).map((layer) => [layer.id, layer])), [layers]);
  const shownProjectLayers = projectLayers.filter((layer) => !hidden.includes(layer.id));
  const count = active.length + shownProjectLayers.length;
  // Only these disappear offline; the rest are drawn from the device.
  const notOffline = active
    .filter((id) => !isSavedOffline(vectorLayerStatuses[id]))
    .map((id) => byId.get(id)?.title ?? id);

  const setProjectLayerOrder = useSetAtom(projectLayerOrderAtom);

  const swap = (index: number, other: number) =>
    setActive((current) => {
      const next = [...current];
      [next[index], next[other]] = [next[other], next[index]];
      return next;
    });

  // Swaps two shown projektlag; hidden ones keep their place. `projectLayers` is the projekt's
  // full list, top first. Other projekters' ids stay in the stored order after this projekt's.
  const swapProjectLayers = (id: string, otherId: string) => {
    const ids = projectLayers.map((layer) => layer.id);
    const index = ids.indexOf(id);
    const other = ids.indexOf(otherId);
    [ids[index], ids[other]] = [ids[other], ids[index]];
    setProjectLayerOrder((current) => [...ids, ...current.filter((key) => !ids.includes(key))]);
  };

  return (
    <>
      <SectionTitle
        extra={
          <Typography variant="caption" sx={{color: 'text.secondary'}}>
            {count}
          </Typography>
        }
      >
        På kortet
      </SectionTitle>
      {!online && notOffline.length > 0 && (
        <Alert severity="warning" icon={<CloudOffIcon fontSize="inherit" />} sx={{mx: 2, mb: 1}}>
          {notOffline.length === 1
            ? `Du er offline. ${notOffline[0]} vises ikke, før du er online igen.`
            : `Du er offline. Disse lag vises ikke, før du er online igen: ${notOffline.join(', ')}.`}
        </Alert>
      )}
      {count === 0 ? (
        <Typography variant="body2" sx={{px: 2, color: 'text.secondary'}}>
          Ingen lag er slået til. Find dem under Tilføj lag.
        </Typography>
      ) : (
        <Box sx={{borderTop: 1, borderColor: 'divider'}}>
          {/* Projektlag are always drawn above the GIS layers. */}
          {shownProjectLayers.map((layer, index) => (
            <Box
              key={layer.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pl: 2,
                pr: 1,
                minHeight: ROW_HEIGHT,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <ProjectSwatch layer={layer} />
              <Box sx={{flex: 1, minWidth: 0}}>
                <Typography variant="body2" noWrap title={layer.name}>
                  {layer.name}
                </Typography>
                <Typography variant="caption" component="div" sx={{color: 'text.secondary'}}>
                  Projektlag
                </Typography>
              </Box>
              {shownProjectLayers.length > 1 && (
                <>
                  <Tooltip title="Flyt op">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Flyt ${layer.name} op`}
                        disabled={index === 0}
                        onClick={() =>
                          swapProjectLayers(layer.id, shownProjectLayers[index - 1].id)
                        }
                      >
                        <KeyboardArrowUpIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Flyt ned">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Flyt ${layer.name} ned`}
                        disabled={index === shownProjectLayers.length - 1}
                        onClick={() =>
                          swapProjectLayers(layer.id, shownProjectLayers[index + 1].id)
                        }
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Fjern fra kortet">
                <IconButton
                  size="small"
                  aria-label={`Fjern ${layer.name}`}
                  onClick={() => setHidden((current) => toggleIn(current, layer.id))}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          {active
            .map((id, index) => ({id, index}))
            .reverse()
            .map(({id, index}) => (
              <ActiveGisRow
                key={id}
                layerId={id}
                layer={byId.get(id)}
                online={online}
                projectNo={projectNo}
                status={vectorLayerStatuses[id]}
                onRaise={index < active.length - 1 ? () => swap(index, index + 1) : null}
                onLower={index > 0 ? () => swap(index, index - 1) : null}
                onRemove={() => setActive((current) => current.filter((layerId) => layerId !== id))}
              />
            ))}
        </Box>
      )}
    </>
  );
};

type GroupHeaderProps = {
  title: string;
  /** "on/total". */
  count: string;
  hasActive: boolean;
  open: boolean;
  onClick: () => void;
};

const GroupHeader = ({title, count, hasActive, open, onClick}: GroupHeaderProps) => (
  <ListItemButton
    aria-expanded={open}
    onClick={onClick}
    sx={{minHeight: ROW_HEIGHT, borderBottom: 1, borderColor: 'divider', pl: 1.5}}
  >
    <ListItemIcon sx={{minWidth: 32}}>
      {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
    </ListItemIcon>
    <ListItemText primary={title} slotProps={{primary: {variant: 'body2', noWrap: true}}} />
    <Typography
      variant="caption"
      sx={{
        ml: 1,
        color: hasActive ? 'primary.main' : 'text.secondary',
        fontWeight: hasActive ? 500 : undefined,
      }}
    >
      {count}
    </Typography>
  </ListItemButton>
);

type ProjectLayerProps = {
  /** The projekt chosen on the map, or null. */
  projectNo: string | null;
  projectLayers: ProjectLayer[];
  /** The user may delete projektlag in this projekt (edit rights). */
  canDelete: boolean;
  onDelete: (layer: ProjectLayer) => void;
};

/** The catalog: the projekt's projektlag and Explorer's GIS layers, in collapsed groups. */
const CatalogSection = ({projectNo, projectLayers, canDelete, onDelete}: ProjectLayerProps) => {
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [active, setActive] = useAtom(activeGisLayersAtom);
  const [hidden, setHidden] = useAtom(hiddenProjectLayersAtom);
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

  // A search opens every group with a hit, so finding a layer is one step.
  const words = query.toLocaleLowerCase('da').split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const shownGroups = groups
    .map(({group, items}) => ({
      group,
      total: items.length,
      activeCount: items.filter((layer) => active.includes(layer.id)).length,
      items: searching ? items.filter((layer) => matches(words, `${layer.title} ${group}`)) : items,
    }))
    .filter(({items}) => items.length > 0);
  const projectItems = searching
    ? projectLayers.filter((layer) => matches(words, `${layer.name} projektlag`))
    : projectLayers;
  const showProjectGroup = projectNo !== null && (!searching || projectItems.length > 0);
  const total = layers?.length ?? 0;
  const shown = shownGroups.reduce((sum, {items}) => sum + items.length, 0);
  const activeTotal = (layers ?? []).filter((layer) => active.includes(layer.id)).length;
  const isOpen = (key: string) => searching || openGroups.includes(key);
  const toggleGroup = (key: string) => setOpenGroups((current) => toggleIn(current, key));
  const shownProjectCount = projectLayers.filter((layer) => !hidden.includes(layer.id)).length;

  return (
    <>
      <SectionTitle>Tilføj lag</SectionTitle>
      <Box sx={{px: 2, pb: 1}}>
        <TextField
          size="small"
          fullWidth
          value={query}
          placeholder="Søg i lag og grupper"
          onChange={(event) => setQuery(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Ryd søgning" onClick={() => setQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        {layers && (
          <Typography variant="caption" component="div" sx={{color: 'text.secondary', mt: 0.5}}>
            {searching
              ? `${shown} af ${total} GIS-lag`
              : `${total} GIS-lag · ${activeTotal} slået til`}
          </Typography>
        )}
      </Box>
      {isPending && <CircularProgress size={24} sx={{mx: 2}} />}
      {isError && (
        <Alert severity="warning" sx={{mx: 2}}>
          Kunne ikke hente lagene fra Explorer.
        </Alert>
      )}
      <Box sx={{borderTop: 1, borderColor: 'divider'}}>
        {showProjectGroup && (
          <>
            <GroupHeader
              title={`Projektlag · ${projectNo}`}
              count={`${shownProjectCount}/${projectLayers.length}`}
              hasActive={shownProjectCount > 0}
              open={isOpen(PROJECT_GROUP)}
              onClick={() => toggleGroup(PROJECT_GROUP)}
            />
            <Collapse in={isOpen(PROJECT_GROUP)} unmountOnExit>
              {projectItems.length === 0 && (
                <Typography variant="body2" sx={{pl: 6, pr: 2, py: 1, color: 'text.secondary'}}>
                  Projektet har ingen projektlag. Upload et med Importér fil.
                </Typography>
              )}
              {projectItems.map((layer) => (
                <ListItemButton
                  key={layer.id}
                  dense
                  sx={{pl: 4, minHeight: ROW_HEIGHT}}
                  onClick={() => setHidden((current) => toggleIn(current, layer.id))}
                >
                  <ListItemIcon sx={{minWidth: 36}}>
                    <Checkbox
                      edge="start"
                      size="small"
                      checked={!hidden.includes(layer.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <Box sx={{mr: 1.5}}>
                    <ProjectSwatch layer={layer} />
                  </Box>
                  <ListItemText
                    primary={layer.name}
                    secondary={`${layer.feature_count} objekter`}
                  />
                  {canDelete && (
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label={`Slet ${layer.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(layer);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItemButton>
              ))}
            </Collapse>
          </>
        )}
        {shownGroups.map(({group, total: groupTotal, activeCount, items}) => (
          <React.Fragment key={group}>
            <GroupHeader
              title={group}
              count={`${activeCount}/${groupTotal}`}
              hasActive={activeCount > 0}
              open={isOpen(group)}
              onClick={() => toggleGroup(group)}
            />
            <Collapse in={isOpen(group)} unmountOnExit>
              {items.map((layer) => (
                <ListItemButton
                  key={layer.id}
                  dense
                  sx={{pl: 4, minHeight: ROW_HEIGHT}}
                  onClick={() => setActive((current) => toggleIn(current, layer.id))}
                >
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
                  {layer.offline && (
                    <Tooltip title="Kan gemmes på enheden, så laget også vises offline. Det gemmes for det valgte projekts område, når det er slået til">
                      <Chip
                        label="Offline"
                        size="small"
                        variant="outlined"
                        sx={{ml: 1, height: 20, fontSize: '0.7rem', color: 'text.secondary'}}
                      />
                    </Tooltip>
                  )}
                </ListItemButton>
              ))}
            </Collapse>
          </React.Fragment>
        ))}
      </Box>
      {searching && shown === 0 && projectItems.length === 0 && (
        <Typography variant="body2" sx={{px: 2, py: 2, color: 'text.secondary'}}>
          Ingen lag matcher &quot;{query.trim()}&quot;.
        </Typography>
      )}
    </>
  );
};

/** The Kortlag button in the top bar; the number is the GIS layers that are on. */
export const LayerButton = ({open, onClick}: {open: boolean; onClick: () => void}) => {
  const active = useAtomValue(activeGisLayersAtom);
  return (
    <Tooltip title="Kortlag">
      <IconButton color="inherit" aria-label="Kortlag" aria-pressed={open} onClick={onClick}>
        <Badge badgeContent={active.length} color="secondary" invisible={active.length === 0}>
          <LayersIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

type Props = ProjectLayerProps & {
  /** Per GIS layer that is on: whether it is saved on the device for the projekt. */
  vectorLayerStatuses: Record<string, VectorLayerStatus>;
  onClose: () => void;
  /** The area and zoom shown on the map, for downloading luftfoto; null before the map is ready. */
  getMapView: () => MapView | null;
};

/**
 * Kortlag: background map, what is on the map, and the layer catalog. On desktop a panel
 * docked beside the map that stays open while you work; on a phone a full-screen view.
 */
const LayerPanel = ({onClose, getMapView, vectorLayerStatuses, ...projectLayerProps}: Props) => {
  const {isMobile} = useBreakpoints();
  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: 2,
          pr: 1,
          py: 0.5,
          minHeight: 52,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <LayersIcon color="action" />
        <Typography variant="h6" sx={{flex: 1, fontSize: '1.1rem'}}>
          Kortlag
        </Typography>
        <IconButton aria-label="Luk kortlag" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', pb: 3}}>
        <BackgroundSection getMapView={getMapView} />
        <OnMapSection
          projectNo={projectLayerProps.projectNo}
          projectLayers={projectLayerProps.projectLayers}
          vectorLayerStatuses={vectorLayerStatuses}
        />
        <CatalogSection {...projectLayerProps} />
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Dialog fullScreen open onClose={onClose}>
        {content}
      </Dialog>
    );
  }
  return (
    <Paper
      square
      elevation={0}
      sx={{
        width: PANEL_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      {content}
    </Paper>
  );
};

export default LayerPanel;
