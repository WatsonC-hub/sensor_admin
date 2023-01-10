import {useState} from 'react';

export default function useFormData(initialState) {
  const [formData, setFormData] = useState(initialState);

  const changeFormData = (key, value) => {
    setFormData({...formData, [key]: value});
  };

  const resetFormData = () => {
    setFormData(initialState);
  };

  const setFormDataFromObject = obj => {
    setFormData(obj);
  };

  return [formData, setFormDataFromObject, changeFormData, resetFormData];
}
