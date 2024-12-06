import {Typography} from '@mui/material';
import React from 'react';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/store';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<string[]>([]);
  const {selectedLocIds} = useTaskStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const {taskManagement} = useNavigationFunctions();
  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        console.log('DROP');
        console.log(e.dataTransfer.getData('text/plain'));
        setIds((prev) => [...prev, e.dataTransfer.getData('text/plain')]);
        setIsDragging(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        console.log('DRAG OVER');
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        console.log('DRAG LEAVE');
        setIsDragging(false);
      }}
      style={{
        height: '100%',
        width: '100%',
        border: '1px solid black',
      }}
    >
      TaskItiniaries
      {isDragging && ids.map((id) => <div key={id}>{id}</div>)}
      <Button
        bttype="primary"
        size="large"
        onClick={() => {
          taskManagement(JSON.stringify(selectedLocIds));
        }}
        disabled={selectedLocIds.length === 0}
      >
        <Typography>Ny tur</Typography>
      </Button>
    </div>
  );
};

export default TaskItiniaries;
