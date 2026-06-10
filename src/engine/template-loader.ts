// src/engine/template-loader.ts
// Template loader for agent templates - loads from backend API

import { invoke } from '@tauri-apps/api/core';
import { AgentTemplate } from '../types';

class TemplateLoader {
  private cachedTemplates: AgentTemplate[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  /**
   * Load all agent templates from the backend, optionally filtered by category.
   * Uses caching to avoid unnecessary API calls.
   */
  async loadTemplates(category?: string): Promise<AgentTemplate[]> {
    // Check if we have a fresh cache
    if (
      this.cachedTemplates &&
      this.cacheTimestamp &&
      Date.now() - this.cacheTimestamp < this.cacheDuration
    ) {
      if (!category) {
        return this.cachedTemplates;
      }
      return this.cachedTemplates.filter(tpl => tpl.category === category);
    }

    try {
      const templates: AgentTemplate[] = await invoke('list_agent_templates', {
        category: category || null
      });
      
      // Update cache if this was a general request (no category filter)
      if (!category) {
        this.cachedTemplates = templates;
        this.cacheTimestamp = Date.now();
      }
      
      return templates;
    } catch (error) {
      console.error('[template-loader] Failed to load templates:', error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Search agent templates by query string.
   * Does not update the cache since search results are custom.
   */
  async searchTemplates(query: string): Promise<AgentTemplate[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const templates: AgentTemplate[] = await invoke('search_agent_templates', {
        query: query.trim()
      });
      
      return templates;
    } catch (error) {
      console.error('[template-loader] Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Install a specific template to create an agent.
   */
  async installTemplate(templateId: string): Promise<{ success: boolean; agentId?: string; error?: string }> {
    try {
      const agentId: string = await invoke('install_agent_template', {
        templateId: templateId
      });
      
      return { success: true, agentId };
    } catch (error) {
      console.error('[template-loader] Failed to install template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to install template'
      };
    }
  }

  /**
   * Seed builtin templates into the database (call once at first launch).
   */
  async seedBuiltinTemplates(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      await invoke('seed_builtin_templates');
      // Clear cache since new templates might have been added
      this.cachedTemplates = null;
      this.cacheTimestamp = null;
      
      return { success: true, count: -1 }; // We don't know the count from the invoke response
    } catch (error) {
      console.error('[template-loader] Failed to seed builtin templates:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to seed builtin templates'
      };
    }
  }

  /**
   * Clear the internal cache (useful when templates are updated).
   */
  clearCache(): void {
    this.cachedTemplates = null;
    this.cacheTimestamp = null;
  }

  /**
   * Create a new agent template.
   */
  async createTemplate(template: AgentTemplate): Promise<void> {
    try {
      await invoke('create_agent_template', {
        template: template
      });

      // Clear cache to refresh on next load
      this.clearCache();
    } catch (error) {
      console.error('[template-loader] Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update an existing agent template.
   */
  async updateTemplate(template: AgentTemplate): Promise<void> {
    try {
      await invoke('update_agent_template', {
        templateId: template.id,
        template: template
      });

      // Clear cache to refresh on next load
      this.clearCache();
    } catch (error) {
      console.error('[template-loader] Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Delete an agent template.
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await invoke('delete_agent_template', {
        templateId: templateId
      });

      // Clear cache to refresh on next load
      this.clearCache();
    } catch (error) {
      console.error('[template-loader] Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Synchronize remote templates, checking for updates from the registry.
   * Compares versions and downloads any that need updates.
   * Handles offline gracefully by falling back to existing cache.
   */
  async syncRemoteTemplates(): Promise<{ 
    success: boolean; 
    updatedCount?: number;
    errorCount?: number;
    errors?: string[];
    totalCount?: number;
    message?: string;
  }> {
    try {
      // Fetch available remote templates that need update
      const templatesToSync: Array<{
        template: AgentTemplate;
        local_version: string | null;
        needs_update: boolean;
      }> = await invoke('fetch_remote_templates_registry');

      // Extract only those that actually need an update
      const templatesForUpdate = templatesToSync
        .filter(item => item.needs_update)
        .map(item => item.template);

      if (templatesForUpdate.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          message: 'All templates are up-to-date.' 
        };
      }

      // Sync the templates from remote
      const syncResult: any = await invoke('sync_templates_from_remote', {
        remoteTemplates: templatesForUpdate
      });

      // Update our cache
      this.cachedTemplates = null;
      this.cacheTimestamp = null;
      
      return {
        success: true,
        updatedCount: typeof syncResult.updated_count === 'number' ? syncResult.updated_count : 0,
        errorCount: typeof syncResult.error_count === 'number' ? syncResult.error_count : 0,
        errors: Array.isArray(syncResult.errors) ? syncResult.errors : [],
        totalCount: templatesForUpdate.length
      };
    } catch (error) {
      console.warn('[template-loader] Remote sync failed, using cached templates:', error);
      // Still return success if we have cached templates to fall back on  
      if (this.cachedTemplates) {
        return {
          success: true,
          updatedCount: 0,
          message: 'Using cached templates (remote sync failed)'
        };
      } else {
        return {
          success: false,
          errorCount: 1,
          errors: [error instanceof Error ? error.message : 'Sync failed'],
          message: 'Failed to sync templates remotely and no cached templates available'
        };
      }
    }
  }
}

// Singleton instance
export const templateLoader = new TemplateLoader();

export { TemplateLoader };