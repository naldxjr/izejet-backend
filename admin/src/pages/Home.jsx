import Header from '../components/Header';
import Dashboard from './Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />
      <Dashboard />
    </div>
  );
}