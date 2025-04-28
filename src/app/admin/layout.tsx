import { MainAdminLayout } from '@/layout/Admin';
import { ReactNode } from 'react';



type Props = {
  children: ReactNode;
};

function AdminLayout({ children }: Props) {
  return <MainAdminLayout>{children}</MainAdminLayout>;
}

export default AdminLayout;
