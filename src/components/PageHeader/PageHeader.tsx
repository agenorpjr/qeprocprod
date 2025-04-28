'use client';

import {
  ActionIcon,
  Breadcrumbs,
  BreadcrumbsProps,
  Button,
  Divider,
  Flex,
  Paper,
  PaperProps,
  Stack,
  Text,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { IconPlus, IconRefresh } from '@tabler/icons-react';

import { FilterDateMenu, Surface } from '@/components';
import { useSession } from 'next-auth/react';

type PageHeaderProps = {
  title: string;
  withActions?: boolean;
  breadcrumbItems?: any;
  invoiceAction?: boolean;
} & PaperProps;

const PageHeader = (props: PageHeaderProps) => {
  const {data: session } = useSession()

  const { withActions, breadcrumbItems, title, invoiceAction, ...others } =
    props;
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();

  const BREADCRUMBS_PROPS: Omit<BreadcrumbsProps, 'children'> = {
    style: {
      a: {
        padding: rem(8),
        borderRadius: theme.radius.sm,
        fontWeight: 500,
        color: colorScheme === 'dark' ? theme.white : theme.black,

        '&:hover': {
          transition: 'all ease 150ms',
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.dark[5]
              : theme.colors.gray[2],
          textDecoration: 'none',
        },
      },
    },
  };

  return (
    <>
      <Surface
        component={Paper}
        style={{ backgroundColor: 'transparent' }}
        {...others}
      >
        {withActions ? (
          <Flex
            justify="space-between"
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 'sm', sm: 4 }}
          >
            <Stack gap={4}>
              <Title order={3}>{title}</Title>
              <Text>Bem vindo, {session?.user?.name}!</Text>
            </Stack>
            <Flex align="center" gap="sm">
              <FilterDateMenu />
            </Flex>
          </Flex>
        ) : invoiceAction ? (
          <></>
        ) : (
          <></>
        )}
      </Surface>
      <Divider />
    </>
  );
};

export default PageHeader;
