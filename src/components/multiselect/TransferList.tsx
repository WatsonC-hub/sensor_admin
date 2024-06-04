import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import * as React from 'react';

import type {MultiSelectProps, Option} from '~/components/multiselect/types';

function not(a: Option[], b: Option[]) {
  return a.filter((value) => b.map((option) => option.value).indexOf(value.value) === -1);
}

function intersection(a: Option[], b: Option[]) {
  return a.filter((value) => b.map((option) => option.value).indexOf(value.value) !== -1);
}

interface TransferListProps extends MultiSelectProps {
  label: string;
}

export default function TransferList({
  options,
  value,
  onChange,
  label,
  ...props
}: TransferListProps) {
  const [checked, setChecked] = React.useState<Option[]>([]);

  // const [left, setLeft] = React.useState<Option[]>(options);
  const [selected, setSelected] = React.useState<Option[]>(value);

  const left = not(options, selected);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, selected);

  const handleToggle = (value: Option) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setSelected(options);
  };

  const handleCheckedRight = () => {
    setSelected(selected.concat(leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setSelected(not(selected, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setSelected([]);
  };

  const customList = (items: Option[]) => (
    <Paper sx={{width: 200, height: 230, overflow: 'auto'}}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.value}-label`;

          return (
            <ListItemButton key={value.value} role="listitem" onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.title} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList(left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{my: 0.5}}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            sx={{my: 0.5}}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{my: 0.5}}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            sx={{my: 0.5}}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={selected.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(selected)}</Grid>
    </Grid>
  );
}
