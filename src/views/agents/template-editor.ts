// src/views/agents/template-editor.ts
// Modal dialog for admin template creation/editing

import { t } from '../../i18n';
import { AgentTemplate, TemplatePersonality } from '../../types';
import { templateLoader } from '../../engine/template-loader';

class TemplateEditor {
  private modalElement: HTMLElement;
  private isEditing = false;
  private currentTemplate: AgentTemplate | null = null;
  private onSaveCallback?: (template: AgentTemplate) => void;

  constructor() {
    this.modalElement = this.createModalElement();
    document.body.appendChild(this.modalElement);
  }

  private createModalElement(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay agents-template-editor-modal';
    modal.innerHTML = `
      <div class="modal-content agents-template-modal" style="min-width: 800px; max-width: 90vw;">
        <div class="modal-header">
          <h3 class="modal-title"><span class="ms ms-sm">edit_note</span> <span id="editor-modal-title">Create Template</span></h3>
          <button id="close-template-modal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="template-form" class="form-grid">
            <div class="form-group">
              <label for="template-id">Template ID *</label>
              <input type="text" id="template-id" placeholder="Unique identifier for this template" required>
              <small class="text-muted">Must be unique. Can only contain letters, numbers, hyphens and underscores.</small>
            </div>
            
            <div class="form-group">
              <label for="template-name">Name *</label>
              <input type="text" id="template-name" placeholder="Enter template name" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="template-icon">Icon</label>
                <input type="text" id="template-icon" placeholder="Material Symbol name (e.g., smart_toy)">
                <small class="text-muted">See Material Symbols for available icons</small>
              </div>
              
              <div class="form-group">
                <label for="template-category">Category *</label>
                <select id="template-category" required>
                  <option value="">Select category</option>
                  <option value="productivity">Productivity</option>
                  <option value="engineering">Engineering</option>
                  <option value="creative">Creative</option>
                  <option value="data">Data & Research</option>
                  <option value="security">Security</option>
                  <option value="trading">Trading</option>
                  <option value="communication">Communication</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="template-description">Description *</label>
              <textarea id="template-description" placeholder="Brief description of this template" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="template-model">Model *</label>
              <select id="template-model" required>
                <option value="">Select a model</option>
                <!-- Options will be populated dynamically -->
              </select>
            </div>
            
            <div class="form-group">
              <label for="template-system-prompt">System Prompt *</label>
              <textarea id="template-system-prompt" rows="8" placeholder="The initial system prompt for the agent" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Personality Tone</label>
                <select id="personality-tone">
                  <option value="casual">Casual</option>
                  <option value="balanced">Balanced</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Personality Initiative</label>
                <select id="personality-initiative">
                  <option value="reactive">Reactive</option>
                  <option value="balanced">Balanced</option>
                  <option value="proactive">Proactive</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Personality Detail</label>
                <select id="personality-detail">
                  <option value="brief">Brief</option>
                  <option value="balanced">Balanced</option>
                  <option value="thorough">Thorough</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="template-boundaries">${t('Boundaries')}</label>
              <textarea id="template-boundaries" placeholder="${t('Line-separated boundaries for the agent (one per line)')}"></textarea>
              <small class="text-muted">${t('Each boundary on a new line')}</small>
            </div>
            
            <div class="form-group">
              <label for="template-skills">Skills</label>
              <input type="text" id="template-skills" placeholder="Comma-separated list of skills (e.g., web_search, read_file)">
              <small class="text-muted">List skills separated by commas</small>
            </div>
            
            <div class="form-group">
              <label for="template-tags">Tags</label>
              <input type="text" id="template-tags" placeholder="Comma-separated list of tags (e.g., ai, utility, advanced)">
              <small class="text-muted">Tags help with discovery and categorization</small>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button id="cancel-template-btn" class="btn btn-secondary">Cancel</button>
          <button id="save-template-btn" class="btn btn-primary">Save Template</button>
        </div>
      </div>
    `;
    
    this.bindEvents(modal);
    this.populateModelOptions();
    
    return modal;
  }

