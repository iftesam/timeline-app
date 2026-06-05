import React, { useMemo } from 'react';
import { useTimeline } from '../context/TimelineContext';
import './AnalyticsView.css';

const AnalyticsView: React.FC = () => {
  const { projects, tasks } = useTimeline();

  // Metrics Calculation
  const metrics = useMemo(() => {
    let totalSprints = 0;
    let completedSprints = 0;
    let totalPhases = tasks.length;
    let completedPhases = 0;

    tasks.forEach(t => {
      if (t.status === 'completed') completedPhases++;
      if (t.subTasks && t.subTasks.length > 0) {
        totalSprints += t.subTasks.length;
        completedSprints += t.subTasks.filter(st => st.status === 'completed').length;
      }
    });

    const phaseProgress = totalPhases ? Math.round((completedPhases / totalPhases) * 100) : 0;
    const sprintProgress = totalSprints ? Math.round((completedSprints / totalSprints) * 100) : 0;

    // Workload Heatmap Calculation (Active tasks per week)
    const weeks: Record<string, number> = {};
    tasks.forEach(t => {
      let d = new Date(t.startDate);
      const end = new Date(t.endDate);
      if (isNaN(d.getTime()) || isNaN(end.getTime())) return;
      
      // Add count to each week the task overlaps
      while (d <= end) {
        const year = d.getFullYear();
        // Simple week calculation
        const week = Math.ceil(Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000)) / 7) || 1;
        const key = `${year}-W${week.toString().padStart(2, '0')}`;
        weeks[key] = (weeks[key] || 0) + 1;
        
        // jump by a week
        d.setDate(d.getDate() + 7);
      }
      
      // Ensure the end week is counted if loop missed it
      const endYear = end.getFullYear();
      const endWeek = Math.ceil(Math.floor((end.getTime() - new Date(endYear, 0, 1).getTime()) / (24 * 60 * 60 * 1000)) / 7) || 1;
      const endKey = `${endYear}-W${endWeek.toString().padStart(2, '0')}`;
      if (!weeks[endKey]) weeks[endKey] = 1;
    });

    const workloadData = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]));
    
    return {
      totalPhases, completedPhases, phaseProgress,
      totalSprints, completedSprints, sprintProgress,
      workloadData
    };
  }, [tasks]);

  return (
    <div className="analytics-view">
      <div className="view-header">
        <h2>Intelligence Dashboard</h2>
        <p>Project Velocity & Workload Analytics</p>
      </div>

      <div className="analytics-grid">
        <div className="card metric-card">
           <h3>Global Phase Progress</h3>
           <div className="metric-value">{metrics.phaseProgress}%</div>
           <p>{metrics.completedPhases} / {metrics.totalPhases} Phases Completed</p>
           <div className="mini-progress-bar"><div style={{width: `${metrics.phaseProgress}%`}}></div></div>
        </div>
        
        <div className="card metric-card">
           <h3>Sprint Velocity</h3>
           <div className="metric-value">{metrics.sprintProgress}%</div>
           <p>{metrics.completedSprints} / {metrics.totalSprints} Sprint Items Done</p>
           <div className="mini-progress-bar"><div style={{width: `${metrics.sprintProgress}%`}}></div></div>
        </div>

        <div className="card metric-card">
           <h3>Project Health</h3>
           <div className="metric-value">{projects.length}</div>
           <p>Active Projects</p>
           <div className="mini-progress-bar"><div style={{width: `100%`, backgroundColor: 'var(--md-sys-color-primary)'}}></div></div>
        </div>
      </div>

      <div className="card workload-card">
         <h3>Workload Heatmap (Burnout Risk)</h3>
         <p className="card-subtitle">Number of concurrent active phases per week</p>
         <div className="heatmap-container">
            {metrics.workloadData.length === 0 ? <p>No tasks scheduled.</p> : metrics.workloadData.map(([week, count]) => {
               // Heatmap risk colors
               let riskClass = 'low-risk';
               if (count > 2) riskClass = 'med-risk';
               if (count > 4) riskClass = 'high-risk';
               
               return (
                  <div key={week} className={`heatmap-bar ${riskClass}`} style={{ height: `${Math.min(count * 25, 180)}px` }} title={`${count} concurrent phases`}>
                     <span>{count}</span>
                     <div className="heatmap-label">{week}</div>
                  </div>
               )
            })}
         </div>
         <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50'}}></div> Healthy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff9800'}}></div> Heavy Load</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f44336'}}></div> Burnout Risk</span>
         </div>
      </div>

      <div className="card projects-velocity-card">
         <h3>Project Velocity Details</h3>
         <table className="velocity-table">
            <thead>
               <tr>
                 <th>Project Name</th>
                 <th>Timeline</th>
                 <th>Progress</th>
               </tr>
            </thead>
            <tbody>
               {projects.map(p => {
                  const pTasks = tasks.filter(t => t.projectId === p.id);
                  let tS = 0, cS = 0;
                  pTasks.forEach(pt => {
                     if (pt.subTasks && pt.subTasks.length > 0) {
                        tS += pt.subTasks.length;
                        cS += pt.subTasks.filter(st => st.status === 'completed').length;
                     } else {
                        tS += 1;
                        cS += pt.status === 'completed' ? 1 : 0;
                     }
                  });
                  const prog = tS ? Math.round((cS / tS) * 100) : 0;

                  return (
                     <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td><span style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>{p.startDate} to {p.endDate}</span></td>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="mini-progress-bar" style={{ flex: 1, marginTop: 0 }}><div style={{width: `${prog}%`}}></div></div>
                              <span style={{ fontSize: '14px', minWidth: '40px', fontWeight: 'bold' }}>{prog}%</span>
                           </div>
                        </td>
                     </tr>
                  );
               })}
               {projects.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>No active projects.</td></tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default AnalyticsView;
