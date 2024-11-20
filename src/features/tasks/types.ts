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

// const example = {
//   id: '07e2a045-e473-4a6f-9097-d9f622542a19',
//   ts_id: 5,
//   loc_id: 235,
//   location_name: 'Brabrand3 (89.9818)',
//   longitude: 10.132173443382065,
//   latitude: 56.135061343687596,
//   name: 'Skal hjemtages',
//   description: null,
//   status_id: 1,
//   due_date: '2024-04-22',
//   assigned_to: '137180100004673',
//   assigned_display_name: 'mon@watsonc.dk',
//   blocks_notifications: [],
//   created_by: '137180100004635',
//   created_display_name: 'saw@watsonc.dk',
//   created_at: '2024-11-13T14:56:04.365848+01:00',
//   updated_at: '2024-11-20T13:16:27.758672+01:00',
//   status_name: 'Åbent',
//   status_category: 'unstarted',
//   tstype_name: 'Vandstand',
//   loctypename: 'Våd natur',
//   projectno: '18.0017',
//   project_text: 'Aarhus Vand Forsyning A/S ',

// };

export type Task = {
  id: ID;
  ts_id: number;
  loc_id: number;
  location_name: string;
  longitude: number;
  latitude: number;
  name: string;
  description: string | null;
  status_id: number;
  status_name: string;
  status_category: 'unstarted' | 'started' | 'closed';
  due_date: string | null;
  assigned_to: string | null;
  assigned_display_name: string | null;
  blocks_notifications: number[];
  created_by: string;
  created_display_name: string;
  created_at: string;
  updated_at: string;
  tstype_name: string;
  loctypename: string;
  projectno: string | null;
  project_text: string | null;
};

export type DBTask = {
  id: number;
  ts_id: number;
  name: string;
  description?: string | null | undefined;
  status_id: number;
  due_date: string | null;
  assigned_to: string | null;
  blocks_notifications: number[];
  created_by: string;
};

export type PatchTask = Partial<Omit<DBTask, 'id' | 'blocks_notifications' | 'created_by'>>;

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
  display_name: string;
};
