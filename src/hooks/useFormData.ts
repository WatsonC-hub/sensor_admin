import {useState} from 'react';

const computeInitialState = (initialState: any) => {
  if (Object.values(initialState).some((value) => typeof value === 'function')) {
    initialState = Object.entries(initialState).reduce((acc: any, [key, value]) => {
      acc[key] = typeof value === 'function' ? value() : value;
      return acc;
    }, {});
  }
  return initialState;
};

export default function useFormData<T>(initialState: T) {
  // if any of the initial state values are functions, call them to get the initial state

  const [formData, setFormData] = useState<T>(initialState);

  const changeFormData = (key: keyof T, value: any) => {
    setFormData({...formData, [key]: value});
  };

  const resetFormData = () => {
    setFormData(computeInitialState(initialState));
  };

  const setFormDataFromObject = (obj: T) => {
    setFormData(obj);
  };

  return [formData, setFormDataFromObject, changeFormData, resetFormData] as const;
}
