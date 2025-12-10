import { Button } from '@/components/ui/button';
import { CanvasRenderer } from '@/components/CanvasRenderer';
import { ComponentPalette } from '@/components/ComponentPalette';
import { ComponentTree } from '@/components/ComponentTree';
import { PropertyEditor } from '@/components/PropertyEditor';
import { api, Project } from '@/lib/api';
import { ComponentNode, createDefaultComponent } from '@/lib/widgets';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

/**
 * Visual Builder Page
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Three-panel layout: palette, canvas, properties
 * - Hierarchy tree for component organization
 * - Real-time preview and editing
 * - Seamless JSON sync
 */

interface VisualBuilderProps {
  projectId?: string;
}

export default function VisualBuilder({ projectId }: VisualBuilderProps) {
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<ComponentNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load project if editing existing
  useEffect(() => {
    if (projectId) {
      loadProject(parseInt(projectId));
    } else {
      // New project - start with empty Scaffold
      setComponents([createDefaultComponent('Scaffold')]);
      setIsLoading(false);
    }
  }, [projectId]);

  const loadProject = async (id: number) => {
    try {
      const proj = await api.getProject(id);
      setProject(proj);
      
      // Extract components from json_data
      if (proj.json_data.screens && proj.json_data.screens[0]) {
        const screen = proj.json_data.screens[0];
        if (screen.components) {
          setComponents(screen.components);
        }
      }
    } catch (error) {
      toast.error('Failed to load project');
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedComponent = components.length > 0 
    ? findComponentById(components[0], selectedId || '')
    : null;

  const handleAddComponent = (type: string) => {
    const newComponent = createDefaultComponent(type);
    
    // If no components, replace with new one
    if (components.length === 0) {
      setComponents([newComponent]);
    } else {
      // Add to first component's children (usually Scaffold)
      const updated = [...components];
      updated[0].children.push(newComponent);
      setComponents(updated);
    }
    
    setSelectedId(newComponent.id);
    toast.success(`Added ${type} component`);
  };

  const handleUpdateProps = (props: Record<string, any>) => {
    if (!selectedId) return;

    const updated = updateComponentInTree(components, selectedId, (comp) => ({
      ...comp,
      props,
    }));
    setComponents(updated);
  };

  const handleDeleteComponent = () => {
    if (!selectedId) return;

    const updated = deleteComponentFromTree(components, selectedId);
    setComponents(updated);
    setSelectedId(null);
    toast.success('Component deleted');
  };

  const handleSaveProject = async () => {
    if (!project) {
      toast.error('No project to save');
      return;
    }

    setIsSaving(true);
    try {
      const jsonData = {
        app_name: project.name.toLowerCase().replace(/\s+/g, '_'),
        package_name: 'com.example.app',
        screens: [
          {
            id: 'home',
            name: 'Home',
            route: '/',
            is_home: true,
            components,
          },
        ],
      };

      await api.updateProject(project.id, {
        name: project.name,
        description: project.description,
        json_data: jsonData,
      });

      toast.success('Project saved successfully');
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
      app_name: project?.name.toLowerCase().replace(/\s+/g, '_') || 'my_app',
      package_name: 'com.example.app',
      screens: [
        {
          id: 'home',
          name: 'Home',
          route: '/',
          is_home: true,
          components,
        },
      ],
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
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
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
              <p className="text-xs text-muted-foreground">Visual Builder</p>
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
            {project && (
              <Button
                size="sm"
                onClick={handleSaveProject}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Project'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Palette */}
        <div className="w-64 border-r border-border bg-card overflow-hidden">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-background p-8">
            <div className="max-w-4xl mx-auto">
              {components.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    No components yet. Add one from the palette.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                  {components.map((component) => (
                    <CanvasRenderer
                      key={component.id}
                      component={component}
                      selectedId={selectedId || undefined}
                      onSelectComponent={setSelectedId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hierarchy & Properties */}
        <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden border-b border-border">
            <ComponentTree
              components={components}
              selectedId={selectedId || undefined}
              onSelectComponent={setSelectedId}
              onDeleteComponent={handleDeleteComponent}
            />
          </div>
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
