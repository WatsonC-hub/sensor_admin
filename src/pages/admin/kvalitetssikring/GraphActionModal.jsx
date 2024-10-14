import React from 'react';

import ExcludeModal from '~/pages/admin/kvalitetssikring/modals/ExcludeModal';
import LevelCorrectionModal from '~/pages/admin/kvalitetssikring/modals/LevelCorrectionModal';
import YRangeModal from '~/pages/admin/kvalitetssikring/modals/YRangeModal';

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
