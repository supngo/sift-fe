import { Progress, Tooltip } from '@mantine/core';

/** Green = done, red = failed, remaining grey = still pending or processing. */
export function BatchProgress({ total, done, failed }: { total: number; done: number; failed: number }) {
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return (
    <Tooltip label={`${done} done, ${failed} failed, ${total - done - failed} in progress`}>
      <Progress.Root size="lg">
        <Progress.Section value={pct(done)} color="green" />
        <Progress.Section value={pct(failed)} color="red" />
      </Progress.Root>
    </Tooltip>
  );
}
