import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {
  Box,
  FormControlLabel,
  MenuItem,
  Switch,
  TextFieldProps,
  Typography,
  Dialog,
} from '@mui/material';
import React, {useEffect} from 'react';
import {Controller, FormProvider, useForm, useFormContext, UseFormReturn} from 'react-hook-form';
import {z} from 'zod';

import ExtendedAutocomplete, {AutoCompleteFieldProps} from '~/components/Autocomplete';
import Button from '~/components/Button';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {getNextDueDate, useTasks} from '~/features/tasks/api/useTasks';
import {TaskUser} from '~/features/tasks/types';

import {useTaskStore} from '../api/useTaskStore';
import {merge} from 'lodash';
import {useLocationData} from '~/hooks/query/useMetadata';
import moment from 'moment';
import {toast} from 'react-toastify';

const zodSchema = z.object({
  ts_id: z.number({required_error: 'Tidsserie skal være angivet'}),
  name: z
    .string({required_error: 'Navn skal være angivet'})
    .min(5, 'Navn skal være mindst 5 tegn')
    .max(255, 'Navn må maks være 255 tegn'),
  description: z.string().nullish(),
  status_id: z.number().optional(),
  due_date: z.string().nullish(),
  assigned_to: z
    .string()
    .nullish()
    .transform((value) => (value === '' ? null : value)),
  blocks_notifications: z.array(z.number()).or(z.literal('alle')).optional(),
  block_on_location: z.string().optional(),
  block_all: z.string().optional(),
  loctypename: z.string().optional(),
  tstype_name: z.string().optional(),
  project_text: z.string().nullish(),
  projectno: z.string().nullish(),
  location_name: z.string().optional(),
});

export type FormValues = z.infer<typeof zodSchema>;

type Props = {
  onSubmit: (data: FormValues, formMethods?: UseFormReturn<FormValues>) => void;
  onError?: (error: any) => void;
  defaultValues?: Partial<FormValues>;
  children?: React.ReactNode;
  disabled?: boolean;
  schema?: z.ZodObject<any, any, any>;
};

const TaskFormContext = React.createContext(
  {} as {
    onSubmit: (data: FormValues) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
  }
);

const TaskForm = ({
  onSubmit,
  onError = (error) => console.log(error),
  children,
  defaultValues,
  disabled,
  schema = zodSchema,
}: Props) => {
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });
  const {reset} = formMethods;
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const innerSubmit = (data: FormValues) => {
    onSubmit(data, formMethods);
  };

  return (
    <TaskFormContext.Provider value={{onSubmit: innerSubmit, onError, disabled}}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </TaskFormContext.Provider>
  );
};

const TaskSubmitButton = () => {
  const {onSubmit, onError} = React.useContext(TaskFormContext);

  const {handleSubmit} = useFormContext<FormValues>();

  return (
    <Button bttype="primary" onClick={handleSubmit(onSubmit, onError)} startIcon={<Save />}>
      Gem
    </Button>
  );
};

const Input = (props: FormInputProps<FormValues>) => {
  const {disabled} = React.useContext(TaskFormContext);
  return <FormInput {...props} size="small" disabled={disabled || props.disabled} />;
};

const DueDate = (props: Omit<FormInputProps<FormValues>, 'name'>) => {
  const {disabled} = React.useContext(TaskFormContext);
  return (
    <FormInput
      name="due_date"
      label="Due date"
      type="date"
      size="small"
      placeholder="Sæt forfaldsdato"
      // transform={(value) => {
      //   return moment(value.target.value).toISOString();
      // }}
      {...props}
      disabled={disabled || props.disabled}
    />
  );
};

interface StatusSelectProps extends Omit<FormInputProps<FormValues>, 'name'> {
  disableClosedStatus?: boolean;
}

const StatusSelect = ({disableClosedStatus = false, ...props}: StatusSelectProps) => {
  const {disabled} = React.useContext(TaskFormContext);
  const {
    getStatus: {data: task_status},
  } = useTasks();

  return (
    <FormInput
      name="status_id"
      label="Status"
      select
      size="small"
      placeholder="Vælg status..."
      fullWidth
      {...props}
      disabled={disabled || props.disabled}
    >
      {task_status
        ?.filter((item) => !(disableClosedStatus && item.category == 'closed'))
        .map((status) => {
          return (
            <MenuItem key={status.id} value={status.id}>
              {status.name}
            </MenuItem>
          );
        })}
    </FormInput>
  );
};

