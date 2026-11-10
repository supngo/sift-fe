import { Badge, Loader } from '@mantine/core';

const COLORS: Record<string, string> = {
  // batch
  busy: 'blue',
  completed: 'green',
  // payload
  pending: 'gray',
  processing: 'blue',
  done: 'green',
  failed: 'red',
};

/** Batch status (busy / completed) or payload status (pending / processing / done / failed). */
export function StatusBadge({ status }: { status: string }) {
  const spinning = status === 'busy' || status === 'processing';
  return (
    <Badge
      color={COLORS[status] ?? 'gray'}
      variant="light"
      leftSection={spinning ? <Loader size={10} color={COLORS[status]} /> : undefined}
    >
      {status}
    </Badge>
  );
}
