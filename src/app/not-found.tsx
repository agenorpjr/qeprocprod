'use client';

import {
  Button,
  Center,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconChevronLeft, IconHome2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import classes from './error.module.css';

function Error404() {
  const router = useRouter();
  const theme = useMantineTheme();

  return (
    <>
      <>
        <title>Pagina Não Encontrada - Sistema de Compras Quanta</title>
        <meta
          name="description"
          content="Explore our versatile dashboard website template featuring a stunning array of themes and meticulously crafted components. Elevate your web project with seamless integration, customizable themes, and a rich variety of components for a dynamic user experience. Effortlessly bring your data to life with our intuitive dashboard template, designed to streamline development and captivate users. Discover endless possibilities in design and functionality today!"
        />
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
          <div className={classes.label}>404</div>
          <Title className={classes.title}>
            Página Não Encontrada.
          </Title>
          <Text fz="md" ta="center" className={classes.description}>
            Infelizmente, não há nada a mostrar nesta página. Você deve ter digitado incorretamente o endereço ou a página foi movida para outra URL.
            
          </Text>
          <Group justify="center" mt="md">
            <Button
              size="md"
              variant="outline"
              leftSection={<IconChevronLeft size={18} />}
              onClick={() => {
                router.back();
              }}
            >
              Voltar
            </Button>
            <Button
              size="md"
              variant="outline"
              component={Link}
              leftSection={<IconHome2 size={18} />}
              href={'/'}
            >
              Ir para a HomePage
            </Button>
          </Group>
        </Stack>
      </Center>
    </>
  );
}

export default Error404;
