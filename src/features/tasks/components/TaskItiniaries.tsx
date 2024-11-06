import React from 'react';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
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
    </div>
  );
};

export default TaskItiniaries;
