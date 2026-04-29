import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import LogActionSheet from '../components/v2/sheets/LogActionSheet';
import GuestNotificationsSheet from '../components/v2/sheets/GuestNotificationsSheet';
import Toast from '../components/v2/ui/Toast';
import IOSInstallPrompt from '../components/v2/ui/IOSInstallPrompt';
import PreviewNotice from '../components/v2/ui/PreviewNotice';
import DemoChat from '../components/chat/DemoChat';
import { useOnline } from '../hooks/useOnline';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSettings } from '../contexts/SettingsContext';
import { buildChatContext } from '../lib/chatContext';

export default function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [guestNotificationsSeen, setGuestNotificationsSeen] = useState(() => {
    return localStorage.getItem('betatrace_guest_notifications_seen') === 'true';
  });
  const { user, isGuest } = useAuth();
  const online = useOnline();
  const dashboardData = useDashboardData();
  const { settings } = useSettings();
  const chatContext = buildChatContext({ ...dashboardData, settings });

  return (
    <AppContainer>
      <TopBar
        user={user}
        isGuest={isGuest}
        hasGuestNotification={!guestNotificationsSeen}
        onPressNotifications={() => {
          if (isGuest) {
            localStorage.setItem('betatrace_guest_notifications_seen', 'true');
            setGuestNotificationsSeen(true);
            setNotificationsOpen(true);
          }
        }}
      />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-md py-md">
          <Outlet />
        </div>
      </main>
      <BottomNav onPressLog={() => setLogOpen(true)} />
      <LogActionSheet open={logOpen} onOpenChange={setLogOpen} />
      <GuestNotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <DemoChat context={chatContext} />
      <PreviewNotice />
      {!online && <Toast tone="warn" duration={0}>You're offline - saves will fail until you reconnect.</Toast>}
      <IOSInstallPrompt />
    </AppContainer>
  );
}
