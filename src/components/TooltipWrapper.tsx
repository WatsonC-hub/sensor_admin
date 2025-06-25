import {Box, Link, Tooltip} from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import React from 'react';

type Props = {
  // Define the props for TooltipWrapper here
  // For example:
  description?: string;
  url?: string;
  children: React.ReactNode;
  // Add any other props you need
  color?: string;
};

const TooltipWrapper = ({description = '', url, children, color = 'grey.700'}: Props) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      alignContent="center"
      justifyContent="space-between"
      gap={1}
    >
      {children}
      <Tooltip title={description} arrow enterTouchDelay={0}>
        {url ? (
          <Link
            href={url}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {description && (
              <InfoOutlined
                sx={{
                  color: color,
                }}
              />
            )}
            <OpenInNewOutlinedIcon
              sx={{
                color: color,
              }}
            />
          </Link>
        ) : (
          <Box
            display="flex"
            sx={{
              cursor: 'help',
            }}
          >
            <InfoOutlined
              sx={{
                cursor: 'help',
                color: color,
              }}
            />
          </Box>
        )}
      </Tooltip>
    </Box>
  );
};

export default TooltipWrapper;
