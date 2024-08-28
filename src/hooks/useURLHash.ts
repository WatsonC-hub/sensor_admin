import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export const useURLHash = () => {
  const location = useLocation();
  const [hash, setHash] = useState(location.hash);

  useEffect(() => {
    setHash(location.hash);
  }, [location.hash]);

  const setParam = (value: string) => {
    setHash(value);
    const newUrl = `${window.location.pathname}#${value}`;
    window.history.pushState({}, '', newUrl);
  };

  return [hash, setParam] as const;
};
