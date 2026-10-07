export type AlarmNotificationType = {
  id: number;
};

export type ContactTable = {
  contact_id: string;
  name: string;
  sms: {
    selected: boolean;
    to: string | null;
    from: string | null;
    disabled: boolean;
  };
  email: {
    selected: boolean;
    to: string | null;
    from: string | null;
    disabled: boolean;
  };
  call: {
    selected: boolean;
    to: string | null;
    from: string | null;
    disabled: boolean;
  };
};

export type AlarmHistory = {
  date: string;
  sent_type: string;
  alarm: boolean;
  alarm_low: boolean;
  name: string;
  notification_name: string;
};

export type AlarmTableType = {
  id: string;
  name: string;
  comment: string | null;
  group_id: string | null;
  alarm_notifications: Array<number>;
  alarm_contacts: Array<ContactTable>;
};

export type AlarmContactTypeDialog = {
  contact_id: string;
  name: string;
};
