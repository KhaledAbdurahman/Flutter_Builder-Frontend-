import { ComponentNode, getWidgetDefinition } from '@/lib/widgets';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

/**
 * Component Tree Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Hierarchical view of component structure
 * - Expand/collapse sections
 * - Quick delete buttons
 * - Visual selection indicator
 */

interface ComponentTreeProps {
  components: ComponentNode[];
  selectedId?: string;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
}

export function ComponentTree({
  components,
  selectedId,
  onSelectComponent,
  onDeleteComponent,
}: ComponentTreeProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Hierarchy</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Component structure and organization
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {components.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No components yet. Add one from the palette.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {components.map((component) => (
              <TreeNode
                key={component.id}
                component={component}
                selectedId={selectedId}
                onSelectComponent={onSelectComponent}
                onDeleteComponent={onDeleteComponent}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  component: ComponentNode;
  selectedId?: string;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  level: number;
}

function TreeNode({
  component,
  selectedId,
  onSelectComponent,
  onDeleteComponent,
  level,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const definition = getWidgetDefinition(component.type);
  const isSelected = selectedId === component.id;
  const hasChildren = component.children.length > 0;

  if (!definition) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-secondary/50 text-foreground'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectComponent(component.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 p-0 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <span className="text-lg flex-shrink-0">{definition.icon}</span>
        <span className="text-sm font-medium flex-1 truncate">
          {definition.name}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteComponent(component.id);
          }}
          className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {isExpanded &&
        hasChildren &&
        component.children.map((child) => (
          <TreeNode
            key={child.id}
            component={child}
            selectedId={selectedId}
            onSelectComponent={onSelectComponent}
            onDeleteComponent={onDeleteComponent}
            level={level + 1}
          />
        ))}
    </div>
  );
}
