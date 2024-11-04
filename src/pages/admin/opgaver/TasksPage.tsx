import React from 'react';

import NavBar from '~/components/NavBar';

import TasksTable from './TasksTable';

const TasksPage = () => {
  return (
    <>
      <NavBar />
      <TasksTable />
    </>
  );
};

export default TasksPage;
