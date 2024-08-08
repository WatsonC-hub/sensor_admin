import {Box, Divider, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {Noop, useFormContext} from 'react-hook-form';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import type {MultiSelectProps, Ressourcer} from '~/features/stamdata/components/multiselect/types';
import {CategoryType} from '~/helpers/EnumHelper';

function not(a: Ressourcer[], b: Ressourcer[]) {
  return a.filter((value) => b.map((option) => option.navn).indexOf(value.navn) === -1);
}

function intersection(a: Ressourcer[], b: Ressourcer[]) {
  return a.filter((value) => b.map((option) => option.navn).indexOf(value.navn) !== -1);
}

function categoryNot(a: Array<Ressourcer>, b: Array<Ressourcer>) {
  const categoriesA = [...new Set(a.map((ressource) => ressource.kategori))];
  const result = [
    ...new Set(
      categoriesA.filter((category) => {
        const aFiltered = a.filter((ressource) => ressource.kategori === category);
        const bFiltered = b.filter((ressource) => ressource.kategori === category);

        const removeCategory = aFiltered.filter(
          (ressource) => bFiltered.includes(ressource) && aFiltered.length - bFiltered.length === 0
        );
        return removeCategory.length === 0;
      })
    ),
  ];
  return result;
}

interface TransferListProps extends MultiSelectProps {
  value: Array<Ressourcer>;
  setValue: (ressourcer: Array<Ressourcer>) => void;
  onBlur: Noop;
}

export default function TranserList({value, setValue, onBlur}: TransferListProps) {
  const {watch} = useFormContext();
  const {
    get: {data: options},
  } = useRessourcer();

  const tstype_id = watch('timeseries.tstype_id');
  const loctype_id = watch('location.loctype_id');

  const [checked, setChecked] = useState<Ressourcer[]>([]);
  const [selected, setSelected] = useState<Ressourcer[]>(value);
  const [selectedCategory, setSelectedCategory] = useState<Array<string>>([]);
  const [categories] = useState<Array<string>>(
    Object.keys(CategoryType).splice(
      Object.keys(CategoryType).length / 2,
      Object.keys(CategoryType).length
    )
  );

  useEffect(() => {
    if (value && value.length > 0) {
      setSelected(value);
      setSelectedCategory([...new Set(value.map((ressource) => ressource.kategori))]);
    }
  }, [value]);

  useEffect(() => {
    if (
      options &&
      options.length > 0 &&
      (tstype_id !== -1 || loctype_id !== -1) &&
      value.length === 0
    ) {
      const test = options.filter(
        (ressource) =>
          (ressource.loctype_id && ressource.loctype_id.includes(loctype_id)) ||
          (ressource.tstype_id && ressource.tstype_id.includes(tstype_id))
      );
      if (test && test.length > 0) {
        setSelectedCategory([...new Set([...test.map((ressource) => ressource.kategori)])]);
      }
      setSelected(test);
    }
  }, [tstype_id, loctype_id, options, value]);

  let left: Array<Ressourcer> = [];
  if (options) left = not(options ?? [], selected ?? []);
  const leftCategory =
    options && selected
      ? [
          ...new Set(
            options
              .filter(
                (ressource) => selected.map((option) => option.navn).indexOf(ressource.navn) === -1
              )
              .map((ressource) => ressource.kategori)
          ),
        ]
      : [];

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, selected);

  const handleToggle = (ressource: Ressourcer) => () => {
    const currentIndex = checked.map((option) => option.id).indexOf(ressource.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(ressource);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setSelected(options ?? []);
    setValue(options ?? []);
    setSelectedCategory([
      ...new Set(options ? options.map((ressource) => ressource.kategori) : []),
    ]);
  };

  const handleCheckedRight = () => {
    setSelected(selected.concat(leftChecked));
    setValue(selected.concat(leftChecked));
    setChecked(not(checked, leftChecked));
    setSelectedCategory([
      ...new Set(selectedCategory.concat(leftChecked.map((ressource) => ressource.kategori))),
    ]);
  };

  const handleCheckedLeft = () => {
    setSelected(not(selected, rightChecked));
    setValue(not(selected, rightChecked));
    setChecked(not(checked, rightChecked));
    setSelectedCategory(categoryNot(selected, rightChecked));
  };

  const handleAllLeft = () => {
    setSelected([]);
    setValue([]);
    setSelectedCategory([]);
  };

  const customList = (items: Ressourcer[], categoryList: Array<string>, title: string) => {
    return (
      <Paper sx={{width: 300, height: 400, overflow: 'auto', boxShadow: 3}} onBlur={onBlur}>
        <Box display={'flex'} flexDirection={'column'}>
          <Typography align="center" variant="h5" m={0.5}>
            {title}
          </Typography>
          <Divider />
          {options && options.length > 0 && (
            <List dense component="div" role="list" sx={{bgcolor: 'Background.paper'}}>
              {categoryList &&
                categoryList.length > 0 &&
                categoryList
                  .sort((a, b) => {
                    const order = [];
                    for (const key in CategoryType) {
                      order.push(key);
                    }
                    const index1 = order.indexOf(a);
                    const index2 = order.indexOf(b);
                    return index1 - index2;
                  })
                  .map((category) => {
                    const filteredRessources = items.filter(
                      (ressource) => ressource.kategori === category
                    );
                    const labelId = `transfer-list-item-${category}-label`;
                    return (
                      <Box gap={1} display={'flex'} flexDirection={'column'} key={category + 'box'}>
                        <ListItemText id={labelId}>
                          <Typography ml={2} fontWeight={'bold'}>
                            {category}
                          </Typography>
                          {filteredRessources.map((ressource) => {
                            const labelId = `transfer-list-item-${ressource.navn}-label`;
                            return (
                              <ListItemButton
                                key={ressource.navn}
                                role="listitem"
                                onClick={handleToggle(ressource)}
                                sx={{'&:hover': {bgcolor: 'grey.100'}}}
                              >
                                <ListItemIcon sx={{mr: -1.5}}>
                                  <Checkbox
                                    onBlur={onBlur}
                                    checked={
                                      checked
                                        .map((option) => option.navn)
                                        .indexOf(ressource.navn) !== -1
                                    }
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                      'aria-labelledby': labelId,
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={ressource.navn} />
                              </ListItemButton>
                            );
                          })}
                        </ListItemText>
                      </Box>
                    );
                  })}
            </List>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <>
      {options && options.length > 0 && categories && categories.length > 0 && (
        <Grid container my={1} spacing={1} gap={2} justifyContent="center" alignItems="center">
          <Grid item>{customList(left ?? [], leftCategory ?? [], 'Redskaber')}</Grid>
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
                disabled={selected && selected.length === 0}
                aria-label="move all left"
              >
                ≪
              </Button>
            </Grid>
          </Grid>
          <Grid item>
            {customList(selected ?? [], selectedCategory ?? [], 'Udvalgte redskaber')}
          </Grid>
        </Grid>
      )}
    </>
  );
}
