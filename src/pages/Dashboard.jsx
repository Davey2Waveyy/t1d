import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import Home from '../components/v2/screens/Home';
import Glucose from '../components/v2/screens/Glucose';
import Meals from '../components/v2/screens/Meals';
import More from '../components/v2/screens/More';
import MoreInsulin from '../components/v2/screens/MoreInsulin';
import MoreSettings from '../components/v2/screens/MoreSettings';
import GlucoseLogSheet from '../components/v2/sheets/GlucoseLogSheet';
import MealLogSheet from '../components/v2/sheets/MealLogSheet';
import InsulinLogSheet from '../components/v2/sheets/InsulinLogSheet';
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

// Sheets render over the screen they were opened from (background location
// pattern); a direct URL hit falls back to the home screen underneath.
const SHEETS = {
  '/dashboard/glucose/log': GlucoseLogSheet,
  '/dashboard/meals/log': MealLogSheet,
  '/dashboard/insulin/log': InsulinLogSheet,
};

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
  const location = useLocation();
  const reduced = useReducedMotion();
  const mainRef = useRef(null);

  const SheetComponent = SHEETS[location.pathname];
  const baseLocation = SheetComponent
    ? { ...location, pathname: location.state?.background ?? '/dashboard' }
    : location;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [baseLocation.pathname]);

  const overlaysOpen = logOpen || notificationsOpen || Boolean(SheetComponent);

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
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={baseLocation.pathname}
            className="px-md py-md w-full"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <Routes location={baseLocation}>
              <Route index element={<Home />} />
              <Route path="glucose" element={<Glucose />} />
              <Route path="meals" element={<Meals />} />
              <Route path="more" element={<More />} />
              <Route path="more/insulin" element={<MoreInsulin />} />
              <Route path="more/settings" element={<MoreSettings />} />
              {/* Sheet URLs render Home underneath when hit directly */}
              <Route path="glucose/log" element={<Home />} />
              <Route path="meals/log" element={<Home />} />
              <Route path="insulin/log" element={<Home />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav onPressLog={() => setLogOpen(true)} />

      <AnimatePresence>
        {SheetComponent && <SheetComponent key={location.pathname} />}
      </AnimatePresence>

      <LogActionSheet open={logOpen} onOpenChange={setLogOpen} />
      <GuestNotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <DemoChat context={chatContext} hidden={overlaysOpen} />
      <PreviewNotice />
      {!online && <Toast tone="warn" duration={0}>You&apos;re offline — saves will fail until you reconnect.</Toast>}
      <IOSInstallPrompt />
    </AppContainer>
  );
}
