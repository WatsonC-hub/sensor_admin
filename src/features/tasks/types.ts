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

export type Task = {
  id: string;
  assigned_to: number;
  status: number;
  due_date: string;
  loc_id: number;
  ts_id: number;
  opgave: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type TaskItiniary = {
  tasks: Pick<Task, 'id'>[];
  due_date: string;
  assigned_to: number;
};
