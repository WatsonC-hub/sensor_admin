import React, {useState, ReactNode, DragEvent, useRef} from 'react';

type ChildrenProps = {
  isDraggingOver: boolean;
};

interface DroppableProps {
  onDrop: (event: DragEvent<HTMLDivElement>, data: object) => void;
  children: ({isDraggingOver}: ChildrenProps) => ReactNode;
}

const Droppable: React.FC<DroppableProps> = ({onDrop, children}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    console.log('drop   ');
    event.preventDefault();
    setIsDraggingOver(false);
    onDrop(event, JSON.parse(event.dataTransfer.getData('text/plain')));
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      {children({isDraggingOver})}
    </div>
  );
};

export default Droppable;
