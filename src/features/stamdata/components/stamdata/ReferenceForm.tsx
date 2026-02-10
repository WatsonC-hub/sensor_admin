import {zodResolver} from '@hookform/resolvers/zod';
import {AddCircle} from '@mui/icons-material';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import FabWrapper from '~/components/FabWrapper';

import MaalepunktTableDesktop from '~/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/components/tableComponents/MaalepunktTableMobile';
import usePermissions from '~/features/permissions/api/usePermissions';
import WatlevMPForm from '~/features/station/components/watlevmp/WatlevMPForm';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import {initialWatlevmpData} from './const';
import {Maalepunkt} from '~/types';
import {zodDayjs} from '~/helpers/schemas';
import dayjs from 'dayjs';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useEffect} from 'react';
import {stationPages} from '~/helpers/EnumHelper';
import JupiterMPTable from './JupiterMPTable';
import {Box} from '@mui/material';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';

const schema = z
  .object({
    gid: z.number().optional(),
    startdate: zodDayjs('Start dato skal være udfyldt'),
    enddate: zodDayjs('Slut dato skal være udfyldt').default(dayjs('2099-01-01')),
    elevation: z
      .number({required_error: 'Pejlepunkt skal være udfyldt'})
      .optional()
      .refine((val) => val !== null && val !== undefined, {
        message: 'Pejlepunkt skal være udfyldt',
      }),
    mp_description: z.string().nullish(),
  })
  .superRefine(({enddate, startdate}, ctx) => {
    if (enddate && startdate && enddate.isBefore(startdate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Slut dato skal være efter start dato',
        path: ['enddate'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start dato skal være før slut dato',
        path: ['startdate'],
      });
    }
  });
export type WatlevMPFormValues = z.infer<typeof schema>;

export default function ReferenceForm() {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const [, setPageToShow] = useStationPages();
  const {isMobile} = useBreakpoints();
  const [showForm, setShowForm] = useShowFormState();
  const {data: metadata} = useTimeseriesData(ts_id);
  const {del: deleteWatlevmp} = useMaalepunkt(ts_id);

  const formMethods = useForm<WatlevMPFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialWatlevmpData(),
    mode: 'onTouched',
  });

  const {reset} = formMethods;

  const {
    feature_permission_query: {data: permissions},
    location_permissions,
  } = usePermissions(loc_id);

  const disabled = permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit';

  const handleDeleteMaalepunkt = (gid: number | undefined) => {
    deleteWatlevmp.mutate({path: `${ts_id}/${gid}`});
  };

  const handleEdit = (data: Maalepunkt) => {
    const {data: parsedData} = schema.safeParse({
      ...data,
      mp_description: data.mp_description ?? '',
    });
    reset(parsedData);
    setShowForm(true);
  };

  useEffect(() => {
    // Close the form when ts_id changes
    if (metadata?.tstype_id !== 1) {
      setPageToShow(stationPages.PEJLING);
      setShowForm(null);
    }
  }, [ts_id]);

  return (
    <>
      {metadata?.loctype_id === 9 && <JupiterMPTable />}
      {showForm === true && <WatlevMPForm formMethods={formMethods} />}
      {isMobile ? (
        <MaalepunktTableMobile
          handleEdit={handleEdit}
          handleDelete={handleDeleteMaalepunkt}
          disabled={disabled}
        />
      ) : (
        <MaalepunktTableDesktop
          handleEdit={handleEdit}
          handleDelete={handleDeleteMaalepunkt}
          disabled={disabled}
        />
      )}
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={2}>
        <UpdateProgressButton loc_id={loc_id} ts_id={ts_id} progressKey="watlevmp" alterStyle />
        <FabWrapper
          icon={<AddCircle />}
          text="Tilføj målepunkt"
          disabled={disabled}
          onClick={() => {
            setShowForm(true);
          }}
          sx={{visibility: showForm === null ? 'visible' : 'hidden', ml: 0}}
        />
      </Box>
    </>
  );
}
