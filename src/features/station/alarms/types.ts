export type AlarmNotificationType = {
  id: number;
};

export type AlarmNotificationTable = {
  gid: number;
  notification_gid: number;
  name: string;
};

export type AlarmContact = {
  contact_id: string;
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
  contact_id: string;
  name: string;
  sms: {
    selected: boolean;
    to: string | undefined;
    from: string | undefined;
  };
  email: {
    selected: boolean;
    to: string | undefined;
    from: string | undefined;
  };
  call: {
    selected: boolean;
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
  id: string;
  name: string;
  comment?: string;
  group_id: string | undefined;
  alarm_notifications: Array<number> | undefined;
  alarm_contacts: Array<AlarmContact> | undefined;
};

export type AlarmPost = {
  name: string;
  comment?: string;
  group_id: string | undefined;
  alarm_contacts: Array<AlarmContactPost>;
  notification_ids: Array<number> | undefined;
};

export type alarmTable = {
  id: string;
  name: string;
  comment: string | undefined;
  group_id: string | undefined;
  alarm_notifications: Array<number>;
  alarm_contacts: Array<ContactTable>;
};

export type AlarmContactTypeDialog = {
  contact_id: string | undefined;
  name: string;
};
