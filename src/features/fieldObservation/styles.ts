import type {
  LocalObservation,
  ObservationType,
  StyleRule,
  TypeStyle,
} from '~/features/fieldObservation/types';

/**
 * Map style of feltobservationer: icon and colour per observationstype, with simple rules on
 * typefelter (see the spec, "Kortstil og signaturforklaring"). Styles are data on the type.
 */

/** The icon library: files in public/fieldObservation/icons (see the README there). */
export const ICONS = [
  'pin',
  'soil',
  'manhole',
  'borehole',
  'water',
  'grass',
  'tree',
  'warning',
  'flag',
  'info',
  'star',
  'home',
  'construction',
  'science',
] as const;

export type IconName = (typeof ICONS)[number];

const DEFAULT_ICON: IconName = 'pin';
export const FALLBACK_COLOR = '#1976d2';
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const iconUrl = (icon: string) => {
  const name = (ICONS as readonly string[]).includes(icon) ? icon : DEFAULT_ICON;
  return `/fieldObservation/icons/${name}.svg`;
};

const safeColor = (color: string | undefined, fallback: string) =>
  color && COLOR_PATTERN.test(color) ? color : fallback;

/** Which part of a type's legend a feltobservation falls in: a rule's index, or the default. */
export type Variant = number | 'default';

export type ResolvedStyle = {
  color: string;
  icon: string;
  weight: number;
  dashArray: string | undefined;
  fillOpacity: number;
  variant: Variant;
};

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length);

const matches = (rule: StyleRule, properties: Record<string, unknown>) => {
  const value = properties[rule.field];
  if (rule.empty) return isEmpty(value);
  if (rule.notEmpty) return !isEmpty(value);
  return 'equals' in rule && value === rule.equals;
};

const typeStyle = (type: ObservationType | undefined): TypeStyle => type?.style ?? {};

/** The style a feltobservation is drawn with: its type's style, changed by the first matching rule. */
export const resolveStyle = (
  type: ObservationType | undefined,
  properties: Record<string, unknown>
): ResolvedStyle => {
  const style = typeStyle(type);
  const base = safeColor(style.color, safeColor(type?.color ?? undefined, FALLBACK_COLOR));
  const rules = style.rules ?? [];
  const index = rules.findIndex((rule) => matches(rule, properties));
  const rule = index >= 0 ? rules[index] : undefined;
  return {
    color: safeColor(rule?.color, base),
    icon: rule?.icon ?? style.icon ?? type?.icon ?? DEFAULT_ICON,
    weight: style.weight ?? 4,
    dashArray: style.dashArray,
    fillOpacity: style.fillOpacity ?? 0.2,
    variant: index >= 0 ? index : 'default',
  };
};

/** One row in the legend for a type: its default look and one per rule. */
export type LegendVariant = {variant: Variant; label: string; color: string; icon: string};

export const legendVariants = (type: ObservationType): LegendVariant[] => {
  const style = typeStyle(type);
  const base = resolveStyle(type, {});
  const rules = style.rules ?? [];
  const variants: LegendVariant[] = rules.map((rule, index) => ({
    variant: index,
    label: rule.label ?? `${rule.field}`,
    color: safeColor(rule.color, base.color),
    icon: rule.icon ?? base.icon,
  }));
  if (rules.length === 0)
    return [{variant: 'default', label: type.name, color: base.color, icon: base.icon}];
  return [
    {
      variant: 'default',
      label: style.defaultLabel ?? 'Øvrige',
      color: base.color,
      icon: base.icon,
    },
    ...variants,
  ];
};

/** Keys for hiding things in the legend, remembered on the device. */
export const typeKey = (typeId: number) => `t:${typeId}`;
export const variantKey = (typeId: number, variant: Variant) => `t:${typeId}:v:${variant}`;

/** Whether the legend hides a feltobservation (its whole type, or its variant). */
export const hiddenByLegend = (
  observation: LocalObservation,
  type: ObservationType | undefined,
  hidden: ReadonlySet<string>
) => {
  if (hidden.has(typeKey(observation.type_id))) return true;
  const {variant} = resolveStyle(type, observation.properties);
  return hidden.has(variantKey(observation.type_id, variant));
};

/** CSS for an icon painted in `color` through a mask (see the icon README). */
export const iconMaskStyle = (icon: string, color: string) => {
  const mask = `url(${iconUrl(icon)}) center / contain no-repeat`;
  return {WebkitMask: mask, mask, backgroundColor: color} as const;
};

/** HTML for a point marker: a round badge in the style's colour with the icon in white. */
export const markerHtml = (style: ResolvedStyle, notSent: boolean) => {
  const border = notSent ? '2px dashed #ed6c02' : '2px solid #fff';
  const mask = `url(${iconUrl(style.icon)}) center / contain no-repeat`;
  return `<div style="width:28px;height:28px;box-sizing:border-box;border-radius:50%;background:${style.color};border:${border};box-shadow:0 1px 3px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center"><span style="width:18px;height:18px;background:#fff;-webkit-mask:${mask};mask:${mask}"></span></div>`;
};
