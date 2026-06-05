import React, { useState } from 'react';
import type { Task, SubTask } from '../types';
import { useTimeline } from '../context/TimelineContext';
import './TaskModal.css';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  isNew?: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, isNew = false }) => {
  const { updateTask, addTask, deleteTask, tasks } = useTimeline();
  const [formData, setFormData] = useState<Task>({ ...task, subTasks: task.subTasks || [], blockedBy: task.blockedBy || [] });
  const [newSubTask, setNewSubTask] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === formData.projectId && t.id !== formData.id);

  const handleBlockerToggle = (blockerId: string) => {
    const currentBlockers = formData.blockedBy || [];
    if (currentBlockers.includes(blockerId)) {
      setFormData({ ...formData, blockedBy: currentBlockers.filter(id => id !== blockerId) });
    } else {
      setFormData({ ...formData, blockedBy: [...currentBlockers, blockerId] });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    const st: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubTask.trim(),
      status: 'pending'
    };
    setFormData({ ...formData, subTasks: [...formData.subTasks, st] });
    setNewSubTask('');
  };

  const handleRemoveSubTask = (id: string) => {
    setFormData({ ...formData, subTasks: formData.subTasks.filter(st => st.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addTask(formData);
    } else {
      updateTask(formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this phase?")) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? "Add Phase" : "Edit Phase"}</h2>
          <button type="button" className="md-icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Blocked By (Dependencies)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--md-sys-color-outline-variant)', padding: '8px', borderRadius: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {projectTasks.length === 0 ? (
                 <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '13px' }}>No other phases in this project</span>
              ) : projectTasks.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={(formData.blockedBy || []).includes(t.id)} 
                    onChange={() => handleBlockerToggle(t.id)} 
                  />
                  {t.title}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Notes & Objectives</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="form-group">
            <label>Sub-Tasks (Sprints)</label>
            <div className="subtask-edit-list">
              {formData.subTasks.map(st => (
                <div key={st.id} className="subtask-edit-item">
                  <span>{st.title}</span>
                  <button type="button" className="md-icon-button small-icon" onClick={() => handleRemoveSubTask(st.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="add-subtask-row">
              <input 
                type="text" 
                placeholder="New sub-task title..." 
                value={newSubTask} 
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())}
              />
              <button type="button" className="md-button md-button--outlined" onClick={handleAddSubTask}>Add</button>
            </div>
          </div>
          
          <div className="modal-actions" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
            {!isNew ? (
              <button type="button" className="md-button md-button--text" style={{ color: 'var(--md-sys-color-error)' }} onClick={handleDelete}>
                Delete Phase
              </button>
            ) : (
              <div></div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="md-button md-button--text" onClick={onClose}>Cancel</button>
              <button type="submit" className="md-button md-button--filled">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
