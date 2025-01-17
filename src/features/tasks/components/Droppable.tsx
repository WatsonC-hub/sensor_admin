import React, {useState, ReactNode, DragEvent} from 'react';

type ChildrenProps = {
  isDraggingOver: boolean;
};

interface DroppableProps<T> {
  onDrop: (event: DragEvent<HTMLDivElement>, data: T) => void;
  children: ({isDraggingOver}: ChildrenProps) => ReactNode;
}

const Droppable = <TData extends object>({onDrop, children}: DroppableProps<TData>) => {
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
    console.log('drop');
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
