import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import LogActionSheet from '../components/v2/sheets/LogActionSheet';

export default function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const { user } = useAuth();

  return (
    <AppContainer>
      <TopBar user={user} />
      <main className="pt-16 lg:pt-0 lg:col-span-2">
        <div className="px-md py-md lg:px-0">
          <Outlet />
        </div>
      </main>
      <BottomNav onPressLog={() => setLogOpen(true)} />
      <LogActionSheet open={logOpen} onOpenChange={setLogOpen} />
    </AppContainer>
  );
}
