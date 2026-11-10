import { Accordion, Alert, Anchor, Badge, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from 'react-router';
import { ApiError, describeError } from '../api/client';
import { useBatch } from '../api/hooks';
import { BatchProgress } from '../components/BatchProgress';
import { PayloadDetails } from '../components/PayloadDetails';
import { StatusBadge } from '../components/StatusBadge';
import { namesFor } from '../lib/uploadNames';

export function BatchPage() {
  const { batchId = '' } = useParams();
  const { data, error, isPending } = useBatch(batchId);
  const names = namesFor(batchId);

  const back = (
    <Anchor component={Link} to="/" size="sm">
      ← All batches
    </Anchor>
  );

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Stack>
        {back}
        <Alert color="red" title={notFound ? 'Batch not found' : 'Could not load batch'}>
          {notFound ? `There is no batch ${batchId}.` : describeError(error)}
        </Alert>
      </Stack>
    );
  }
  if (isPending) {
    return (
      <Stack>
        {back}
        <Skeleton height={200} />
      </Stack>
    );
  }

  const done = data.extracts.filter((e) => e.status === 'done').length;
  const failed = data.extracts.filter((e) => e.status === 'failed').length;

  return (
    <Stack>
      {back}
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={3} ff="monospace">
              {data.batchId}
            </Title>
            <StatusBadge status={data.status} />
          </Group>
          <Text size="sm" c="dimmed">
            {data.payloadCount} payload(s): {done} done, {failed} failed,{' '}
            {data.payloadCount - done - failed} in progress
            {data.status === 'busy' && ' · updating every second'}
          </Text>
          <BatchProgress total={data.payloadCount} done={done} failed={failed} />
        </Stack>
      </Paper>

      <Accordion variant="separated" multiple defaultValue={data.payloadCount <= 5 ? data.extracts.map((e) => String(e.payloadIndex)) : []}>
        {data.extracts.map((e) => (
          <Accordion.Item key={e.payloadIndex} value={String(e.payloadIndex)}>
            <Accordion.Control>
              <Group gap="sm" wrap="nowrap">
                <Text fw={500}>#{e.payloadIndex}</Text>
                {names[e.payloadIndex] && (
                  <Text size="sm" c="dimmed" truncate>
                    {names[e.payloadIndex]}
                  </Text>
                )}
                <StatusBadge status={e.status} />
                {e.status === 'done' && (
                  <Text size="sm" c="dimmed">
                    {e.keys.length} key{e.keys.length === 1 ? '' : 's'}
                  </Text>
                )}
                {e.warnings.length > 0 && (
                  <Badge color="yellow" variant="outline" size="sm">
                    {e.warnings.length} warning{e.warnings.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <PayloadDetails payload={e} />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}
