'use client'
import { useState } from 'react';
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';
import { AppShellMain, Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
//import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './navbar.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Início' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Nova Solicitação' },
  { icon: IconCalendarStats, label: 'Solicitações' },
  //   { icon: IconUser, label: 'Account' },
  //   { icon: IconFingerprint, label: 'Security' },
  //   { icon: IconSettings, label: 'Settings' },
];

export default function NavbarMinimalColored() {
  const [active, setActive] = useState(2);

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <div>
      <nav className={classes.navbar}>
        <Center>
          {/* <MantineLogo type="mark" inverted size={30} /> */}
        </Center>

        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>
          <NavbarLink icon={IconSwitchHorizontal} label="Trocar de Conta" />
          <NavbarLink icon={IconLogout} label="Sair" />
        </Stack>
      </nav>
      <AppShellMain>Main</AppShellMain>
    </div>
  );
}