import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project, Task, TaskStatus } from '../types';

interface TimelineContextType {
  projects: Project[];
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  toggleSubTaskStatus: (taskId: string, subTaskId: string) => void;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'GAN Project', startDate: '2026-06-08', endDate: '2026-08-14', progress: 0 },
  { id: '2', name: 'Cognitive Chevrons Paper', startDate: '2026-06-08', endDate: '2026-07-03', progress: 0 },
  { id: '3', name: 'vLLM Backend & JTMS', startDate: '2026-07-06', endDate: '2026-07-31', progress: 0 },
];

const defaultTasks: Task[] = [
  { 
    id: 't1', projectId: '1', title: 'Phase 1: Infrastructure Isolation', startDate: '2026-06-08', endDate: '2026-06-19', status: 'pending', notes: 'Provision the cluster, enforce physical data barriers.',
    subTasks: [
      { id: 'st1', title: 'Cluster Provisioning & Node Assignment', status: 'pending' },
      { id: 'st2', title: 'Hardware & Environment Optimization', status: 'pending' },
      { id: 'st3', title: 'Schema Mapping & Type Definition', status: 'pending' },
      { id: 'st4', title: 'Preprocessing Pipeline', status: 'pending' },
      { id: 'st5', title: 'Batch Loader & Communication Bridge', status: 'pending' }
    ]
  },
  { 
    id: 't2', projectId: '1', title: 'Phase 2: Model Architecture', startDate: '2026-06-22', endDate: '2026-07-10', status: 'pending', notes: 'Code the neural networks and establish training loop.',
    subTasks: [
      { id: 'st6', title: 'Generator Construction', status: 'pending' },
      { id: 'st7', title: 'Discriminator Construction', status: 'pending' },
      { id: 'st8', title: 'Optimizers & Loss Functions', status: 'pending' },
      { id: 'st9', title: 'The Minimax Training Loop', status: 'pending' },
      { id: 'st10', title: 'Sanity Check & Dry Run', status: 'pending' }
    ]
  },
  { id: 't3', projectId: '1', title: 'Phase 3: Adversarial Training', startDate: '2026-07-13', endDate: '2026-07-31', status: 'pending', notes: 'Execute training and balance Forger/Detective dynamic.', subTasks: [] },
  { id: 't4', projectId: '1', title: 'Phase 4: Evaluation & Export', startDate: '2026-08-03', endDate: '2026-08-14', status: 'pending', notes: 'Prove data is analytically useful and secure.', subTasks: [] },
  
  { id: 't5', projectId: '2', title: 'Phase 1: Positioning & Architecture', startDate: '2026-06-08', endDate: '2026-06-12', status: 'pending', notes: 'Anchor theoretical background.', subTasks: [] },
  { id: 't6', projectId: '2', title: 'Phase 2: Methodology & Verification', startDate: '2026-06-15', endDate: '2026-06-19', status: 'pending', notes: 'Detail AFM dataset and NLI pivot.', subTasks: [] },
  { id: 't7', projectId: '2', title: 'Phase 3: Controls, Setup, & Results', startDate: '2026-06-22', endDate: '2026-06-26', status: 'pending', notes: 'Solidify Fusion Gate mechanics.', subTasks: [] },
  { id: 't8', projectId: '2', title: 'Phase 4: Synthesis & Final Polish', startDate: '2026-06-29', endDate: '2026-07-03', status: 'pending', notes: 'Contextualize findings and finalize manuscript.', subTasks: [] },
  
  { id: 't9', projectId: '3', title: 'Phase 1: Distributed Engine Deployment', startDate: '2026-07-06', endDate: '2026-07-10', status: 'pending', notes: 'Establish vLLM backend.', subTasks: [] },
  { id: 't10', projectId: '3', title: 'Phase 2: Symbolic Graph Construction', startDate: '2026-07-13', endDate: '2026-07-17', status: 'pending', notes: 'Build JTMS.', subTasks: [] },
  { id: 't11', projectId: '3', title: 'Phase 3: Cynical Evaluator Integration', startDate: '2026-07-20', endDate: '2026-07-24', status: 'pending', notes: 'Connect raw vLLM output to JTMS.', subTasks: [] },
  { id: 't12', projectId: '3', title: 'Phase 4: Cache Eviction & Full Execution', startDate: '2026-07-27', endDate: '2026-07-31', status: 'pending', notes: 'Prove system can purge toxic KV cache states.', subTasks: [] },
];

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({ ...t, subTasks: t.subTasks || [] }));
    }
    return defaultTasks;
  });

  // Apply one-time migrations
  useEffect(() => {
    if (localStorage.getItem('gan_stretched_v2') !== 'true') {
      setProjects(prev => prev.map(p => {
        if (p.id === '1') return { ...p, endDate: '2026-08-14' };
        return p;
      }));
      setTasks(prev => prev.map(t => {
        if (t.projectId === '1') {
           if (t.id === 't1') return { ...t, startDate: '2026-06-08', endDate: '2026-06-19' };
           if (t.id === 't2') return { ...t, startDate: '2026-06-22', endDate: '2026-07-10' };
           if (t.id === 't3') return { ...t, startDate: '2026-07-13', endDate: '2026-07-31' };
           if (t.id === 't4') return { ...t, startDate: '2026-08-03', endDate: '2026-08-14' };
        }
        return t;
      }));
      localStorage.setItem('gan_stretched_v2', 'true');
    }

    if (localStorage.getItem('populate_subtasks_v1') !== 'true') {
      setTasks(prev => prev.map(t => {
        if (!t.subTasks || t.subTasks.length === 0) {
            const cleanName = t.title.replace(/^Phase \d+:\s*/, '');
            return {
                ...t,
                subTasks: [
                   { id: Math.random().toString(), title: `Draft initial plan for ${cleanName}`, status: 'pending' as TaskStatus },
                   { id: Math.random().toString(), title: `Execute core work for ${cleanName}`, status: 'pending' as TaskStatus },
                   { id: Math.random().toString(), title: `Review and refine`, status: 'pending' as TaskStatus }
                ]
            };
        }
        return t;
      }));
      localStorage.setItem('populate_subtasks_v1', 'true');
    }

    if (localStorage.getItem('gan_compressed_v3') !== 'true') {
      setProjects(prev => prev.map(p => {
        if (p.id === '1') return { ...p, endDate: '2026-07-10' };
        return p;
      }));
      setTasks(prev => prev.map(t => {
        if (t.projectId === '1') {
           if (t.id === 't1') return { ...t, startDate: '2026-06-08', endDate: '2026-06-12' };
           if (t.id === 't2') return { ...t, startDate: '2026-06-15', endDate: '2026-06-19' };
           if (t.id === 't3') return { ...t, startDate: '2026-06-22', endDate: '2026-07-03' };
           if (t.id === 't4') return { ...t, startDate: '2026-07-06', endDate: '2026-07-10' };
        }
        return t;
      }));
      localStorage.setItem('gan_compressed_v3', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addProject = (p: Project) => setProjects(prev => [...prev, p]);
  const updateProject = (p: Project) => setProjects(prev => prev.map(curr => curr.id === p.id ? p : curr));
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  };
  
  const addTask = (t: Task) => setTasks(prev => [...prev, t]);
  const updateTask = (t: Task) => setTasks(prev => prev.map(curr => curr.id === t.id ? t : curr));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const toggleSubTaskStatus = (taskId: string, subTaskId: string) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id !== taskId) return t;
      
      const newSubTasks = t.subTasks.map(st => {
        if (st.id !== subTaskId) return st;
        return { ...st, status: st.status === 'completed' ? 'pending' : 'completed' as TaskStatus };
      });
      
      let parentStatus = t.status;
      if (newSubTasks.length > 0) {
        const allCompleted = newSubTasks.every(st => st.status === 'completed');
        const anyCompleted = newSubTasks.some(st => st.status === 'completed');
        if (allCompleted) parentStatus = 'completed';
        else if (anyCompleted) parentStatus = 'in-progress';
        else parentStatus = 'pending';
      }
      
      return { ...t, subTasks: newSubTasks, status: parentStatus };
    }));
  };

  return (
    <TimelineContext.Provider value={{ 
      projects, tasks, 
      searchQuery, setSearchQuery,
      addProject, updateProject, deleteProject, 
      addTask, updateTask, deleteTask, toggleSubTaskStatus 
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) throw new Error('useTimeline must be used within TimelineProvider');
  return context;
};
