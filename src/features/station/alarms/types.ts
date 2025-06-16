export type AlarmCriteria = {
  attentionLevel: 'attention_high' | 'attention_low' | 'alarm_high' | 'alarm_low' | '';
  criteria: number;
};

export type CriteriaTable = {
  attention_level: 'attention_high' | 'attention_low' | 'alarm_high' | 'alarm_low';
  criteria: number;
};

export type AlarmContact = {
  contact_id: string | undefined;
  sms: boolean;
  email: boolean;
  call: boolean;
};

export type ContactTable = {
  contact_id: string | undefined;
  name: string;
  sms: boolean;
  email: boolean;
  call: boolean;
};

export type AlarmHistory = {
  date: string;
  sent_type: string;
  alarm: boolean;
  alarm_low: boolean;
  name: string;
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
  criteria: Array<CriteriaTable>;
  contacts: Array<ContactTable>;
};

export type AlarmPost = {
  name: string;
  alarm_interval: number;
  alarm_high: number | undefined;
  alarm_low: number | undefined;
  attention_high: number | undefined;
  attention_low: number | undefined;
  earliest_timeofday: string;
  latest_timeofday: string;
  note_to_include?: string;
  alarm_contacts: Array<AlarmContact> | undefined;
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
};
