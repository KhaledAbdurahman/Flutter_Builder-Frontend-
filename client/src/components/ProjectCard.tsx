import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/lib/api';
import { Download, Edit2, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

/**
 * ProjectCard Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Card-based layout with gradient accent bars
 * - Hover effects revealing metadata
 * - Icon-driven action buttons
 * - Smooth transitions and elevation effects
 */

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onGenerate: (id: number) => void;
  onDownload: (id: number) => void;
  isGenerating?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onGenerate,
  onDownload,
  isGenerating = false,
}: ProjectCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      setIsDeleting(true);
      try {
        onDelete(project.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const gradientColors = [
    'from-indigo-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-blue-500 to-indigo-500',
  ];

  // Use project ID to deterministically select a gradient
  const gradientIndex = project.id % gradientColors.length;
  const gradient = gradientColors[gradientIndex];

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {project.description || 'No description provided'}
          </p>
        </div>

        {/* Metadata */}
        <div className="mb-4 text-xs text-muted-foreground space-y-1">
          <p>
            Created: {new Date(project.created_at).toLocaleDateString()}
          </p>
          <p>
            Updated: {new Date(project.updated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Actions - visible on hover */}
        <div
          className={`flex gap-2 transition-all duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(project)}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => onGenerate(project.id)}
            disabled={isGenerating}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-1" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(project.id)}
            title="Download generated project"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Always visible action buttons when not hovering */}
        {!isHovering && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onGenerate(project.id)}
              disabled={isGenerating}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
