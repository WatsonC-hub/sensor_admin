import {useLiveQuery} from 'dexie-react-hooks';
import {useEffect, useMemo, useSyncExternalStore} from 'react';

import {OverfoerselController} from '~/features/fieldObservation/overfoersel/controller';

import type {FieldObservationDb} from '~/features/fieldObservation/db';

const controllers = new WeakMap<FieldObservationDb, OverfoerselController>();

const getController = (db: FieldObservationDb) => {
  let controller = controllers.get(db);
  if (!controller) {
    controller = new OverfoerselController(db);
    controllers.set(db, controller);
  }
  return controller;
};

/** Counts of local rows that are not on the server yet, and rows it rejected. */
export const usePendingCounts = (db: FieldObservationDb) =>
  useLiveQuery(
    async () => {
      const [observations, images, rejectedObservations, rejectedImages] = await Promise.all([
        db.observations.where('dirty').equals(1).count(),
        db.images.where('dirty').equals(1).count(),
        db.observations.where('dirty').equals(-1).count(),
        db.images.where('dirty').equals(-1).count(),
      ]);
      return {
        pending: observations + images,
        rejected: rejectedObservations + rejectedImages,
      };
    },
    [db],
    {pending: 0, rejected: 0}
  );

export const useOverfoersel = (db: FieldObservationDb) => {
  const controller = useMemo(() => getController(db), [db]);
  const state = useSyncExternalStore(controller.subscribe, controller.getState);
  const counts = usePendingCounts(db);

  useEffect(() => {
    void controller.start();
    return () => controller.stop();
  }, [controller]);

  useEffect(() => {
    if (counts.pending > 0) controller.notifyChange();
  }, [controller, counts.pending]);

  return {
    ...state,
    ...counts,
    syncNow: controller.syncNow,
    setMode: (mode: Parameters<OverfoerselController['setMode']>[0]) => controller.setMode(mode),
  };
};
