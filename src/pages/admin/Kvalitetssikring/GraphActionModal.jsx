import React from 'react';
import ExcludeModal from './Modals/ExcludeModal';
import LevelCorrectionModal from './Modals/LevelCorrectionModal';
import YRangeModal from './Modals/YRangeModal';

const GraphActionModal = ({modal, closeModal}) => {
  switch (modal) {
    case 'exclude':
      return <ExcludeModal open={true} onClose={closeModal} />;
    case 'yrange':
      return <YRangeModal open={true} onClose={closeModal} />;
    case 'level_correction':
      return <LevelCorrectionModal open={true} onClose={closeModal} />;
    default:
      return null;
  }
};

export default GraphActionModal;
