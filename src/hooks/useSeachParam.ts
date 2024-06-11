import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export const useSearchParam = (param: string) => {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useState(
    new URLSearchParams(window.location.search).get(param)
  );

  const setParam = (value: string) => {
    setSearchParam(value);
    const searchParams = new URLSearchParams(window.location.search);
    if (value !== '' && value !== null && value !== undefined) {
      searchParams.set(param, value);
    } else {
      console.log(param);
      searchParams.delete(param);
    }

    if (searchParams.toString() === '') {
      const newUrl = window.location.pathname;
      //   window.history.replaceState({}, '', newUrl);
      navigate(newUrl, {replace: true});
      return;
    }

    // console.log({param, value, searchParams: searchParams.toString()});

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, {replace: true});
  };

  return [searchParam, setParam] as const;
};
