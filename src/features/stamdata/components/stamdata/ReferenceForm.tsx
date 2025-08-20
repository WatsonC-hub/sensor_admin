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
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import {initialWatlevmpData} from './const';
import {Maalepunkt} from '~/types';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {zodDayjs} from '~/helpers/schemas';
import dayjs from 'dayjs';

const schema = z
  .object({
    gid: z.number().optional(),
    startdate: zodDayjs('Start dato skal være udfyldt'),
    enddate: zodDayjs('Slut dato skal være udfyldt').default(dayjs('2099-01-01')),
    elevation: z.number().nullable(),
    mp_description: z.string().optional(),
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
  const {isMobile} = useBreakpoints();
  const [showForm, setShowForm] = useShowFormState();

  const {data: safeParsedData} = schema.safeParse(initialWatlevmpData());

  const formMethods = useForm<WatlevMPFormValues>({
    resolver: zodResolver(schema),
    defaultValues: safeParsedData,
    mode: 'onTouched',
  });

  const {reset} = formMethods;

  const {
    feature_permission_query: {data: permissions},
    location_permissions,
  } = usePermissions(loc_id);

  const disabled = permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit';

  const {del: deleteWatlevmp} = useMaalepunkt();

  const handleDeleteMaalepunkt = (gid: number | undefined) => {
    deleteWatlevmp.mutate({path: `${ts_id}/${gid}`});
  };

  const handleEdit = (data: Maalepunkt) => {
    const {data: parsedData} = schema.safeParse(data);
    reset(parsedData);
    setShowForm(true);
  };

  return (
    <>
      <StationPageBoxLayout>
        {showForm && <WatlevMPForm formMethods={formMethods} />}
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
      </StationPageBoxLayout>
      <FabWrapper
        icon={<AddCircle />}
        text="Tilføj målepunkt"
        disabled={disabled}
        onClick={() => {
          setShowForm(true);
        }}
        sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
      />
    </>
  );
}
