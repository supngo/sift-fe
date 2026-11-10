import { ActionIcon, Button, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { describeError } from '../api/client';
import { useUpload } from '../api/hooks';
import { formatBytes } from '../lib/format';
import { rememberNames } from '../lib/uploadNames';

/** Pick files, upload them as one batch, then open that batch. */
export function UploadPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const upload = useUpload();
  const navigate = useNavigate();

  const empty = files.filter((f) => f.size === 0);

  const submit = () => {
    upload.mutate(files, {
      onSuccess: (res) => {
        rememberNames(res.batchId, files.map((f) => f.name));
        notifications.show({
          color: 'green',
          title: 'Uploaded',
          message: `Batch ${res.batchId} with ${res.payloadCount} payload(s). Extraction is running.`,
        });
        setFiles([]);
        navigate(`/batches/${res.batchId}`);
      },
      onError: (e) => notifications.show({ color: 'red', title: 'Upload failed', message: describeError(e) }),
    });
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack>
        <div>
          <Title order={3}>Upload payloads</Title>
          <Text c="dimmed" size="sm">
            Each file is one payload. Several files are sent together as one batch, in the order listed.
          </Text>
        </div>

        <Dropzone onDrop={(dropped) => setFiles((prev) => [...prev, ...dropped])} multiple>
          <Stack align="center" gap={4} py="lg" style={{ pointerEvents: 'none' }}>
            <Dropzone.Idle>
              <Text fw={500}>Drop binary files here, or click to choose</Text>
            </Dropzone.Idle>
            <Dropzone.Accept>
              <Text fw={500}>Release to add</Text>
            </Dropzone.Accept>
            <Text size="xs" c="dimmed">
              Up to 64 MB per file
            </Text>
          </Stack>
        </Dropzone>

        {files.length > 0 && (
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>#</Table.Th>
                <Table.Th>File</Table.Th>
                <Table.Th w={120}>Size</Table.Th>
                <Table.Th w={50} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {files.map((f, i) => (
                <Table.Tr key={`${f.name}-${i}`}>
                  <Table.Td>{i}</Table.Td>
                  <Table.Td>{f.name}</Table.Td>
                  <Table.Td c={f.size === 0 ? 'red' : undefined}>{formatBytes(f.size)}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    >
                      ✕
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {empty.length > 0 && (
          <Text size="sm" c="red">
            Empty files are rejected by the backend. Remove: {empty.map((f) => f.name).join(', ')}
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" disabled={files.length === 0 || upload.isPending} onClick={() => setFiles([])}>
            Clear
          </Button>
          <Button
            loading={upload.isPending}
            disabled={files.length === 0 || empty.length > 0}
            onClick={submit}
          >
            Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
