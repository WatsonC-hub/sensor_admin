import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import AlarmNotificationForm from './AlarmNotificationForm';
import {AlarmsFormValues, alarmsSchema} from '../schema';
import {Box, ButtonGroup, Typography} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmTableType} from '../types';
import {useAppContext} from '~/state/contexts';
import {useAlarm} from '../api/useAlarm';
import {toast} from 'react-toastify';
import FormFieldset from '~/components/formComponents/FormFieldset';
import AlarmContactForm from './AlarmContactForm';
import AlarmContactFormDialog from './AlarmContactFormDialog';
import AlarmGroup from './AlarmGroup';
import DeleteAlert from '~/components/DeleteAlert';
import Button from '~/components/Button';

type AlarmFormProps = {
  setOpen: (open: boolean) => void;
  alarm?: AlarmTableType;
};

const Form = createTypedForm<AlarmsFormValues>();

const AlarmForm = ({setOpen, alarm}: AlarmFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const [onGroup, setOnGroup] = useState(alarm?.group_id ? true : false);

  const [contactsCollapsed, setContactsCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftAlarm, setDraftAlarm] = useState<AlarmsFormValues | undefined>(undefined);

  const {post: postAlarm, put: putAlarm} = useAlarm();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('view');

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: alarm?.name || '',
      group_id: alarm?.group_id ?? '',
      notification_ids: alarm?.alarm_notifications ?? [],
      contacts: alarm?.alarm_contacts || [],
      comment: alarm?.comment || '',
    },
    values: alarm && {
      name: alarm.name,
      group_id: alarm.group_id,
      notification_ids: alarm.alarm_notifications,
      contacts: alarm.alarm_contacts,
      comment: alarm.comment,
    },
    mode: 'onTouched',
  });

  const {reset, watch, setValue} = alarmMethods;

  const contacts = watch('contacts');

  const handleDelete = () => {
    handleSubmit(draftAlarm!, true);
    setDeleteDialogOpen(false);
  };

  const handleSubmit = (data: AlarmsFormValues, forceSubmit?: boolean) => {
    if (alarm === undefined) {
      const payload = {
        path: `${ts_id}`,
        data: data,
      };
      postAlarm.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success('Alarm oprettet');
        },
      });
    } else {
      if (
        forceSubmit !== true &&
        alarm?.group_id !== undefined &&
        alarm?.group_id !== '' &&
        (data.group_id === undefined || data.group_id === null || data.group_id === '')
      ) {
        setDeleteDialogOpen(true);
        setDraftAlarm(data);
        return;
      } else {
        setDraftAlarm(undefined);
      }

      const payload = {
        path: `${alarm.id}`,
        data: data,
      };
      putAlarm.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success('Alarm opdateret');
        },
      });
    }
  };

  return (
    <>
      <Form formMethods={alarmMethods}>
        <Form.Input
          name="name"
          label="Navn"
          placeholder="f.eks. Kritiske notifikationer"
          gridSizes={{xs: 12}}
        />
        {!alarm && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle1">Hvor skal alarmen tilknyttes?</Typography>
            <ButtonGroup>
              <Button
                bttype={onGroup ? 'tertiary' : 'primary'}
                onClick={() => {
                  setOnGroup(false);
                  setValue('group_id', null);
                }}
              >
                Tidsserie
              </Button>
              <Button bttype={onGroup ? 'primary' : 'tertiary'} onClick={() => setOnGroup(true)}>
                Gruppe
              </Button>
            </ButtonGroup>
          </Box>
        )}
        {onGroup && <AlarmGroup disableClearable={typeof alarm?.group_id == 'string'} />}
        <AlarmNotificationForm />

        <FormFieldset
          label="Kontakter"
          sx={{width: '100%', px: 1}}
          icon={contactsCollapsed ? <ExpandMore /> : <ExpandLess />}
          onClick={() => setContactsCollapsed(!contactsCollapsed)}
        >
          {!contactsCollapsed && (
            <AlarmContactForm
              setContactDialogOpen={setContactDialogOpen}
              setMode={setMode}
              setCurrentIndex={setCurrentIndex}
            />
          )}
        </FormFieldset>
        <Form.Input
          name="comment"
          label="Kommentar"
          multiline
          rows={3}
          placeholder="f.eks. bruger kontaktes hurtigst muligt..."
          gridSizes={{xs: 12}}
        />
        <Box ml={'auto'} display="flex" gap={1}>
          <Form.Cancel
            cancel={() => {
              setOpen(false);
            }}
          />
          <Form.Submit submit={handleSubmit} />
        </Box>
      </Form>
      <AlarmContactFormDialog
        key={currentIndex} // Force remount to reset form when editing different contact
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        mode={mode}
        setMode={setMode}
        values={contacts}
        setValues={setValue}
        currentIndex={currentIndex}
      />
      <DeleteAlert
        dialogOpen={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDraftAlarm(undefined);
        }}
        setDialogOpen={setDeleteDialogOpen}
        onOkDelete={handleDelete}
        title="Fjernelse af gruppen medfører, at alarmen ikke længere vises på de lokationer, der er knyttet til denne gruppe. Er du sikker på, at du vil fortsætte?"
      />
    </>
  );
};

export default AlarmForm;
