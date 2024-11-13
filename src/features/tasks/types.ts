// {
//     id: '{{objectId()}}',
//     assigned_to: '{{integer(1234123123, 32324123123)}}',
//     status: '{{integer(1, 3)}}',
//     duedate: '{{date(new Date(2024, 12, 30), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
//     loc_id: '{{integer(1, 1024)}}',
//     ts_id: '{{integer(1, 1024)}}',
//     opgave: '{{lorem(3, "words")}}',
//     description: '{{lorem(2, "sentence")}}',
//     latitude: '{{floating(54.76906, 57.72093)}}',
//     longitude: '{{floating(8.24402, 14.70664)}}'
//   }

export type ID = string;

export type Task = {
  id: ID;
  ts_id: number;
  loc_id: number;
  location_name: string;
  longitude: number;
  latitude: number;
  name: string;
  description: string;
  status_id: number;
  status_name: string;
  due_date: string;
  due_date_type: string;
  assigned_to: string | null;
  assigned_display_name: string | null;
  blocks_notifications: number[];
  created_by: string;
  created_display_name: string;
  created_at: string;
  updated_at: string;
};

export type DBTask = {
  id: number;
  ts_id: number;
  name: string;
  description: string;
  status_id: number;
  due_date: string;
  due_date_type: string;
  assigned_to: string | null;
  assigned_last_name: string | null;
  blocks_notifications: number[];
  created_by: string;
};

export type PatchTask = Partial<
  Omit<
    DBTask,
    'id' | 'due_date_type' | 'blocks_notifications' | 'created_by' | 'assigned_last_name'
  >
>;

export type PostTask = Omit<DBTask, 'id'>;

export type TaskItiniary = {
  tasks: Pick<Task, 'id'>[];
  due_date: string;
  assigned_to: number;
};

export type DBTaskComment = {
  id: ID;
  comment: string;
  task_id: ID;
  created_at: string;
};

export type TaskComment = DBTaskComment & {
  display_name: string;
};

export type PostComment = Omit<DBTaskComment, 'id' | 'created_at'>;

export type TaskChanges = {
  id: string;
  task_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  initials: string;
  created_at: string;
};

export type TaskStatus = {
  id: number;
  name: string;
};

export type TaskUser = {
  id: string;
  email: string;
};
