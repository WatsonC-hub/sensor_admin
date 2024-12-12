import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {GetQueryOptions} from '~/queryClient';
import {baseContactInfo, ContactInfo, ContactTable} from '~/types';

interface ContactInfoBase {
  path: string;
}

interface ContactInfoPost extends ContactInfoBase {
  data: ContactInfo;
}

interface ContactInfoPut extends ContactInfoBase {
  data: ContactTable;
}

export const contactInfoPostOptions = {
  mutationKey: ['contact_info_post'],
  mutationFn: async (mutation_data: ContactInfoPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_field/stamdata/contact/contact_info/${path}`,
      data
    );
    return result;
  },
};

export const contactInfoPutOptions = {
  mutationKey: ['contact_info_put'],
  mutationFn: async (mutation_data: ContactInfoPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(
      `/sensor_field/stamdata/contact/contact_info/${path}`,
      data
    );
    return result;
  },
};

export const contactInfoDelOptions = {
  mutationKey: ['contact_info_del'],
  mutationFn: async (mutation_data: ContactInfoBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(
      `/sensor_field/stamdata/contact/contact_info/${path}`
    );
    return result;
  },
};

export const ContactInfoGetOptions = <TData>(
  loc_id: number | undefined
): GetQueryOptions<TData> => ({
  queryKey: ['contact_info', loc_id],
  queryFn: async () => {
    const {data} = await apiClient.get<TData>(
      `/sensor_field/stamdata/contact/contact_info/${loc_id}`
    );

    return data;
  },
  enabled: loc_id !== undefined && loc_id !== null,
});

export const useSearchContact = (loc_id: number | undefined, searchString: string) => {
  const searched_contacts = useQuery({
    queryKey: ['search_contact_info', searchString],
    queryFn: async () => {
      let data;
      if (searchString == '') {
        const response = await apiClient.get<Array<ContactInfo>>(
          `/sensor_field/stamdata/contact/relevant_contacts/${loc_id}`
        );
        data = response.data;
      } else {
        const response = await apiClient.get<Array<ContactInfo>>(
          `/sensor_field/stamdata/contact/search_contact_info/${searchString}`
        );
        data = response.data;
      }

      return data;
    },
    staleTime: 10 * 1000,
  });
  return searched_contacts;
};

export const useContactInfo = (loc_id: number | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery(ContactInfoGetOptions<Array<ContactTable>>(loc_id));

  const get_all = useQuery({
    queryKey: ['all_contact_info'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<baseContactInfo>>(
        `/sensor_field/stamdata/contact/all_contact_info`
      );

      return data;
    },
  });

  const post = useMutation({
    ...contactInfoPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact_info'],
      });

      toast.success('Kontakt information gemt');
    },
  });

  const put = useMutation({
    ...contactInfoPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact_info'],
      });

      toast.success('Kontakt information ændret');
    },
  });

  const del = useMutation({
    ...contactInfoDelOptions,
    onSuccess: () => {
      toast.success('Kontakt information slettet');
      queryClient.invalidateQueries({
        queryKey: ['contact_info'],
      });
    },
  });

  return {get, get_all, post, put, del};
};
