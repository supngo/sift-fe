import { Alert, Anchor, Paper, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import { describeError } from '../api/client';
import { useBatches } from '../api/hooks';
import { formatTime } from '../lib/format';
import { BatchProgress } from './BatchProgress';
import { StatusBadge } from './StatusBadge';

export function RecentBatches() {
  const { data, error, isPending } = useBatches();
  const navigate = useNavigate();

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack>
        <Title order={3}>Recent batches</Title>

        {error && (
          <Alert color="red" title="Could not load batches">
            {describeError(error)}
          </Alert>
        )}
        {isPending && <Skeleton height={120} />}
        {data && data.length === 0 && <Text c="dimmed">No batches yet. Upload some payloads above.</Text>}

        {data && data.length > 0 && (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Batch</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Payloads</Table.Th>
                <Table.Th w="25%">Progress</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((b) => (
                <Table.Tr
                  key={b.batchId}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/batches/${b.batchId}`)}
                >
                  <Table.Td>
                    <Anchor component={Link} to={`/batches/${b.batchId}`} ff="monospace">
                      {b.batchId}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{formatTime(b.createdAt)}</Table.Td>
                  <Table.Td>
                    {b.payloadCount}
                    {b.failed > 0 && (
                      <Text span c="red" size="sm">
                        {' '}
                        ({b.failed} failed)
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <BatchProgress total={b.payloadCount} done={b.done} failed={b.failed} />
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={b.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Paper>
  );
}