const AssignedTo = (props: Partial<AutoCompleteFieldProps<TaskUser>>) => {
  const {disabled} = React.useContext(TaskFormContext);
  const {
    getUsers: {data: taskUsers},
  } = useTasks();
  const {control} = useFormContext<FormValues>();

  const textfieldProps = {
    label: 'Ansvarlig',
    placeholder: 'Vælg opgave ansvarlig',
  };

  let mergedProps: Partial<TextFieldProps> = textfieldProps;
  if (props.textFieldsProps) {
    mergedProps = merge(textfieldProps, props.textFieldsProps);
  }

  return (
    <Controller
      name="assigned_to"
      control={control}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <ExtendedAutocomplete<TaskUser>
          {...props}
          disabled={disabled || props.disabled}
          options={taskUsers ?? []}
          labelKey="display_name"
          error={error?.message}
          size="small"
          onChange={(option) => {
            if (option == null) {
              onChange(null);
              return;
            }
            if ('id' in option) {
              onChange(option.id);
            }
          }}
          selectValue={taskUsers?.find((item) => item.id === value) ?? null}
          filterOptions={(options, params) => {
            const {inputValue} = params;

            const filter = options.filter((option) =>
              option.display_name?.toLowerCase().includes(inputValue.toLowerCase())
            );

            return filter;
          }}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                <Box display={'flex'} flexDirection={'row'}>
                  <Typography variant="body2">{option.display_name}</Typography>
                </Box>
              </li>
            );
          }}
          textFieldsProps={mergedProps}
        />
      )}
    />
  );
};

const AssignedToSelect = (props: Omit<FormInputProps<FormValues>, 'name'>) => {
  const {disabled} = React.useContext(TaskFormContext);
  const {
    getUsers: {data: taskUsers},
  } = useTasks();

  return (
    <FormInput
      name="assigned_to"
      label="Ansvarlig"
      select
      size="small"
      placeholder="Vælg ansvarlig..."
      fullWidth
      {...props}
      disabled={disabled || props.disabled}
    >
      {taskUsers?.map((user) => {
        return (
          <MenuItem key={user.id} value={user.id}>
            {user.display_name}
          </MenuItem>
        );
      })}
    </FormInput>
  );
};

type BlockNotificationsProps = Omit<FormInputProps<FormValues>, 'name'> & {
  notification_id: number | null;
};

const BlockNotifications = ({notification_id, onChangeCallback}: BlockNotificationsProps) => {
  const {disabled} = React.useContext(TaskFormContext);
  const {control} = useFormContext<FormValues>();

  return (
    <Controller<FormValues, 'blocks_notifications'>
      control={control}
      name={'blocks_notifications'}
      render={({field: {value, onChange, ref, name}}) => {
        let switchValue: boolean;
        if (
          value === null ||
          (Array.isArray(value) && notification_id && value.includes(notification_id))
        ) {
          switchValue = false;
        } else {
          switchValue = true;
        }

        return (
          <Box
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'center'}
            height={'100%'}
          >
            <FormControlLabel
              control={
                <Switch
                  ref={ref}
                  checked={switchValue}
                  size="small"
                  color="primary"
                  aria-label={name}
                  disabled={disabled}
                  onChange={(e, value) => {
                    if (value) {
                      onChange('alle');
                    } else {
                      onChange([notification_id]);
                    }
                    if (onChangeCallback) onChangeCallback(e);
                  }}
                />
              }
              label={'Bloker alle notifikationer'}
            />
          </Box>
        );
      }}
    />
  );
};

const BlockOnLocation = (props: Omit<FormInputProps<FormValues>, 'name'>) => {
  const {disabled} = React.useContext(TaskFormContext);
  return (
    <FormInput
      name="block_on_location"
      select
      size="small"
      placeholder="Vælg..."
      // style={{width: 175}}
      {...props}
      disabled={disabled || props.disabled}
    >
      <MenuItem key={'bloker'} value={'false'}>
        tidsserie
      </MenuItem>
      <MenuItem key={'bloker_alle'} value={'true'}>
        lokation
      </MenuItem>
    </FormInput>
    // <Controller<FormValues, 'block_on_location'>
    //   control={control}
    //   name={'block_on_location'}
    //   render={({field: {value, onChange, ref, name}}) => {
    //     return (
    //       <Stack direction="row" alignItems="center" justifyContent="center">
    //         <Typography variant="body2">Tidsserien</Typography>
    //         <FormControlLabel
    //           labelPlacement="top"
    //           control={
    //             <Switch
    //               ref={ref}
    //               checked={value}
    //               size="small"
    //               color="primary"
    //               aria-label={name}
    //               onChange={(e, value) => {
    //                 onChange(value);
    //                 onChangeCallback && onChangeCallback(e);
    //               }}
    //             />
    //           }
    //           label={'Bloker på'}
    //         />
    //         <Typography variant="body2">Lokationen</Typography>
    //       </Stack>
    //     );
    //   }}
    // />
  );
};

