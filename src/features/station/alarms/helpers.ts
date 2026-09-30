import type {AlarmContactDialogFormType, AlarmContactFormType} from './schema';

export const channels = ['sms', 'email', 'call'] as const;
export type Channel = (typeof channels)[number];

type Interval = {from: string | null; to: string | null};

export const DEFAULT_WINDOW = {from: '08:00', to: '16:00'} as const;
const ALL_DAY = {from: '00:00', to: '00:00'} as const;

const hhmm = (value: string | null) => value?.slice(0, 5) ?? null;

// The notifier treats from === to as the whole day
export const isAllDay = ({from, to}: Interval) => !!from && hhmm(from) === hhmm(to);

export const formatInterval = (interval: Interval) => {
  if (isAllDay(interval)) return 'Hele døgnet';
  const from = hhmm(interval.from);
  const to = hhmm(interval.to);
  const overMidnight = !!from && !!to && from > to;
  return `${from} - ${to}${overMidnight ? ' (over midnat)' : ''}`;
};

export const toDialogValues = (contact: AlarmContactFormType): AlarmContactDialogFormType => {
  const toChannel = (channel: AlarmContactFormType[Channel]) => {
    if (!channel.selected) return {...channel, mode: null, from: null, to: null};
    if (isAllDay(channel)) return {...channel, mode: 'all_day' as const, ...DEFAULT_WINDOW};
    return {...channel, mode: 'window' as const};
  };

  return {
    ...contact,
    sms: toChannel(contact.sms),
    email: toChannel(contact.email),
    call: toChannel(contact.call),
  };
};

export const fromDialogValues = (values: AlarmContactDialogFormType): AlarmContactFormType => {
  const fromChannel = ({mode, ...channel}: AlarmContactDialogFormType[Channel]) => {
    if (!channel.selected) return {...channel, from: null, to: null};
    if (mode === 'all_day') return {...channel, ...ALL_DAY};
    return channel;
  };

  return {
    ...values,
    sms: fromChannel(values.sms),
    email: fromChannel(values.email),
    call: fromChannel(values.call),
  };
};
