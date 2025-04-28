'use client';

import { useEffect } from 'react';

import {
  Button,
  Center,
  Code,
  Group,
  Stack,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconHome2, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import classes from './error.module.css';

function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const theme = useMantineTheme();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <>
        <title>Erro - Sistema de Compras</title>
      </>
      <Center
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: theme.colors.gray[0],
          color: theme.colors.dark[8],
        }}
      >
        <Stack>
          <div className={classes.label}>400</div>
          <Title className={classes.title}>Desculpe, erro inexperado..</Title>
          <Code
            block
            color="red.1"
            c="red.7"
            fz="md"
            ta="center"
            className={classes.description}
          >
            {error.toString()}
          </Code>
          <Group justify="center" mt="md">
            <Button
              size="md"
              leftSection={<IconRefresh size={18} />}
              variant="subtle"
              onClick={() => window.location.reload}
            >
              Atualizar Página
            </Button>
            <Button
              size="md"
              variant="subtle"
              leftSection={<IconHome2 size={18} />}
              onClick={() => router.push('/')}
            >
              Voltar a HomePage
            </Button>
          </Group>
        </Stack>
      </Center>
    </>
  );
}

export default Error;
