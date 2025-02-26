import React, {Children} from 'react';
import {Box} from '@mui/material';
import useWindowDimensions from '~/hooks/useWindowDimensions';
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

const WindowManager = ({children, columnWidth}: WindowManagerProps) => {
  const {width} = useWindowDimensions();

  const {isMobile} = useBreakpoints();

  const maxColumns = isMobile ? 1 : Math.floor(width / columnWidth);

  const arrayedChildren = Children.toArray(children).filter(
    (child) => child?.type === Window
  ) as React.ReactElement<WindowProps>[];

  const shownChildren = [];

  let usedColumns = 0;

  console.log('maxColumns', maxColumns);

  for (let index = arrayedChildren.length - 1; index >= 0; index--) {
    const child = arrayedChildren[index];
    if (usedColumns + child.props.size > maxColumns) {
      break;
    }

    if (child.props.show) {
      shownChildren.push(
        React.cloneElement(child, {
          key: index,
        })
      );
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
  size?: number;
  children?: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  fullScreen?: boolean;
};

const Window = ({size = 1, children, show, onClose}: WindowProps) => {
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
