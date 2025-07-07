import {QueryClient, matchQuery} from '@tanstack/react-query';

export function invalidateFromMeta(
  queryClient: QueryClient,
  meta?: {invalidates?: Array<ReadonlyArray<string | number | undefined>>}
) {
  const invalidates = meta?.invalidates ?? [];
  if (invalidates.length === 0) return;

  queryClient.invalidateQueries({
    predicate: (query) => {
      return invalidates.some((invalidateKey) => matchQuery({queryKey: invalidateKey}, query));
    },
  });
}
