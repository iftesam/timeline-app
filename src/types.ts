export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: TaskStatus;
  notes: string;
  subTasks: SubTask[];
  blockedBy?: string[]; // IDs of tasks that must be completed before this one
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
}
