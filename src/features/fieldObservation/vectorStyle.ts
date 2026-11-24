import type L from 'leaflet';

/**
 * GC2 class styling, turned into Leaflet styles for GIS layers drawn as vector data (offline).
 * GC2 draws a feature with the first class whose MapServer expression matches it; the expressions
 * GC2 styling uses here (`[col]==1`, `"[col]"=="text"`, AND/OR/NOT, `<`, …) are evaluated in JS
 * against the feature's properties.
 */

export type VectorGeometryKind = 'point' | 'line' | 'polygon';

/** Leaflet path options for one class; `radius` is for points (circleMarker). */
export type VectorClassStyle = Required<
  Pick<L.CircleMarkerOptions, 'stroke' | 'weight' | 'opacity' | 'fill' | 'fillOpacity' | 'radius'>
> &
  Pick<L.PathOptions, 'color' | 'fillColor'>;

export type VectorClass = {expression: string; style: VectorClassStyle};

/** A layer's classes in GC2's drawing order. Stored with the features, so it works offline. */
export type VectorLayerStyle = {kind: VectorGeometryKind; classes: VectorClass[]};

/** One style of a GC2 class (`styles` array), or the class itself in GC2's older flat format. */
export type Gc2Style = {
  color?: string;
  outlinecolor?: string;
  width?: string | number;
  opacity?: string | number;
  style_opacity?: string | number;
  symbol?: string;
  size?: string | number;
  sortid?: string | number;
};

export type Gc2Class = Gc2Style & {
  expression?: string;
  sortid?: string | number;
  styles?: Gc2Style[];
};

const DEFAULT_OUTLINE = '#555555';

const toNumber = (value: unknown, fallback: number) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/** GC2 opacity is a percentage. */
const toOpacity = (value: unknown) => Math.min(1, Math.max(0, toNumber(value, 100) / 100));

const bySortId = <T extends {sortid?: string | number}>(items: T[]) =>
  items
    .map((item, index) => ({item, index}))
    .sort(
      (a, b) =>
        toNumber(a.item.sortid, -Infinity) - toNumber(b.item.sortid, -Infinity) || a.index - b.index
    )
    .map(({item}) => item);

export const geometryKind = (gc2Type: string): VectorGeometryKind =>
  gc2Type.includes('POINT') ? 'point' : gc2Type.includes('LINE') ? 'line' : 'polygon';

/** One class's GC2 styles as a single Leaflet style. */
const classStyle = (kind: VectorGeometryKind, gc2Class: Gc2Class): VectorClassStyle => {
  const styles = gc2Class.styles ?? [{...gc2Class, opacity: gc2Class.style_opacity}];
  const style: VectorClassStyle = {
    stroke: false,
    weight: 1,
    opacity: 1,
    fill: false,
    fillOpacity: 1,
    radius: 4,
  };
  for (const gc2Style of bySortId(styles)) {
    const opacity = toOpacity(gc2Style.opacity);
    const weight = toNumber(gc2Style.width, 1);
    if (kind === 'line') {
      const color = gc2Style.color || gc2Style.outlinecolor;
      if (color) Object.assign(style, {stroke: true, color, weight, opacity});
      continue;
    }
    if (kind === 'point' && gc2Style.size !== undefined) {
      style.radius = toNumber(gc2Style.size, 8) / 2;
    }
    // A hatch fill is drawn as a light fill: canvas has no hatch pattern.
    const hatch = gc2Style.symbol?.startsWith('hatch') ?? false;
    if (gc2Style.color) {
      Object.assign(style, {
        fill: true,
        fillColor: gc2Style.color,
        fillOpacity: hatch ? opacity * 0.3 : opacity,
      });
    }
    if (gc2Style.outlinecolor) {
      Object.assign(style, {stroke: true, color: gc2Style.outlinecolor, weight, opacity});
    } else if (hatch && !gc2Style.color) {
      Object.assign(style, {stroke: true, color: DEFAULT_OUTLINE, weight, opacity});
    }
  }
  // Nothing usable: a grey outline rather than an invisible layer.
  if (!style.stroke && !style.fill) {
    Object.assign(style, {stroke: true, color: DEFAULT_OUTLINE, weight: 1, opacity: 1});
  }
  return style;
};

/** A GC2 layer's classes as a VectorLayerStyle. A layer without classes gets one default class. */
export const toVectorLayerStyle = (gc2Type: string, classes: Gc2Class[]): VectorLayerStyle => {
  const kind = geometryKind(gc2Type);
  const sorted = bySortId(classes);
  return {
    kind,
    classes: (sorted.length > 0 ? sorted : [{}]).map((gc2Class) => ({
      expression: gc2Class.expression ?? '',
      style: classStyle(kind, gc2Class),
    })),
  };
};

// --- MapServer expressions --------------------------------------------------------------------

type Properties = Record<string, unknown>;
type Matcher = (properties: Properties) => boolean;

type Operand =
  | {kind: 'attr'; name: string; quoted: boolean}
  | {kind: 'string'; value: string}
  | {kind: 'number'; value: number};

type Token = Operand | {kind: 'op'; value: string} | {kind: '(' | ')' | 'and' | 'or' | 'not'};

const WORDS: Record<string, Token> = {
  and: {kind: 'and'},
  or: {kind: 'or'},
  not: {kind: 'not'},
  eq: {kind: 'op', value: '=='},
  ne: {kind: 'op', value: '!='},
  lt: {kind: 'op', value: '<'},
  gt: {kind: 'op', value: '>'},
  le: {kind: 'op', value: '<='},
  ge: {kind: 'op', value: '>='},
};

