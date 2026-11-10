import { Alert, Badge, Code, Group, Loader, Stack, Table, Text } from '@mantine/core';
import type { PayloadExtract } from '../api/client';

/** Everything about one payload: progress while busy, then keys, documents, warnings and errors. */
export function PayloadDetails({ payload }: { payload: PayloadExtract }) {
  const { status, keys, documents, warnings, error } = payload;

  if (status === 'pending' || status === 'processing') {
    return (
      <Stack gap="xs">
        <Group gap="xs">
          <Loader size="xs" />
          <Text size="sm">{status === 'pending' ? 'Waiting for a worker…' : 'Extracting…'}</Text>
        </Group>
        {error && (
          <Alert color="yellow" title={`Last attempt failed (${error.code}); will retry`}>
            {error.message}
          </Alert>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {status === 'failed' && error && (
        <Alert color="red" title={`Extraction failed: ${error.code}`}>
          <Code block>{error.message}</Code>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert color="yellow" title="The extractor hit a limit, so the keys may be incomplete">
          <Group gap="xs">
            {warnings.map((w) => (
              <Badge key={w} color="yellow" variant="outline">
                {w}
              </Badge>
            ))}
          </Group>
        </Alert>
      )}

      {status === 'done' && keys.length === 0 && (
        <Alert color="gray" title="No JSON found">
          The payload was scanned but contains no JSON object with keys (or the JSON isn't valid UTF-8).
        </Alert>
      )}

      {keys.length > 0 && (
        <div>
          <Text size="sm" fw={500} mb={6}>
            Keys
          </Text>
          <Group gap={6}>
            {keys.map((k) => (
              <Badge key={k} variant="light" tt="none">
                {k}
              </Badge>
            ))}
          </Group>
        </div>
      )}

      {documents.map((doc, i) => (
        <div key={i}>
          <Group gap="xs" mb={6}>
            <Text size="sm" fw={500}>
              JSON document {i + 1}
            </Text>
            <Text size="xs" c="dimmed">
              bytes {doc.start}–{doc.end}
            </Text>
            {doc.partial && (
              <Badge size="xs" color="orange" variant="light">
                partial (payload ended mid-object)
              </Badge>
            )}
          </Group>
          <Table withTableBorder fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Path</Table.Th>
                <Table.Th>Key</Table.Th>
                <Table.Th w={80}>Depth</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {doc.keys.map((k) => (
                <Table.Tr key={k.path}>
                  <Table.Td ff="monospace">{k.path}</Table.Td>
                  <Table.Td>{k.name}</Table.Td>
                  <Table.Td>{k.depth}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      ))}
    </Stack>
  );
}
