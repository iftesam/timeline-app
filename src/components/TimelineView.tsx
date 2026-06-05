import React, { useState, useEffect } from 'react';
import { useTimeline } from '../context/TimelineContext';
import './TimelineView.css';
import type { Project, Task } from '../types';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';

const TimelineView: React.FC = () => {
  const { projects, tasks, toggleSubTaskStatus, searchQuery } = useTimeline();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [addingTaskForProjectId, setAddingTaskForProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically inject portrait page size for print
    const style = document.createElement('style');
    style.innerHTML = `@page { size: portrait; margin: 15mm; }`;
    style.id = 'print-page-style';
    document.head.appendChild(style);
    
    return () => {
      const el = document.getElementById('print-page-style');
      if (el) el.remove();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--md-sys-color-primary)';
      case 'in-progress': return '#ff9800'; 
      case 'pending': default: return 'var(--md-sys-color-outline-variant)';
    }
  };

  const getProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) return task.status === 'completed' ? 100 : 0;
    const completed = task.subTasks.filter(st => st.status === 'completed').length;
    return Math.round((completed / task.subTasks.length) * 100);
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (p.name.toLowerCase().includes(q)) return true;
    
    // Check tasks in project
    const pTasks = tasks.filter(t => t.projectId === p.id);
    return pTasks.some(t => 
      t.title.toLowerCase().includes(q) || 
      t.notes.toLowerCase().includes(q) ||
      t.subTasks?.some(st => st.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="timeline-view">
      <div className="view-header no-print flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Project Timelines</h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '16px', margin: 0 }}>Detailed Phase & Sprint Breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="md-button md-button--text" onClick={() => setIsAddingProject(true)}>
            <span className="material-symbols-outlined">add</span>
            New Project
          </button>
          <button className="md-button md-button--filled" onClick={() => window.print()}>
            <span className="material-symbols-outlined">print</span>
            Export to PDF
          </button>
        </div>
      </div>
      
      <div className="print-header print-only">
        <h1>Project Tasks Report</h1>
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>
      
      {filteredProjects.map(project => {
        let projectTasks = tasks.filter(t => t.projectId === project.id).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            // keep the project if name matches, else filter tasks
            if (!project.name.toLowerCase().includes(q)) {
                projectTasks = projectTasks.filter(t => 
                    t.title.toLowerCase().includes(q) || 
                    t.notes.toLowerCase().includes(q) ||
                    t.subTasks?.some(st => st.title.toLowerCase().includes(q))
                );
            }
        }

        if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) && projectTasks.length === 0) {
            return null;
        }
        return (
          <div key={project.id} className="project-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="project-title">{project.name}</h3>
              <button className="md-icon-button small-icon no-print" onClick={() => setEditingProject(project)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              </button>
            </div>
            <div className="project-dates">
              <span className="material-symbols-outlined">calendar_today</span>
              {project.startDate} to {project.endDate}
            </div>
            
            <div className="timeline-container">
              {projectTasks.map((task, index) => {
                const isExpanded = expandedTask === task.id;
                const progress = getProgress(task);
                
                return (
                  <div key={task.id} className="timeline-node">
                    <div className="timeline-line" style={{ backgroundColor: index === projectTasks.length - 1 ? 'transparent' : 'var(--md-sys-color-surface-variant)' }}></div>
                    <div className="timeline-dot" style={{ backgroundColor: getStatusColor(task.status) }}></div>
                    
                    <div className="task-card" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                      <div className="task-card-header">
                        <div className="task-info">
                          <h4>{task.title}</h4>
                          <span className="task-date">{task.startDate} - {task.endDate}</span>
                        </div>
                        <div className="task-actions">
                          {task.subTasks && task.subTasks.length > 0 && (
                            <span className="task-progress-badge">{progress}%</span>
                          )}
                          <span className={`status-badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                          <button 
                            className="md-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Phase Progress Bar */}
                      {task.subTasks && task.subTasks.length > 0 && (
                          <div className="phase-progress-bar-container">
                              <div className="phase-progress-bar-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                      )}

                      <div className={`task-details ${isExpanded ? 'expanded' : ''}`}>
                        <p className="task-notes">{task.notes}</p>
                        
                        {task.subTasks && task.subTasks.length > 0 && (
                          <div className="subtasks-list">
                              <h5>Sub-Tasks (Sprint Items)</h5>
                              {task.subTasks.map(st => (
                                  <div key={st.id} className="subtask-item" onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubTaskStatus(task.id, st.id);
                                  }}>
                                      <div className={`subtask-checkbox ${st.status === 'completed' ? 'checked' : ''}`}>
                                          {st.status === 'completed' && <span className="material-symbols-outlined">check</span>}
                                      </div>
                                      <span className={`subtask-title ${st.status === 'completed' ? 'completed-text' : ''}`}>{st.title}</span>
                                  </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="no-print" style={{ paddingLeft: '40px', marginTop: '16px' }}>
                <button className="md-button md-button--outlined" onClick={() => setAddingTaskForProjectId(project.id)}>
                  <span className="material-symbols-outlined">add</span>
                  Add Phase
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {editingTask && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}

      {addingTaskForProjectId && (
        <TaskModal 
          task={{
            id: Math.random().toString(36).substr(2, 9),
            projectId: addingTaskForProjectId,
            title: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: '',
            subTasks: []
          }} 
          onClose={() => setAddingTaskForProjectId(null)} 
          isNew={true}
        />
      )}

      {editingProject && (
        <ProjectModal 
          project={editingProject} 
          onClose={() => setEditingProject(null)} 
        />
      )}

      {isAddingProject && (
        <ProjectModal 
          project={{
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            progress: 0
          }} 
          onClose={() => setIsAddingProject(false)} 
          isNew={true}
        />
      )}
    </div>
  );
};

export default TimelineView;
