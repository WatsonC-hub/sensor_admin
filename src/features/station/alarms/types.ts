export type AlarmCriteria = {
  id: number | undefined;
  criteria: number | undefined | null;
  sms: boolean;
  email: boolean;
  call: boolean;
};

export type AlarmCriteriaType = {
  id: number;
  name: string;
};

export type CriteriaTable = {
  id: number;
  name: string;
  criteria: number;
  sms: boolean;
  email: boolean;
  call: boolean;
};

export type AlarmContact = {
  contact_id: string | undefined;
};

export type ContactTable = {
  contact_id: string | undefined;
  name: string;
};

export type AlarmHistory = {
  date: string;
  sent_type: string;
  alarm: boolean;
  alarm_low: boolean;
  name: string;
  signal_warning: boolean;
};

export type Alarm = {
  name: string;
  criteria: string;
  alarm_interval: number;
};

export type AlarmResponse = {
  gid: number;
  name: string;
  alarm_interval: number;
  earliest_timeofday: string;
  latest_timeofday: string;
  note_to_include?: string;
  signal_warning: boolean;
  criteria: Array<CriteriaTable>;
  contacts: Array<ContactTable>;
};

export type AlarmPost = {
  name: string;
  alarm_interval: number;
  alarm_high: number | undefined | null;
  alarm_low: number | undefined | null;
  attention_high: number | undefined | null;
  attention_low: number | undefined | null;
  earliest_timeofday: string;
  latest_timeofday: string;
  note_to_include?: string;
  alarm_contacts: Array<AlarmContact> | undefined;
  alarm_criteria: Array<AlarmCriteria> | undefined;
  signal_warning: boolean;
};

export type alarmTable = {
  gid: number;
  name: string;
  earliest_timeofday: string;
  latest_timeofday: string;
  alarm_interval: number;
  note_to_include: string | undefined;
  alarmCriteria: Array<CriteriaTable>;
  alarmContacts: Array<ContactTable>;
  signal_warning: boolean;
};
