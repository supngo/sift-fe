import { Stack } from '@mantine/core';
import { RecentBatches } from '../components/RecentBatches';
import { UploadPanel } from '../components/UploadPanel';

export function HomePage() {
  return (
    <Stack gap="xl">
      <UploadPanel />
      <RecentBatches />
    </Stack>
  );
}
