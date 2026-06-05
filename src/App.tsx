import { useState } from 'react';
import './App.css';
import { useTimeline } from './context/TimelineContext';
import TimelineView from './components/TimelineView';
import BirdsEyeView from './components/BirdsEyeView';
import AnalyticsView from './components/AnalyticsView';

function App() {
  const [view, setView] = useState<'timeline' | 'birdseye' | 'analytics'>('timeline');
  const { searchQuery, setSearchQuery } = useTimeline();

  return (
    <div className="app-container">
      <header className="top-app-bar no-print">
        <div className="header-content">
          <span className="material-symbols-outlined logo-icon">timeline</span>
          <h1>Timeline Dashboard</h1>
        </div>
        
        <div className="header-search">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            placeholder="Search tasks, subtasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <nav className="header-nav">
          <button 
            className={`md-button ${view === 'timeline' ? 'md-button--filled' : 'md-button--text'}`}
            onClick={() => setView('timeline')}
          >
            <span className="material-symbols-outlined">view_list</span>
            Timeline
          </button>
          <button 
            className={`md-button ${view === 'birdseye' ? 'md-button--filled' : 'md-button--text'}`}
            onClick={() => setView('birdseye')}
          >
            <span className="material-symbols-outlined">table_chart</span>
            Bird's Eye View
          </button>
          <button 
            className={`md-button ${view === 'analytics' ? 'md-button--filled' : 'md-button--text'}`}
            onClick={() => setView('analytics')}
          >
            <span className="material-symbols-outlined">insights</span>
            Analytics
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        {view === 'timeline' && <TimelineView />}
        {view === 'birdseye' && <BirdsEyeView />}
        {view === 'analytics' && <AnalyticsView />}
      </main>
    </div>
  );
}

export default App;
