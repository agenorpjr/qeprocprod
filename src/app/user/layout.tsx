import { MainUserLayout } from '@/layout/User';
import { ReactNode } from 'react';



type Props = {
  children: ReactNode;
};

function UserLayout({ children }: Props) {
  return <MainUserLayout>{children}</MainUserLayout>;
}

export default UserLayout;
