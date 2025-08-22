import {Group} from '~/types';

export type AlarmCriteriaType = {
  id: number;
};

export type CriteriaTable = {
  gid: number;
  notification_gid: number;
  name: string;
};

export type AlarmContact = {
  contact_id: string | undefined;
  name: string;
  sms: boolean;
  sms_to: string | undefined;
  sms_from: string | undefined;
  email: boolean;
  email_to: string | undefined;
  email_from: string | undefined;
  call: boolean;
  call_to: string | undefined;
  call_from: string | undefined;
};

export type AlarmContactPost = {
  contact_id: string | undefined;
  sms: boolean;
  sms_to: string | undefined;
  sms_from: string | undefined;
  email: boolean;
  email_to: string | undefined;
  email_from: string | undefined;
  call: boolean;
  call_to: string | undefined;
  call_from: string | undefined;
};

export type ContactTable = {
  contact_id: string | undefined;
  name: string;
  sms: {
    sms: boolean;
    to: string | undefined;
    from: string | undefined;
  };
  email: {
    email: boolean;
    to: string | undefined;
    from: string | undefined;
  };
  call: {
    call: boolean;
    to: string | undefined;
    from: string | undefined;
  };
};

export type AlarmHistory = {
  date: string;
  sent_type: string;
  alarm: boolean;
  alarm_low: boolean;
  name: string;
  signal_warning: boolean;
};

export type AlarmResponse = {
  gid: number;
  name: string;
  note_to_include?: string;
  alarm_notifications: Array<number>;
  alarm_contacts: Array<AlarmContact>;
};

export type AlarmPost = {
  name: string;
  note_to_include?: string;
  groups: Array<string>;
  alarm_contacts: Array<AlarmContactPost>;
  notification_ids: Array<number> | undefined;
};

export type alarmTable = {
  gid: number;
  name: string;
  note_to_include: string | undefined;
  groups: Array<Group> | undefined;
  alarm_notifications: Array<number>;
  alarm_contacts: Array<ContactTable>;
};
