import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FLUTTER_WIDGETS, WIDGET_CATEGORIES } from '@/lib/widgets';
import { Plus } from 'lucide-react';
import { useState } from 'react';

/**
 * Component Palette
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Organized widget categories
 * - Drag-and-drop source
 * - Visual widget previews with icons
 */

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('layout');

  const categories = Object.entries(WIDGET_CATEGORIES).reduce(
    (acc, [key, label]) => {
      acc[key] = {
        label,
        widgets: Object.values(FLUTTER_WIDGETS).filter((w) => w.category === key),
      };
      return acc;
    },
    {} as Record<string, { label: string; widgets: typeof FLUTTER_WIDGETS[keyof typeof FLUTTER_WIDGETS][] }>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Components</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag components to canvas or click to add
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(categories).map(([categoryKey, { label, widgets }]) => (
          <div key={categoryKey} className="border-b border-border last:border-b-0">
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === categoryKey ? null : categoryKey
                )
              }
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">
                {widgets.length}
              </span>
            </button>

            {expandedCategory === categoryKey && (
              <div className="px-2 pb-2 space-y-2">
                {widgets.map((widget) => (
                  <ComponentPaletteItem
                    key={widget.id}
                    widget={widget}
                    onAdd={() => onAddComponent(widget.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ComponentPaletteItemProps {
  widget: (typeof FLUTTER_WIDGETS)[keyof typeof FLUTTER_WIDGETS];
  onAdd: () => void;
}

function ComponentPaletteItem({ widget, onAdd }: ComponentPaletteItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('widgetType', widget.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-3 cursor-move transition-all ${
        isDragging
          ? 'opacity-50 scale-95'
          : 'hover:shadow-md hover:bg-card/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{widget.icon}</span>
            <h4 className="text-sm font-medium text-foreground truncate">
              {widget.name}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {widget.description}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
          className="flex-shrink-0"
          title="Add to canvas"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
