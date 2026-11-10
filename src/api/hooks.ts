import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, getBatch, isBackendReady, listBatches, uploadFiles } from './client';

/** Recent batches. Polls fast while any batch is busy, slowly otherwise. */
export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: () => listBatches(50),
    refetchInterval: (q) => (q.state.data?.some((b) => b.status === 'busy') ? 1500 : 10_000),
  });
}

/** One batch with its keys. Polls every second until the batch is completed, then stops. */
export function useBatch(batchId: string) {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => getBatch(batchId),
    refetchInterval: (q) => (q.state.data?.status === 'completed' ? false : 1000),
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 3,
  });
}

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batches'] }),
  });
}

export function useBackendReady() {
  return useQuery({ queryKey: ['ready'], queryFn: isBackendReady, refetchInterval: 10_000 });
}
