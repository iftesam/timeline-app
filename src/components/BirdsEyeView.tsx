import React, { useState, useEffect, useRef } from 'react';
import { useTimeline } from '../context/TimelineContext';
import './BirdsEyeView.css';

const BirdsEyeView: React.FC = () => {
  const { projects, tasks } = useTimeline();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<Array<{ id: string, x1: number, y1: number, x2: number, y2: number, isError: boolean }>>([]);

  useEffect(() => {
    // Dynamically inject landscape page size for print
    const style = document.createElement('style');
    style.innerHTML = `@page { size: landscape; margin: 5mm; }`;
    style.id = 'print-page-style';
    document.head.appendChild(style);

    const handleBeforePrint = () => {
      setExpandedProjects(projects.map(p => p.id));
      setExpandedPhases(tasks.map(t => t.id)); // Expand all phases to show subtasks
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      const el = document.getElementById('print-page-style');
      if (el) el.remove();
    };
  }, [projects, tasks]);

  if (projects.length === 0) return <div className="birds-eye-view"><h2>No projects found.</h2></div>;

  const minDate = new Date(Math.min(...projects.map(p => new Date(p.startDate).getTime())));
  const maxDate = new Date(Math.max(...projects.map(p => new Date(p.endDate).getTime())));
  
  // Pad the chart range for visual breathing room
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 10);
  
  const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
  const safeTotal = totalDays || 1;

  // Generate Date Markers (Weekly)
  const dateMarkers: { date: Date; label: string; left: string }[] = [];
  const iterDate = new Date(minDate);
  iterDate.setDate(iterDate.getDate() - iterDate.getDay() + 1); // Start at nearest Monday
  if (iterDate > minDate) {
    iterDate.setDate(iterDate.getDate() - 7);
  }

  while (iterDate <= maxDate) {
    const offset = (iterDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
    dateMarkers.push({
      date: new Date(iterDate),
      label: iterDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      left: `${(offset / safeTotal) * 100}%`
    });
    iterDate.setDate(iterDate.getDate() + 7);
  }

  const today = new Date();
  let todayLeft: string | null = null;
  if (today >= minDate && today <= maxDate) {
      const offset = (today.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
      todayLeft = `${(offset / safeTotal) * 100}%`;
  }

  const getPositionStyles = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const offset = (startDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    
    return {
      left: `${(offset / safeTotal) * 100}%`,
      width: `${Math.max((duration / safeTotal) * 100, 1)}%` // min 1% width
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const togglePhase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPhases(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Calculate SVG arrows for dependencies
  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newArrows: Array<{ id: string, x1: number, y1: number, x2: number, y2: number, isError: boolean }> = [];

    tasks.forEach(dependentTask => {
      if (!dependentTask.blockedBy || dependentTask.blockedBy.length === 0) return;
      
      dependentTask.blockedBy.forEach(blockerId => {
        const blockerTask = tasks.find(t => t.id === blockerId);
        if (!blockerTask) return;

        const dependentEl = containerRef.current!.querySelector(`[data-task-id="${dependentTask.id}"]`) as HTMLElement;
        const blockerEl = containerRef.current!.querySelector(`[data-task-id="${blockerId}"]`) as HTMLElement;

        if (dependentEl && blockerEl) {
          const depRect = dependentEl.getBoundingClientRect();
          const blockerRect = blockerEl.getBoundingClientRect();

          const x1 = blockerRect.right - containerRect.left;
          const y1 = blockerRect.top + (blockerRect.height / 2) - containerRect.top;

          const x2 = depRect.left - containerRect.left;
          const y2 = depRect.top + (depRect.height / 2) - containerRect.top;

          const isError = new Date(dependentTask.startDate) < new Date(blockerTask.endDate);
          newArrows.push({ id: `${blockerId}-${dependentTask.id}`, x1, y1, x2, y2, isError });
        }
      });
    });
    setArrows(newArrows);
  }, [tasks, expandedProjects, expandedPhases]); // Recalculate when tasks or expansion changes

  return (
    <div className="birds-eye-view">
      <div className="view-header no-print flex-between">
        <div>
          <h2>Bird's Eye View</h2>
          <p>Professional Project Schedule & Gantt Chart</p>
        </div>
        <button className="md-button md-button--filled" onClick={handlePrint}>
          <span className="material-symbols-outlined">print</span>
          Export to PDF
        </button>
      </div>

      <div className="print-header print-only">
        <h1>Project Timeline Report</h1>
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="gantt-chart-container" ref={containerRef} style={{ position: 'relative' }}>
        {/* SVG Dependency Arrows */}
        {arrows.length > 0 && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            <defs>
              <marker id="arrowhead-normal" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--md-sys-color-primary)" />
              </marker>
              <marker id="arrowhead-error" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--md-sys-color-error)" />
              </marker>
            </defs>
            {arrows.map(a => {
              const dx = a.x2 - a.x1;
              // Add bezier curve offset to make it look smooth and routing
              const curveOffset = Math.max(Math.abs(dx) / 2, 20);
              const path = `M ${a.x1} ${a.y1} C ${a.x1 + curveOffset} ${a.y1}, ${a.x2 - curveOffset} ${a.y2}, ${a.x2} ${a.y2}`;
              
              return (
                <path 
                  key={a.id} 
                  d={path} 
                  fill="none" 
                  stroke={a.isError ? "var(--md-sys-color-error)" : "var(--md-sys-color-primary)"} 
                  strokeWidth="2"
                  markerEnd={`url(#arrowhead-${a.isError ? 'error' : 'normal'})`}
                  strokeDasharray={a.isError ? "4,4" : "none"}
                />
              );
            })}
          </svg>
        )}

        {/* X-Axis Header */}
        <div className="gantt-axis-header">
           <div className="gantt-project-info-header">
               <span>Projects & Sprints</span>
           </div>
           <div className="gantt-axis-scale">
              {dateMarkers.map((marker, i) => (
                 <div key={i} className="gantt-axis-tick" style={{ left: marker.left }}>
                    <span className="gantt-axis-label">{marker.label}</span>
                 </div>
              ))}
              {todayLeft && (
                 <div className="gantt-today-marker-header" style={{ left: todayLeft }}>
                    Today
                 </div>
              )}
           </div>
        </div>

        <div className="gantt-chart-body">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            let totalSubtasks = 0;
            let completedSubtasks = 0;
            
            projectTasks.forEach(pt => {
              if (pt.subTasks && pt.subTasks.length > 0) {
                totalSubtasks += pt.subTasks.length;
                completedSubtasks += pt.subTasks.filter(st => st.status === 'completed').length;
              } else {
                totalSubtasks += 1;
                completedSubtasks += pt.status === 'completed' ? 1 : 0;
              }
            });

            const progress = totalSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
            const isExpanded = expandedProjects.includes(project.id);

            return (
              <div key={project.id} className="gantt-project">
                <div className="gantt-project-info">
                  <div className="gantt-project-title-row no-print" onClick={() => toggleProject(project.id)}>
                    <span className="material-symbols-outlined expand-icon">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    <h3>{project.name}</h3>
                  </div>
                  <div className="gantt-project-title-row print-only">
                    <h3>{project.name}</h3>
                  </div>

                  <span className="gantt-dates">{project.startDate} to {project.endDate}</span>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="progress-text">{progress > 0 ? `${progress}% Complete` : 'Not Started'}</span>
                </div>
                
                <div className="gantt-timeline-area">
                  {/* Grid Lines */}
                  {dateMarkers.map((marker, i) => (
                     <div key={`grid-${i}`} className="gantt-grid-line" style={{ left: marker.left }}></div>
                  ))}
                  {todayLeft && <div className="gantt-today-line" style={{ left: todayLeft }}></div>}

                  {/* Project wide bar */}
                  <div className="gantt-bar-container" style={{ position: 'relative', height: '28px' }}>
                    <div className="gantt-bar project-bar" style={{
                      ...getPositionStyles(project.startDate, project.endDate),
                      position: 'absolute', top: 0, bottom: 0
                    }}>
                    </div>
                    <div className="gantt-bar-label-wrapper" style={{
                      left: getPositionStyles(project.startDate, project.endDate).left,
                      position: 'absolute', top: 0, bottom: 0,
                      display: 'flex', alignItems: 'center', paddingLeft: '8px',
                      pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap'
                    }}>
                      <span className="gantt-bar-label"><strong>{project.name}</strong></span>
                    </div>
                  </div>
                  
                  {/* Expandable Phase bars */}
                  {isExpanded && projectTasks.map((task) => {
                    const taskProgress = task.subTasks?.length 
                      ? Math.round((task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100)
                      : (task.status === 'completed' ? 100 : 0);
                    
                    // Remove "Phase X: " prefix so the name is more informative
                    const cleanTitle = task.title.replace(/^Phase \d+:\s*/, '');
                    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
                    const isPhaseExpanded = expandedPhases.includes(task.id);

                    return (
                      <div key={task.id} className="gantt-phase-group">
                        <div 
                          className="gantt-bar-container"
                          style={{
                            marginTop: '8px',
                            position: 'relative',
                            height: '28px'
                          }}
                        >
                          <div 
                            data-task-id={task.id}
                            className={`gantt-bar task-bar status-${task.status} ${hasSubTasks ? 'clickable-bar' : ''}`} 
                            style={{
                              ...getPositionStyles(task.startDate, task.endDate),
                              position: 'absolute', top: 0, bottom: 0, margin: 0
                            }}
                            onClick={(e) => hasSubTasks && togglePhase(task.id, e)}
                            title={`${cleanTitle} | ${task.startDate} to ${task.endDate}${taskProgress > 0 ? ` | ${taskProgress}% Complete` : ''}`}
                          >
                            <div className="gantt-task-fill" style={{ width: `${taskProgress}%` }}></div>
                          </div>
                          
                          {/* External visible label */}
                          <div className="gantt-bar-label-wrapper" style={{
                            left: getPositionStyles(task.startDate, task.endDate).left,
                            position: 'absolute', top: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', paddingLeft: '8px',
                            pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap'
                          }}>
                            {hasSubTasks && (
                               <span className="material-symbols-outlined gantt-phase-expand-icon">
                                 {isPhaseExpanded ? 'arrow_drop_down' : 'arrow_right'}
                               </span>
                            )}
                            <span className="gantt-bar-label">
                              <strong>{cleanTitle}</strong> {taskProgress > 0 ? `— ${taskProgress}% Complete` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Dropdown list of tasks within this sprint */}
                        {hasSubTasks && (
                          <div 
                            className={`gantt-subtasks-dropdown ${isPhaseExpanded ? 'expanded' : ''}`}
                            style={{
                              marginLeft: getPositionStyles(task.startDate, task.endDate).left,
                            }}
                          >
                            {task.subTasks.map(st => (
                               <div key={st.id} className={`gantt-subtask-item ${st.status === 'completed' ? 'completed' : ''}`}>
                                  <span className="material-symbols-outlined subtask-icon">
                                    {st.status === 'completed' ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                  <span>{st.title}</span>
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BirdsEyeView;
