import React from 'react';
import {Route, Routes, useNavigate, useLocation} from 'react-router-dom';
import AdminChooser from './Overview/AdminChooser';
import QualityAssurance from './Kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from './Kvalitetssikring/QualityAssuranceOverview';
import {RemoveCircleOutlineSharp} from '@mui/icons-material';
import NotificationPage from 'src/pages/admin/Notifikationer/NotificationPage';
import UserAdmin from 'src/pages/admin/Brugerstyring/UserAdmin';

const SensorAdmin = () => {
  return (
    <>
      <div style={{padding: '5px'}}></div>
      <Routes>
        <Route path="/" element={<AdminChooser />} />
        <Route path="/kvalitetssikring" element={<QualityAssuranceOverview />} />
        <Route path="/kvalitetssikring/:ts_id" element={<QualityAssurance />} />
        <Route path="/notifikationer" element={<NotificationPage />} />
        <Route path="/brugerstyring" element={<UserAdmin />} />
      </Routes>
    </>
  );
};

export default SensorAdmin;
