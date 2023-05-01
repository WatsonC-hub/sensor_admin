import React from 'react';
import {TreeView, TreeItem} from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  PriorityHighOutlined,
  ErrorOutlineOutlined,
} from '@mui/icons-material';
import {Typography, Box, Button} from '@mui/material';

const data = {
  id: 'root',
  name: 'Ændringer',
  children: [
    {
      id: '1',
      name: 'minmax-cutoff',
      children: [
        {
          id: '2',
          name: 'min -0.4, max 0.4',
        },
      ],
    },
    {
      id: '3',
      name: 'exclude-data',
      children: [
        {
          id: '4',
          name: '09/03/2021-13/06/2021',
        },
      ],
    },
    {
      id: '5',
      name: 'minmax-cutoff',
      children: [
        {
          id: '6',
          name: 'min -0.4, max 0.4',
        },
      ],
    },
    {
      id: '7',
      name: 'exclude-data',
      children: [
        {
          id: '8',
          name: '09/03/2021-13/06/2021',
        },
      ],
    },
    {
      id: '9',
      name: 'minmax-cutoff',
      children: [
        {
          id: '10',
          name: 'min -0.4, max 0.4',
        },
      ],
    },
    {
      id: '11',
      name: 'exclude-data',
      children: [
        {
          id: '12',
          name: '09/03/2021-13/06/2021',
        },
      ],
    },
  ],
};

export default function QAHistory() {
  const [expanded, setExpanded] = React.useState([]);

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleCollapseClick = () => {
    setExpanded((oldExpanded) => {
      if (oldExpanded.length !== 0) oldExpanded = [];
      return oldExpanded;
    });
  };

  return (
    <Box sx={{height: 270, flexGrow: 1}}>
      <Typography variant="h5" component="h3">
        Ændringshistorik
      </Typography>
      <Button onClick={handleCollapseClick}>{expanded.length === 0 ? '' : 'Collapse all'}</Button>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        onNodeToggle={handleToggle}
      >
        {renderTree(data)}
      </TreeView>
    </Box>
  );
}
