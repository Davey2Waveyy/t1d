import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import LogActionSheet from '../components/v2/sheets/LogActionSheet';
import Toast from '../components/v2/ui/Toast';
import IOSInstallPrompt from '../components/v2/ui/IOSInstallPrompt';
import { useOnline } from '../hooks/useOnline';

export default function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const { user } = useAuth();
  const online = useOnline();

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
      {!online && <Toast tone="warn" duration={0}>You're offline - saves will fail until you reconnect.</Toast>}
      <IOSInstallPrompt />
    </AppContainer>
  );
}