  private bindEvents(modal: HTMLElement): void {
    const closeModalBtn = modal.querySelector('#close-template-modal') as HTMLElement;
    const cancelBtn = modal.querySelector('#cancel-template-btn') as HTMLElement;
    const saveBtn = modal.querySelector('#save-template-btn') as HTMLElement;
    
    const closeHandler = () => this.hide();
    
    closeModalBtn?.addEventListener('click', closeHandler);
    cancelBtn?.addEventListener('click', closeHandler);
    
    // Close when clicking on overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hide();
      }
    });
    
    // Form submission
    saveBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleSave();
    });
    
    // Allow saving with Ctrl/Cmd+Enter in the system prompt field
    const systemPromptField = modal.querySelector('#template-system-prompt') as HTMLTextAreaElement;
    systemPromptField?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleSave();
      }
    });
  }

  private populateModelOptions(): void {
    // This would be populated based on available models in actual implementation
    // For MVP, we'll add some common models
    const modelSelect = document.querySelector('#template-model') as HTMLSelectElement;
    const models = [
      'gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'claude-3-haiku',
      'gemini-2.0-flash', 'gemini-3-pro', 'llama-3.1', 'mixtral-8x7b',
      'gpt-3.5-turbo', 'claude-3-opus'
    ];
    
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  }

  private validateForm(): boolean {
    const form = document.querySelector('#template-form') as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    // Additional validation for Template ID format
    const idInput = document.querySelector('#template-id') as HTMLInputElement;
    const idPattern = /^[a-zA-Z0-9_-]+$/;
    
    if (!idPattern.test(idInput.value.trim())) {
      alert('Template ID can only contain letters, numbers, underscores, and hyphens');
      return false;
    }
    
    return true;
  }

  private collectFormData(): Partial<AgentTemplate> {
    const data: Partial<AgentTemplate> = {
      id: (document.querySelector('#template-id') as HTMLInputElement).value.trim(),
      name: (document.querySelector('#template-name') as HTMLInputElement).value.trim(),
      icon: (document.querySelector('#template-icon') as HTMLInputElement).value.trim() || 'smart_toy',
      description: (document.querySelector('#template-description') as HTMLTextAreaElement).value.trim(),
      category: (document.querySelector('#template-category') as HTMLSelectElement).value,
      model: (document.querySelector('#template-model') as HTMLSelectElement).value,
      systemPrompt: (document.querySelector('#template-system-prompt') as HTMLTextAreaElement).value.trim(),
    };
    
    // Parse personality
    data.personality = {
      tone: (document.querySelector('#personality-tone') as HTMLSelectElement).value,
      initiative: (document.querySelector('#personality-initiative') as HTMLSelectElement).value,
      detail: (document.querySelector('#personality-detail') as HTMLSelectElement).value,
    } as TemplatePersonality;
    
    // Parse boundaries (newline separated)
    const boundariesText = (document.querySelector('#template-boundaries') as HTMLTextAreaElement).value.trim();
    data.boundaries = boundariesText ? boundariesText.split('\n').filter(b => b.trim()) : [];
    
    // Parse skills (comma separated)
    const skillsText = (document.querySelector('#template-skills') as HTMLInputElement).value.trim();
    data.skills = skillsText ? skillsText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Parse tags (comma separated)
    const tagsText = (document.querySelector('#template-tags') as HTMLInputElement).value.trim();
    data.tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
    
    return data;
  }

  private async handleSave(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }
    
    const formData = this.collectFormData();
    
    try {
      if (this.isEditing && this.currentTemplate) {
        // Update existing template
        const updatedTemplate: AgentTemplate = {
          ...this.currentTemplate,
          ...formData,
          updated_at: new Date().toISOString(),
        } as AgentTemplate;
        
        await templateLoader.updateTemplate(updatedTemplate);
        this.onSaveCallback?.(updatedTemplate);
      } else {
        // Create new template
        const newTemplate: AgentTemplate = {
          ...formData,
          id: formData.id!,
          name: formData.name!,
          description: formData.description!,
          category: formData.category!,
          model: formData.model!,
          systemPrompt: formData.systemPrompt!,
          personality: formData.personality as TemplatePersonality,
          boundaries: formData.boundaries as string[],
          version: '1.0.0',
          author: 'admin',
          is_public: true,
          is_verified: false,
          popularity: 0,
          skills: formData.skills!,
          tags: formData.tags!,
          source: 'custom',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as AgentTemplate;
        
        await templateLoader.createTemplate(newTemplate);
        this.onSaveCallback?.(newTemplate);
      }
      
      this.showSuccessToast(this.isEditing ? 'Template updated successfully!' : 'Template created successfully!');
      this.hide();
    } catch (error) {
      console.error('Error saving template:', error);
      this.showErrorToast(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public showForNew(): void {
    this.resetForm();
    this.isEditing = false;
    (document.querySelector('#editor-modal-title') as HTMLElement).textContent = 'Create Template';
    (document.querySelector('#template-id') as HTMLInputElement).removeAttribute('readonly');
    this.modalElement.classList.add('show');
  }

  public showForEdit(template: AgentTemplate): void {
    this.resetForm();
    this.currentTemplate = template;
    this.isEditing = true;
    (document.querySelector('#editor-modal-title') as HTMLElement).textContent = 'Edit Template';
    (document.querySelector('#template-id') as HTMLInputElement).setAttribute('readonly', 'readonly');
    
    // Fill the form with template data
    (document.querySelector('#template-id') as HTMLInputElement).value = template.id;
    (document.querySelector('#template-name') as HTMLInputElement).value = template.name;
    (document.querySelector('#template-icon') as HTMLInputElement).value = template.icon;
    (document.querySelector('#template-description') as HTMLTextAreaElement).value = template.description;
    (document.querySelector('#template-category') as HTMLSelectElement).value = template.category;
    (document.querySelector('#template-model') as HTMLSelectElement).value = template.model;
    (document.querySelector('#template-system-prompt') as HTMLTextAreaElement).value = template.systemPrompt;
    
    if (template.personality) {
      (document.querySelector('#personality-tone') as HTMLSelectElement).value = template.personality.tone;
      (document.querySelector('#personality-initiative') as HTMLSelectElement).value = template.personality.initiative;
      (document.querySelector('#personality-detail') as HTMLSelectElement).value = template.personality.detail;
    }
    
    if (template.boundaries) {
      (document.querySelector('#template-boundaries') as HTMLTextAreaElement).value = template.boundaries.join('\n');
    }
    
    if (template.skills) {
      (document.querySelector('#template-skills') as HTMLInputElement).value = template.skills.join(', ');
    }
    
    if (template.tags) {
      (document.querySelector('#template-tags') as HTMLInputElement).value = template.tags.join(', ');
    }
    
    this.modalElement.classList.add('show');
  }

  public hide(): void {
    this.modalElement.classList.remove('show');
  }

  private resetForm(): void {
    const form = document.querySelector('#template-form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
    
    this.currentTemplate = null;
    this.isEditing = false;
  }

  public onSave(callback: (template: AgentTemplate) => void): void {
    this.onSaveCallback = callback;
  }

  private showSuccessToast(message: string): void {
    this.showToast(message, 'success');
  }

  private showErrorToast(message: string): void {
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  private createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
  }
}

// Export a singleton instance
export const templateEditor = new TemplateEditor();

// Helper function to open modal for new template
export function openNewTemplateEditor(onSave: (template: AgentTemplate) => void): void {
  templateEditor.onSave(onSave);
  templateEditor.showForNew();
}

// Helper function to open modal for editing template
export function openEditTemplateEditor(template: AgentTemplate, onSave: (template: AgentTemplate) => void): void {
  templateEditor.onSave(onSave);
  templateEditor.showForEdit(template);
}