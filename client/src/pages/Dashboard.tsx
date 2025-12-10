import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectForm } from '@/components/ProjectForm';
import { ProjectLogs } from '@/components/ProjectLogs';
import { QuickGenerateDialog } from '@/components/QuickGenerateDialog';
import { api, Project, FlutterBuilderAPI } from '@/lib/api';
import { Loader2, Plus, Zap, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

/**
 * Dashboard Page
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Two-panel asymmetric layout with project grid
 * - Floating action buttons for common tasks
 * - Real-time status indicators
 * - Smooth transitions and loading states
 */

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQuickGenerateOpen, setIsQuickGenerateOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch projects'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data: {
    name: string;
    description: string;
    json_data: Record<string, any>;
  }) => {
    try {
      const newProject = await api.createProject(data);
      setProjects([newProject, ...projects]);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project'
      );
      throw error;
    }
  };

  const handleUpdateProject = async (data: {
    name: string;
    description: string;
    json_data: Record<string, any>;
  }) => {
    if (!selectedProject) return;
    try {
      const updated = await api.updateProject(selectedProject.id, data);
      setProjects(
        projects.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update project'
      );
      throw error;
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
    }
  };

  const handleGenerateProject = async (id: number) => {
    setGeneratingId(id);
    try {
      await api.generateProject(id);
      toast.success('Generation started successfully');
      // Show logs dialog
      setSelectedProjectId(id);
      setIsLogsOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate project'
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadProject = async (id: number) => {
    try {
      const blob = await api.downloadProject(id);
      const project = projects.find((p) => p.id === id);
      const filename = `${project?.name || 'flutter_app'}.zip`;
      FlutterBuilderAPI.downloadFile(blob, filename);
      toast.success('Project downloaded successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to download project'
      );
    }
  };

  const handleQuickGenerate = async (data: {
    app_name: string;
    package_name: string;
    json_data: Record<string, any>;
  }) => {
    try {
      const blob = await api.quickGenerate(data);
      FlutterBuilderAPI.downloadFile(blob, `${data.app_name}.zip`);
      toast.success('Flutter app generated and downloaded successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate app'
      );
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Flutter Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage Flutter applications
            </p>
          </div>
          <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsQuickGenerateOpen(true)}
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Quick Generate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/builder')}
                  className="gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Visual Builder
                </Button>
                <Button
                  onClick={() => {
                    setSelectedProject(undefined);
                    setIsFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 text-5xl">📦</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No projects yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first Flutter app project to get started
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsQuickGenerateOpen(true)}
              >
                Quick Generate
              </Button>
              <Button
                onClick={() => {
                  setSelectedProject(undefined);
                  setIsFormOpen(true);
                }}
              >
                Create Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setSelectedProject(p);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteProject}
                onGenerate={handleGenerateProject}
                onDownload={handleDownloadProject}
                isGenerating={generatingId === project.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ProjectForm
        open={isFormOpen}
        project={selectedProject}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(undefined);
        }}
        onSubmit={
          selectedProject ? handleUpdateProject : handleCreateProject
        }
      />

      <QuickGenerateDialog
        open={isQuickGenerateOpen}
        onClose={() => setIsQuickGenerateOpen(false)}
        onSubmit={handleQuickGenerate}
      />

      <ProjectLogs
        open={isLogsOpen}
        projectId={selectedProjectId}
        onClose={() => setIsLogsOpen(false)}
        onFetchLogs={(id) => api.getProjectLogs(id)}
      />
    </div>
  );
}
