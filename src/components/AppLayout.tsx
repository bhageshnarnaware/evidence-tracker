import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
