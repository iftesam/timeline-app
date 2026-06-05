import React, { useState } from 'react';
import type { Project } from '../types';
import { useTimeline } from '../context/TimelineContext';
import './TaskModal.css'; // Re-use the existing modal styles

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  isNew?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, isNew = false }) => {
  const { updateProject, addProject, deleteProject } = useTimeline();
  const [formData, setFormData] = useState<Project>({ ...project });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addProject(formData);
    } else {
      updateProject(formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this project? ALL tasks associated with it will also be permanently deleted.")) {
      deleteProject(project.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? "New Project" : "Edit Project"}</h2>
          <button type="button" className="md-icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Q3 Roadmap" />
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
          
          <div className="modal-actions" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', marginTop: '32px' }}>
            {!isNew ? (
              <button type="button" className="md-button md-button--text" style={{ color: 'var(--md-sys-color-error)' }} onClick={handleDelete}>
                Delete Project
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

export default ProjectModal;
