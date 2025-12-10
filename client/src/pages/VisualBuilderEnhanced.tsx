import { Button } from '@/components/ui/button';
import { PhoneCanvas } from '@/components/PhoneCanvas';
import { ComponentPalette } from '@/components/ComponentPalette';
import { EnhancedComponentTree } from '@/components/EnhancedComponentTree';
import { PageManager, Page } from '@/components/PageManager';
import { PropertyEditor } from '@/components/PropertyEditor';
import { api, Project } from '@/lib/api';
import { ComponentNode, createDefaultComponent, canContainWidget } from '@/lib/widgets';
import { validateProjectForm } from '@/lib/validation';
import { AlertCircle, ArrowLeft, Download, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

/**
 * Enhanced Visual Builder Page
 * 
 * Features:
 * - Multi-page/screen support
 * - Real widget nesting with parent-child relationships
 * - Realistic phone screen canvas preview
 * - Comprehensive validation
 * - Light mode theme
 */

interface VisualBuilderProps {
  projectId?: string;
}

interface PageData {
  id: string;
  name: string;
  route: string;
  is_home: boolean;
  components: ComponentNode[];
}

export default function VisualBuilderEnhanced({ projectId }: VisualBuilderProps) {
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load project if editing existing
  useEffect(() => {
    if (projectId) {
      loadProject(parseInt(projectId));
    } else {
      // New project - start with one home page
      const homePageId = `page_${Date.now()}`;
      const newPage: PageData = {
        id: homePageId,
        name: 'Home',
        route: '/',
        is_home: true,
        components: [createDefaultComponent('Scaffold')],
      };
      setPages([newPage]);
      setCurrentPageId(homePageId);
      setIsLoading(false);
    }
  }, [projectId]);

  const loadProject = async (id: number) => {
    try {
      const proj = await api.getProject(id);
      setProject(proj);

      // Extract pages from json_data
      if (proj.json_data.screens && Array.isArray(proj.json_data.screens)) {
        const loadedPages: PageData[] = proj.json_data.screens.map(
          (screen: any) => ({
            id: screen.id,
            name: screen.name,
            route: screen.route,
            is_home: screen.is_home,
            components: screen.components || [createDefaultComponent('Scaffold')],
          })
        );
        setPages(loadedPages);
        setCurrentPageId(loadedPages[0]?.id || '');
      }
    } catch (error) {
      toast.error('Failed to load project');
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPage = pages.find((p) => p.id === currentPageId);
  const selectedComponent = currentPage
    ? findComponentById(currentPage.components[0], selectedComponentId || '')
    : null;

  const handleAddComponent = (type: string) => {
    if (!currentPage) return;

    const newComponent = createDefaultComponent(type);
    const updatedPages = pages.map((p) => {
      if (p.id !== currentPageId) return p;

      const updatedComponents = [...p.components];
      if (updatedComponents.length === 0) {
        updatedComponents.push(newComponent);
      } else {
        updatedComponents[0].children.push(newComponent);
      }

      return { ...p, components: updatedComponents };
    });

    setPages(updatedPages);
    setSelectedComponentId(newComponent.id);
    toast.success(`Added ${type} component`);
  };

  const handleAddChild = (parentId: string, childType: string) => {
    if (!currentPage) return;

    // Find parent and check if it can contain children
    const parent = findComponentById(currentPage.components[0], parentId);
    if (!parent || !canContainWidget(parent.type, childType)) {
      toast.error(`${parent?.type} cannot contain ${childType}`);
      return;
    }

    const newChild = createDefaultComponent(childType);
    const updatedPages = pages.map((p) => {
      if (p.id !== currentPageId) return p;

      const updated = updateComponentInTree(p.components, parentId, (comp) => ({
        ...comp,
        children: [...comp.children, newChild],
      }));

      return { ...p, components: updated };
    });

    setPages(updatedPages);
    setSelectedComponentId(newChild.id);
    toast.success(`Added ${childType} to ${parent.type}`);
  };

  const handleUpdateProps = (props: Record<string, any>) => {
    if (!selectedComponentId || !currentPage) return;

    const updatedPages = pages.map((p) => {
      if (p.id !== currentPageId) return p;

      const updated = updateComponentInTree(p.components, selectedComponentId, (comp) => ({
        ...comp,
        props,
      }));

      return { ...p, components: updated };
    });

    setPages(updatedPages);
  };

  const handleDeleteComponent = () => {
    if (!selectedComponentId || !currentPage) return;

    const updatedPages = pages.map((p) => {
      if (p.id !== currentPageId) return p;

      const updated = deleteComponentFromTree(p.components, selectedComponentId);
      return { ...p, components: updated };
    });

    setPages(updatedPages);
    setSelectedComponentId(null);
    toast.success('Component deleted');
  };

  const handleAddPage = (page: Page) => {
    const newPage: PageData = {
      ...page,
      components: [createDefaultComponent('Scaffold')],
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    toast.success(`Page "${page.name}" created`);
  };

  const handleDeletePage = (id: string) => {
    if (pages.length === 1) {
      toast.error('You must have at least one page');
      return;
    }

    const updated = pages.filter((p) => p.id !== id);
    setPages(updated);

    if (currentPageId === id) {
      setCurrentPageId(updated[0].id);
    }

    toast.success('Page deleted');
  };

  const handleUpdatePage = (id: string, updates: Partial<Page>) => {
    const updated = pages.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setPages(updated);
    toast.success('Page updated');
  };

  const handleSaveProject = async () => {
    // Validate project
    const projectData = {
      name: project?.name || 'Untitled Project',
      description: project?.description || '',
      json_data: {
        app_name: (project?.name || 'my_app').toLowerCase().replace(/\s+/g, '_'),
        package_name: 'com.example.app',
        screens: pages.map((page) => ({
          id: page.id,
          name: page.name,
          route: page.route,
          is_home: page.is_home,
          components: page.components,
        })),
      },
    };

    const validation = validateProjectForm(projectData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map((e) => e.message));
      toast.error('Please fix validation errors');
      return;
    }

    setValidationErrors([]);
    setIsSaving(true);

    try {
      if (project) {
        await api.updateProject(project.id, projectData);
        toast.success('Project saved successfully');
      } else {
        const newProject = await api.createProject(projectData);
        setProject(newProject);
        toast.success('Project created successfully');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save project'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    const jsonData = {
      app_name: (project?.name || 'my_app').toLowerCase().replace(/\s+/g, '_'),
      package_name: 'com.example.app',
      screens: pages.map((page) => ({
        id: page.id,
        name: page.name,
        route: page.route,
        is_home: page.is_home,
        components: page.components,
      })),
    };

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project?.name || 'flutter_app'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {project?.name || 'New Project'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {pages.length} page{pages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProject}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Validation Errors
                </p>
                <ul className="text-xs text-destructive space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Palette */}
        <div className="w-64 border-r border-border bg-card overflow-hidden">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
            {!currentPage || currentPage.components.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  No components yet. Add one from the palette.
                </p>
              </div>
            ) : (
              currentPage.components.map((component) => (
                <PhoneCanvas
                  key={component.id}
                  component={component}
                  selectedId={selectedComponentId || undefined}
                  onSelectComponent={setSelectedComponentId}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Pages, Hierarchy & Properties */}
        <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
          {/* Pages Tab */}
          <div className="flex-1 flex flex-col overflow-hidden border-b border-border">
            <PageManager
              pages={pages}
              currentPageId={currentPageId}
              onSelectPage={setCurrentPageId}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
              onUpdatePage={handleUpdatePage}
            />
          </div>

          {/* Hierarchy Tab */}
          <div className="flex-1 flex flex-col overflow-hidden border-b border-border">
            {currentPage && (
              <EnhancedComponentTree
                components={currentPage.components}
                selectedId={selectedComponentId || undefined}
                onSelectComponent={setSelectedComponentId}
                onAddChild={handleAddChild}
                onDeleteComponent={handleDeleteComponent}
              />
            )}
          </div>

          {/* Properties Tab */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <PropertyEditor
              component={selectedComponent}
              onUpdateProps={handleUpdateProps}
              onDeleteComponent={handleDeleteComponent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function findComponentById(
  component: ComponentNode,
  id: string
): ComponentNode | null {
  if (component.id === id) return component;

  for (const child of component.children) {
    const found = findComponentById(child, id);
    if (found) return found;
  }

  return null;
}

function updateComponentInTree(
  components: ComponentNode[],
  id: string,
  updater: (comp: ComponentNode) => ComponentNode
): ComponentNode[] {
  return components.map((comp) => updateComponentRecursive(comp, id, updater));
}

function updateComponentRecursive(
  component: ComponentNode,
  id: string,
  updater: (comp: ComponentNode) => ComponentNode
): ComponentNode {
  if (component.id === id) {
    return updater(component);
  }

  return {
    ...component,
    children: component.children.map((child) =>
      updateComponentRecursive(child, id, updater)
    ),
  };
}

function deleteComponentFromTree(
  components: ComponentNode[],
  id: string
): ComponentNode[] {
  return components
    .map((comp) => deleteComponentRecursive(comp, id))
    .filter((comp) => comp !== null) as ComponentNode[];
}

function deleteComponentRecursive(
  component: ComponentNode,
  id: string
): ComponentNode | null {
  if (component.id === id) {
    return null;
  }

  const children = component.children
    .map((child) => deleteComponentRecursive(child, id))
    .filter((child) => child !== null) as ComponentNode[];

  return {
    ...component,
    children,
  };
}
