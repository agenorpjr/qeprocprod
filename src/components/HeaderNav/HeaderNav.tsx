'use client';

import {
  ActionIcon,
  Burger,
  Flex,
  Group,
  Menu,
  TextInput,
  Title,
  Tooltip,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconCircleHalf2,
  IconMoonStars,
  IconPower,
  IconSearch,
  IconSunHigh,
} from '@tabler/icons-react';

import { SidebarState } from '@/app/apps/layout';
import SignOutF from '@/lib/actionSignout';

const ICON_SIZE = 20;

type HeaderNavProps = {
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  sidebarState: SidebarState;
  onSidebarStateChange: () => void;
};

function HeaderNav(props: HeaderNavProps) {
  const { toggleMobile, mobileOpened, onSidebarStateChange } = props;
  const theme = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const mobile_match = useMediaQuery('(max-width: 425px)');

  return (
    <Group justify="space-between">
      <Group gap={0}>
        <Tooltip label="Toggle side navigation">
          <Burger visibleFrom="md" size="sm" onClick={onSidebarStateChange} />
        </Tooltip>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="md"
          size="sm"
        />
        {/*<Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="md" size="sm"/>*/}
        {/* {!mobile_match && (
          <TextInput
            placeholder="search"
            rightSection={<IconSearch size={ICON_SIZE} />}
            ml="md"
            style={{ width: tablet_match ? 'auto' : rem(400) }}
          />
        )} */}
        <Flex>
          <Title order={4} ml='md' c='blue.9'>Sistemas de Compras</Title>
        </Flex>
      </Group>
      <Group>
        {/* {mobile_match && (
          <ActionIcon>
            <IconSearch size={ICON_SIZE} />
          </ActionIcon>
        )} */}
        <Tooltip label="Logout">
          <ActionIcon onClick={() => {SignOutF()}}>
            <IconPower size={ICON_SIZE} />
          </ActionIcon>
        </Tooltip>
        <Menu shadow="lg" width={200}>
          <Menu.Target>
            <Tooltip label="Trocar modo de cores">
              <ActionIcon variant="light">
                {colorScheme === 'auto' ? (
                  <IconCircleHalf2 size={ICON_SIZE} />
                ) : colorScheme === 'dark' ? (
                  <IconMoonStars size={ICON_SIZE} />
                ) : (
                  <IconSunHigh size={ICON_SIZE} />
                )}
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label tt="uppercase" ta="center" fw={600}>
              Selecione Modo de Cores
            </Menu.Label>
            <Menu.Item
              leftSection={<IconSunHigh size={16} />}
              onClick={() => setColorScheme('light')}
            >
              Claro
            </Menu.Item>
            <Menu.Item
              leftSection={<IconMoonStars size={16} />}
              onClick={() => setColorScheme('dark')}
            >
              Escuro
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default HeaderNav;
