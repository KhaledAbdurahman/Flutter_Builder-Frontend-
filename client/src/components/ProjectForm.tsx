import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * ProjectForm Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Clean modal dialog with clear form hierarchy
 * - Smooth animations and transitions
 * - Optimistic UI updates
 */

interface ProjectFormProps {
  open: boolean;
  project?: Project;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    json_data: Record<string, any>;
  }) => Promise<void>;
}

export function ProjectForm({
  open,
  project,
  onClose,
  onSubmit,
}: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setJsonData(JSON.stringify(project.json_data, null, 2));
    } else {
      setName('');
      setDescription('');
      setJsonData(
        JSON.stringify(
          {
            app_name: 'my_app',
            package_name: 'com.example.myapp',
            screens: [
              {
                id: 'home',
                name: 'Home',
                route: '/',
                is_home: true,
                components: [
                  {
                    type: 'Scaffold',
                    children: [
                      {
                        type: 'AppBar',
                        props: {
                          title: 'My App',
                        },
                      },
                      {
                        type: 'Center',
                        children: [
                          {
                            type: 'Text',
                            props: {
                              text: 'Hello World!',
                              fontSize: 24,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          null,
          2
        )
      );
    }
    setError(null);
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const parsedJson = JSON.parse(jsonData);
      await onSubmit({
        name,
        description,
        json_data: parsedJson,
      });
      onClose();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your JSON data.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project
              ? 'Update your Flutter app project details'
              : 'Create a new Flutter app project with JSON configuration'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Flutter App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your Flutter app..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* JSON Configuration */}
          <div className="space-y-2">
            <Label htmlFor="json">JSON Configuration</Label>
            <Textarea
              id="json"
              placeholder="Paste your Flutter JSON configuration here..."
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Define your Flutter app structure using the supported widgets and props
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
