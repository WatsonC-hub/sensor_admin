import React, {Children, cloneElement, useEffect, useState} from 'react';
import {Box} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

type WindowManagerProps = {
  children: React.ReactElement<WindowProps>[];
  columnWidth: number;
};

type Context = {
  columnWidth?: number;
};

const WindowContext = React.createContext<Context>({});

const useWindowContext = () => React.useContext(WindowContext);

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

const useColumns = (columnWidth: number) => {
  const {isMobile} = useBreakpoints();
  const [maxColumns, setMaxColumns] = useState(
    isMobile ? 1 : Math.floor(getWindowDimensions().width / columnWidth)
  );

  useEffect(() => {
    function handleResize() {
      const newMaxColumns = isMobile ? 1 : Math.floor(getWindowDimensions().width / columnWidth);

      setMaxColumns((prev) => {
        if (prev !== newMaxColumns) {
          return newMaxColumns;
        }
        return prev;
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return maxColumns;
};

const WindowManager = ({children, columnWidth}: WindowManagerProps) => {
  //   const {width} = useWindowDimensions();

  //   const {isMobile} = useBreakpoints();

  const maxColumns = useColumns(columnWidth);

  const arrayedChildren = Children.toArray(children).filter(
    (child) => typeof child == 'object' && 'type' in child && child.type === Window
  ) as React.ReactElement<WindowProps>[];

  const shownChildren = [];

  let usedColumns = 0;

  for (let index = arrayedChildren.length - 1; index >= 0; index--) {
    const child = arrayedChildren[index];

    if (child.props.show) {
      if (usedColumns + child.props.size > maxColumns) {
        break;
      }
      shownChildren.push(cloneElement(child));
      usedColumns += child.props.size;
    }
  }

  return (
    <WindowContext.Provider value={{columnWidth}}>
      <Box
        zIndex={402}
        // position={'absolute'}
        height={'100%'}
        // width={'100%'}
        sx={{
          pointerEvents: 'none',
          ml: 'auto',
          mr: 0,
          display: 'flex',
          flexDirection: 'row-reverse',
        }}
      >
        {shownChildren.slice().reverse()}
      </Box>
    </WindowContext.Provider>
  );
};

type WindowProps = {
  size: number;
  children?: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  fullScreen?: boolean;
};

const Window = ({size, children, show, onClose}: WindowProps) => {
  const {columnWidth} = useWindowContext();
  if (!columnWidth) {
    throw new Error('Window must be a child of WindowManager');
  }

  if (!show) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        maxHeight: '100%',
        overflow: 'auto',
        border: '1px solid black',
        width: columnWidth * size,
        backgroundColor: 'white',
      }}
    >
      {onClose != undefined && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,

            cursor: 'pointer',
            backgroundColor: 'red',
            color: 'white',
            padding: 1,
          }}
          onClick={onClose}
        >
          Close
        </Box>
      )}
      {children}
    </Box>
  );
};

WindowManager.Window = Window;

export default WindowManager;
