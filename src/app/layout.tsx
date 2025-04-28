'use client';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Open_Sans } from 'next/font/google';
import { myTheme } from '@/theme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@mantine/dropzone/styles.css';
import '@mantine/charts/styles.css';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// If loading a variable font, you don't need to specify the font weight
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.className}>
      <head>
        <title>Sistema de Compras Quanta</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider theme={myTheme} defaultColorScheme="light">
            <QueryClientProvider client={queryClient}>
              <Notifications position="bottom-right" zIndex={1000} />
              <ModalsProvider>{children}</ModalsProvider>
            </QueryClientProvider>
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}