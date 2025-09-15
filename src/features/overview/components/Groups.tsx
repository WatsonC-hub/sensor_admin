import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import useGroups, {Group, Location} from '../api/useGroups';
import {Group as LocationGroup} from '~/types';
import {Box, Dialog, Link, Typography} from '@mui/material';
import LookupTable from './LookupTable';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {HighlightedText} from '../utils';
import RenderActions from '~/helpers/RowActions';
import {z} from 'zod';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import ExtendedAutocomplete from '~/components/Autocomplete';
import {zodResolver} from '@hookform/resolvers/zod';
import Button from '~/components/Button';
import {Save} from '@mui/icons-material';
import DeleteAlert from '~/components/DeleteAlert';
import {toast} from 'react-toastify';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const editGroupSchema = z.object({
  id: z.string(),
});

type EditGroup = z.infer<typeof editGroupSchema>;

const Groups = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingLocation, setEditingLocation] = useState<boolean>(false);
  const [addingLocation, setAddingLocation] = useState<boolean>(false);
  const [removeLocation, setRemoveLocation] = useState<boolean>(false);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const {location} = useNavigationFunctions();

  const formMethods = useForm<EditGroup>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      id: '',
    },
    mode: 'onSubmit',
  });

  const {handleSubmit, watch, control, setValue, reset} = formMethods;

  const {
    get: {data: groups},
    get_group_options: {data: groupOptions},
    add_location,
    move_location,
    remove_location,
  } = useGroups();

  const columns = useMemo<MRT_ColumnDef<Group>[]>(
    () => [
      {
        accessorKey: 'group_name',
        header: 'Gruppenavn',
        Cell: ({cell}) => (
          <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
        ),
      },
    ],
    [globalFilter]
  );

  const subRowColumns = useMemo<MRT_ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: 'loc_name',
        header: 'Lokationsnavn',
        Cell: ({cell, row}) => (
          <Link
            onClick={() => {
              location(row.original.loc_id, true, false);
            }}
          >
            <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
          </Link>
        ),
      },
      {
        accessorKey: 'loctype',
        header: 'Lokationstype',
        Cell: ({cell}) => (
          <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
        ),
      },
    ],
    [globalFilter]
  );

  const options: Partial<MRT_TableOptions<Group>> = {
    filterFns: {
      customFilter: (row, columnId, filterValue) => {
        const originalRow: Group = row.original;
        const value = row.getValue(columnId);
        if (typeof value === 'string' && value.toLowerCase().includes(filterValue.toLowerCase())) {
          return true;
        } else {
          return originalRow.locations
            ? originalRow.locations.some(
                (item) =>
                  item.loc_name.toLowerCase().includes(filterValue.toLowerCase()) ||
                  item.loctype.toLowerCase().includes(filterValue.toLowerCase())
              )
            : false;
        }
      },
    },
    globalFilterFn: 'customFilter',
    getRowCanExpand: (row) => {
      return row.original.locations !== null && row.original.locations.length > 0;
    },
    renderDetailPanel: ({row}) => {
      const group = row.original;
      if (!group.locations || group.locations.length === 0) {
        return undefined;
      }

      const editToGroup = watch('id');

      const resetToDefault = () => {
        setEditingLocation(false);
        setLocationId(undefined);
        setRemoveLocation(false);
        setAddingLocation(false);
        reset();
      };

      const onSubmit = (data: EditGroup) => {
        if (editingLocation) {
          const id = groups?.find((g) => g.locations?.some((loc) => loc.loc_id === locationId))?.id;
          const payload = {
            path: `${data.id}`,
            data: {
              group_id: id ?? '',
              loc_id: locationId,
            },
          };

          move_location.mutate(payload, {
            onSuccess: () => {
              resetToDefault();
            },
          });
        }

        if (addingLocation) {
          if (
            groups
              ?.find((g) => g.id === data.id)
              ?.locations?.some((loc) => loc.loc_id === locationId)
          ) {
            toast.error('Lokationen er allerede i den valgte gruppe');
            return;
          }

          const payload = {
            path: `${data.id}`,
            data: {
              loc_id: locationId,
            },
          };

          add_location.mutate(payload, {
            onSuccess: () => {
              resetToDefault();
            },
          });
        }
      };

      const onDelete = (id: string) => {
        const payload = {
          path: `${id}`,
          data: {
            loc_id: locationId,
          },
        };

        remove_location.mutate(payload, {
          onSuccess: () => {
            resetToDefault();
          },
        });
      };

      const options: Partial<MRT_TableOptions<Location>> = {
        enableColumnActions: false,
        enableColumnFilters: false,
        enableDensityToggle: false,
        enableGlobalFilter: false,
        positionActionsColumn: 'last',
        enableRowActions: true,
        enableHiding: false,
        enablePagination: false,
        enableSorting: false,
        enableTopToolbar: false,
        renderRowActions: ({row}) => (
          <RenderActions
            handleAdd={() => {
              setLocationId(row.original.loc_id);
              setAddingLocation(true);
            }}
            handleEdit={() => {
              setLocationId(row.original.loc_id);
              setEditingLocation(true);
            }}
            onDeleteBtnClick={() => {
              setLocationId(row.original.loc_id);
              setRemoveLocation(true);
            }}
          />
        ),
      };

      return (
        <Box>
          <MaterialReactTable
            table={LookupTable<Location>(group.locations ?? [], subRowColumns, false, options)}
          />
          {editingLocation ||
            (addingLocation && (
              <Dialog
                open={editingLocation || addingLocation}
                onClose={() => {
                  resetToDefault();
                }}
                fullWidth
                maxWidth="sm"
              >
                <Box p={2}>
                  <h2>Flyt lokation til</h2>
                  <FormProvider {...formMethods}>
                    <Controller
                      control={control}
                      name="id"
                      render={() => (
                        <ExtendedAutocomplete<LocationGroup>
                          options={groupOptions ?? []}
                          labelKey="group_name"
                          selectValue={groupOptions?.find((g) => g.id === editToGroup) ?? null}
                          getOptionLabel={(option) => option.group_name}
                          onChange={(option) => {
                            if (option == null) {
                              return;
                            }
                            if ('id' in option) {
                              setValue('id', option.id);
                            }
                          }}
                          textFieldsProps={{
                            label: 'Group ID',
                            placeholder: 'Select a group...',
                          }}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option.id + ' - ' + option.group_name}>
                                <Box display={'flex'} flexDirection={'column'}>
                                  <Typography>{option.group_name}</Typography>
                                </Box>
                              </li>
                            );
                          }}
                        />
                      )}
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                      <Button
                        bttype="tertiary"
                        onClick={() => {
                          resetToDefault();
                        }}
                      >
                        Annuller
                      </Button>
                      <Button
                        bttype="primary"
                        startIcon={<Save />}
                        onClick={handleSubmit(onSubmit, (error) => console.log(error))}
                      >
                        Gem
                      </Button>
                    </Box>
                  </FormProvider>
                </Box>
              </Dialog>
            ))}
          {removeLocation && (
            <DeleteAlert
              title="Er du sikker på at du vil fjerne lokationen fra gruppen?"
              measurementId={group.id}
              dialogOpen={removeLocation}
              setDialogOpen={setRemoveLocation}
              onOkDelete={(id) => typeof id === 'string' && onDelete(id)}
            />
          )}
        </Box>
      );
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
    },
    state: {globalFilter},
    onGlobalFilterChange: setGlobalFilter,
  };

  const table = LookupTable<Group>(groups ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Groups;
