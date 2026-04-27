import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Overview from '../components/dashboard/Overview';
import MealLog from '../components/dashboard/MealLog';
import GlucoseTrends from '../components/dashboard/GlucoseTrends';
import Settings from '../components/dashboard/Settings';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import LogActionSheet from '../components/v2/sheets/LogActionSheet';
import PlaceholderScreen from '../components/v2/screens/PlaceholderScreen';

const legacyByPath = {
  '/dashboard': Overview,
  '/dashboard/glucose': GlucoseTrends,
  '/dashboard/meals': MealLog,
  '/dashboard/more/settings': Settings,
};

const placeholders = {
  '/dashboard/more': 'More',
  '/dashboard/more/insulin': 'Insulin history',
  '/dashboard/glucose/log': 'Glucose log sheet',
  '/dashboard/meals/log': 'Meal log sheet',
  '/dashboard/insulin/log': 'Insulin log sheet',
};

export default function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const ActiveComponent = legacyByPath[location.pathname];
  const title = placeholders[location.pathname] ?? 'Dashboard';

  return (
    <AppContainer>
      <TopBar user={user} />
      <main className="pt-16 lg:pt-0 lg:col-span-2">
        <div className="px-md py-md lg:px-0">
          {ActiveComponent ? <ActiveComponent /> : <PlaceholderScreen title={title} />}
        </div>
      </main>
      <BottomNav onPressLog={() => setLogOpen(true)} />
      <LogActionSheet open={logOpen} onOpenChange={setLogOpen} />
    </AppContainer>
  );
}