const BlockAll = (props: Omit<FormInputProps<FormValues>, 'name'>) => {
  const {selectedTask} = useTaskStore();
  const {disabled} = React.useContext(TaskFormContext);

  return (
    <FormInput
      name="block_all"
      select
      placeholder="Vælg..."
      size="small"
      // style={{width: 175}}
      {...props}
      disabled={disabled || props.disabled}
    >
      <MenuItem key={'bloker'} value={'false'}>
        {selectedTask?.blocks_notifications.length === 0 ? 'ingen' : selectedTask?.name}
      </MenuItem>
      <MenuItem key={'bloker_alle'} value={'true'}>
        alle
      </MenuItem>
    </FormInput>
    // <Stack direction="row" alignItems="center" justifyContent="center">
    //   <Controller<FormValues, 'block_all'>
    //     control={control}
    //     name={'block_all'}
    //     render={({field: {value, onChange, ref, name}}) => {
    //       return (
    //         <FormControlLabel
    //           labelPlacement="top"
    //           control={
    //             <Switch
    //               ref={ref}
    //               checked={value}
    //               size="small"
    //               color="primary"
    //               aria-label={name}
    //               onChange={(e, value) => {
    //                 onChange(value);
    //                 onChangeCallback && onChangeCallback(e);
    //               }}
    //             />
    //           }
    //           label={'Bloker alle notifikationer'}
    //         />
    //       );
    //     }}
    //   />
    // </Stack>
  );
};

const SelectTimeseries = (props: Omit<FormInputProps<FormValues>, 'name'>) => {
  const {disabled} = React.useContext(TaskFormContext);
  const {data: metadata} = useLocationData();

  return (
    <FormInput
      name="ts_id"
      select
      size="small"
      placeholder="Vælg..."
      fullWidth
      {...props}
      disabled={disabled || props.disabled}
    >
      {metadata?.timeseries?.map((timeseries) => {
        return (
          <MenuItem key={timeseries.ts_id} value={timeseries.ts_id}>
            {(timeseries.prefix ? timeseries.prefix + ' - ' : '') + ' ' + timeseries.tstype_name}
          </MenuItem>
        );
      })}
    </FormInput>
  );
};

const DueDateDialog = (
  props: Omit<FormInputProps<FormValues>, 'name'> & {
    ts_id: number;
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
  }
) => {
  const {setValue} = useFormContext<FormValues>();
  const {ts_id, open, onClose, onSubmit} = props;
  const {data: nextDueDate, error, isPending} = getNextDueDate(ts_id, open);

  useEffect(() => {
    if (nextDueDate && open && !isPending) {
      setValue('due_date', moment(nextDueDate).format('YYYY-MM-DD'), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [nextDueDate]);

  useEffect(() => {
    if (error && open && error.response && typeof error.response.data.detail === 'string') {
      toast.error(error.response.data.detail);
      onClose();
    }
  }, [error, open]);

  return (
    <>
      {error === null && !isPending && (
        <Dialog open={open} onClose={onClose}>
          <Box display={'flex'} flexDirection={'column'} gap={2} p={2} alignItems={'center'}>
            <Typography variant="h6">Sæt forfaldsdato til næste kontrol måling</Typography>
            <FormInput name="due_date" label="Forfaldsdato" type="date" size="small" {...props} />
          </Box>
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'flex-end'}
            alignItems={'center'}
            p={2}
          >
            <Button bttype="tertiary" onClick={onClose} sx={{mr: 1}}>
              Luk
            </Button>
            <Button
              bttype="primary"
              onClick={() => {
                onSubmit();
              }}
              startIcon={<Save />}
            >
              Gem
            </Button>
          </Box>
        </Dialog>
      )}
    </>
  );
};

TaskForm.SubmitButton = TaskSubmitButton;
TaskForm.Input = Input;
TaskForm.StatusSelect = StatusSelect;
TaskForm.AssignedTo = AssignedTo;
TaskForm.BlockNotifications = BlockNotifications;
TaskForm.DueDate = DueDate;
TaskForm.BlockOnLocation = BlockOnLocation;
TaskForm.BlockAll = BlockAll;
TaskForm.SelectTimeseries = SelectTimeseries;
TaskForm.AssignedToSelect = AssignedToSelect;
TaskForm.DueDateDialog = DueDateDialog;

export default TaskForm;
