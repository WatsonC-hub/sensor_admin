import {useRawTaskStore} from '~/features/tasks/store';

const useUIState = () => {
  const selectedTaskId = useRawTaskStore((state) => state.selectedTaskId);

  return {
    selectedTaskId,
  };
};

export default useUIState;
