import React from 'react';

import {useDrawerContext} from '~/state/contexts';

import {Task} from '../types';

type TaskContentProps = {
  data: Task[];
};

const TaskContent = ({data}: TaskContentProps) => {
  const drawerContext = useDrawerContext();
  return <div>TaskContent</div>;
};

export default TaskContent;
