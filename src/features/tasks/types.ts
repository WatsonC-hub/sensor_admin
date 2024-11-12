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
  assigned_to: number;
  assigned_last_name: string;
  blocks_notifications: number[];
  created_by: string;
  created_last_name: string;
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
  assigned_to: number;
  blocks_notifications: number[];
  created_by: string;
};

export type PatchTask = Partial<Omit<DBTask, 'id'>>;

export type PostTask = Omit<DBTask, 'id'>;

export type TaskItiniary = {
  tasks: Pick<Task, 'id'>[];
  due_date: string;
  assigned_to: number;
};

export type TaskStatus = {
  id: number;
  name: string;
};