const tokenize = (expression: string): Token[] | null => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expression.length) {
    const rest = expression.slice(i);
    const char = rest.charAt(0);
    if (/\s/.test(char)) {
      i++;
    } else if (char === '(' || char === ')') {
      tokens.push({kind: char});
      i++;
    } else if (char === '[') {
      const end = rest.indexOf(']');
      if (end < 0) return null;
      tokens.push({kind: 'attr', name: rest.slice(1, end), quoted: false});
      i += end + 1;
    } else if (char === '"' || char === "'") {
      const end = rest.indexOf(char, 1);
      if (end < 0) return null;
      const body = rest.slice(1, end);
      // "[col]" is the attribute compared as text.
      const attr = /^\[([^\]]+)\]$/.exec(body)?.[1];
      tokens.push(
        attr !== undefined
          ? {kind: 'attr', name: attr, quoted: true}
          : {kind: 'string', value: body}
      );
      i += end + 1;
    } else if (/^(&&|\|\|)/.test(rest)) {
      tokens.push({kind: rest.startsWith('&&') ? 'and' : 'or'});
      i += 2;
    } else if (/^(==|!=|<=|>=)/.test(rest)) {
      tokens.push({kind: 'op', value: rest.slice(0, 2)});
      i += 2;
    } else if (/^[=<>]/.test(rest)) {
      tokens.push({kind: 'op', value: char === '=' ? '==' : char});
      i++;
    } else if (char === '!') {
      tokens.push({kind: 'not'});
      i++;
    } else if (/^-?\d/.test(rest)) {
      const number = /^-?\d+(\.\d+)?/.exec(rest)![0];
      tokens.push({kind: 'number', value: Number(number)});
      i += number.length;
    } else {
      const word = /^[A-Za-z]+/.exec(rest)?.[0];
      const token = word ? WORDS[word.toLowerCase()] : undefined;
      if (!word || !token) return null;
      tokens.push(token);
      i += word.length;
    }
  }
  return tokens;
};

const isOperand = (token: Token | undefined): token is Operand =>
  token?.kind === 'attr' || token?.kind === 'string' || token?.kind === 'number';

const isText = (operand: Operand) =>
  operand.kind === 'string' || (operand.kind === 'attr' && operand.quoted);

/** A value as MapServer compares it as text. */
const asText = (value: unknown) =>
  value === null || value === undefined
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value as string | number | boolean);

const operandValue = (operand: Operand, properties: Properties) =>
  operand.kind === 'attr'
    ? operand.quoted
      ? asText(properties[operand.name])
      : properties[operand.name]
    : operand.value;

const compare = (op: string, a: string | number, b: string | number) => {
  switch (op) {
    case '==':
      return a === b;
    case '!=':
      return a !== b;
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '<=':
      return a <= b;
    default:
      return a >= b;
  }
};

const comparison =
  (left: Operand, op: string, right: Operand): Matcher =>
  (properties) => {
    const a = operandValue(left, properties);
    const b = operandValue(right, properties);
    if (isText(left) || isText(right)) return compare(op, asText(a), asText(b));
    if (a === null || a === undefined || a === '' || b === null || b === undefined || b === '') {
      return false;
    }
    const [x, y] = [Number(a), Number(b)];
    return Number.isNaN(x) || Number.isNaN(y) ? false : compare(op, x, y);
  };

/** Recursive descent: or := and (OR and)*; and := unary (AND unary)*; unary := NOT unary | ( or ) | a op b. */
const parse = (tokens: Token[]): Matcher | null => {
  let position = 0;
  const peek = () => tokens[position];

  const unary = (): Matcher | null => {
    const token = peek();
    if (token?.kind === 'not') {
      position++;
      const inner = unary();
      return inner && ((properties) => !inner(properties));
    }
    if (token?.kind === '(') {
      position++;
      const inner = or();
      if (peek()?.kind !== ')') return null;
      position++;
      return inner;
    }
    const left = peek();
    const op = tokens[position + 1];
    const right = tokens[position + 2];
    if (!isOperand(left) || op?.kind !== 'op' || !isOperand(right)) return null;
    position += 3;
    return comparison(left, op.value, right);
  };

  const and = (): Matcher | null => {
    let left = unary();
    while (left && peek()?.kind === 'and') {
      position++;
      const right = unary();
      if (!right) return null;
      const previous = left;
      left = (properties) => previous(properties) && right(properties);
    }
    return left;
  };

  const or = (): Matcher | null => {
    let left = and();
    while (left && peek()?.kind === 'or') {
      position++;
      const right = and();
      if (!right) return null;
      const previous = left;
      left = (properties) => previous(properties) || right(properties);
    }
    return left;
  };

  const matcher = or();
  return matcher && position === tokens.length ? matcher : null;
};

/** A matcher for a MapServer expression; empty matches all, null when it can't be read. */
const toMatcher = (expression: string): Matcher | null => {
  if (expression.trim() === '') return () => true;
  const tokens = tokenize(expression);
  return tokens ? parse(tokens) : null;
};

/**
 * The style each feature is drawn with: its first matching class, as GC2 draws it, or null when
 * no class matches (GC2 doesn't draw it either). If a class can't be read, a feature no readable
 * class matches gets the first class's style rather than disappearing.
 */
export const featureStyler = (layerStyle: VectorLayerStyle) => {
  const compiled = layerStyle.classes.map((gc2Class) => ({
    matcher: toMatcher(gc2Class.expression),
    style: gc2Class.style,
  }));
  const unreadable = compiled.some(({matcher}) => matcher === null);
  return (properties: Properties | null): VectorClassStyle | null => {
    for (const {matcher, style} of compiled) {
      if (matcher?.(properties ?? {})) return style;
    }
    return unreadable ? (compiled[0]?.style ?? null) : null;
  };
};
