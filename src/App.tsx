import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/Login';
import Layout from './components/Layout';

function AppInner() {
  const { user, loading } = useApp();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Загрузка...</div>;
  if (!user) return <LoginPage />;
  return <Layout />;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
