import { Anchor, AppShell, Badge, Container, Group, Title } from '@mantine/core';
import { Link, Route, Routes } from 'react-router';
import { API_BASE_URL } from './api/client';
import { useBackendReady } from './api/hooks';
import { BatchPage } from './pages/BatchPage';
import { HomePage } from './pages/HomePage';

function BackendStatus() {
  const { data: ready } = useBackendReady();
  if (ready === undefined) return null;
  return (
    <Badge color={ready ? 'green' : 'red'} variant="dot" title={API_BASE_URL}>
      backend {ready ? 'up' : 'unreachable'}
    </Badge>
  );
}

export default function App() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" underline="never" c="inherit">
              <Title order={4}>Project Sift</Title>
            </Anchor>
            <BackendStatus />
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/batches/:batchId" element={<BatchPage />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
