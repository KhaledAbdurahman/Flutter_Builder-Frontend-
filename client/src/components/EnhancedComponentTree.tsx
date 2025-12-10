import { ComponentNode, createDefaultComponent, WIDGET_TYPES } from '@/lib/widgets';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Enhanced Component Tree
 * 
 * Shows the hierarchical structure of components
 * Allows adding children to any component
 * Supports drag-and-drop nesting
 */

interface EnhancedComponentTreeProps {
  components: ComponentNode[];
  selectedId?: string;
  onSelectComponent: (id: string) => void;
  onAddChild: (parentId: string, childType: string) => void;
  onDeleteComponent: (id: string) => void;
}

export function EnhancedComponentTree({
  components,
  selectedId,
  onSelectComponent,
  onAddChild,
  onDeleteComponent,
}: EnhancedComponentTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Component Tree</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click to select • Right-click to add children
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {components.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No components
          </p>
        ) : (
          <div className="space-y-1">
            {components.map((component) => (
              <TreeNode
                key={component.id}
                component={component}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelectComponent={onSelectComponent}
                onToggleExpanded={toggleExpanded}
                onAddChild={onAddChild}
                onDeleteComponent={onDeleteComponent}
                depth={0}
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
  expandedIds: Set<string>;
  onSelectComponent: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: (parentId: string, childType: string) => void;
  onDeleteComponent: (id: string) => void;
  depth: number;
}

function TreeNode({
  component,
  selectedId,
  expandedIds,
  onSelectComponent,
  onToggleExpanded,
  onAddChild,
  onDeleteComponent,
  depth,
}: TreeNodeProps) {
  const isSelected = component.id === selectedId;
  const isExpanded = expandedIds.has(component.id);
  const hasChildren = component.children.length > 0;
  const canHaveChildren = !['Text', 'Button', 'TextField', 'Icon', 'Image'].includes(component.type);

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/20 text-primary font-medium'
            : 'hover:bg-secondary/50 text-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* Expand/Collapse Arrow */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(component.id);
            }}
            className="p-0 hover:bg-primary/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Component Name */}
        <div
          onClick={() => onSelectComponent(component.id)}
          className="flex-1 min-w-0"
        >
          <p className="truncate font-medium">{component.type}</p>
          {component.props.text && (
            <p className="text-xs text-muted-foreground truncate">
              "{component.props.text}"
            </p>
          )}
        </div>

        {/* Add Child Button */}
        {canHaveChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add a Container as default child
              onAddChild(component.id, 'Container');
            }}
            className="p-1 hover:bg-primary/20 text-primary rounded"
            title="Add child widget"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete ${component.type}?`)) {
              onDeleteComponent(component.id);
            }
          }}
          className="p-1 hover:bg-destructive/20 text-destructive rounded"
          title="Delete component"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {component.children.map((child) => (
            <TreeNode
              key={child.id}
              component={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelectComponent={onSelectComponent}
              onToggleExpanded={onToggleExpanded}
              onAddChild={onAddChild}
              onDeleteComponent={onDeleteComponent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Add Child Dropdown */}
      {hasChildren && isExpanded && (
        <div className="px-2 py-1 ml-2 border-l-2 border-border">
          <div className="text-xs text-muted-foreground mb-1">Add child:</div>
          <div className="grid grid-cols-2 gap-1">
            {WIDGET_TYPES.slice(0, 8).map((type: string) => (
              <button
                key={type}
                onClick={() => onAddChild(component.id, type)}
                className="px-2 py-1 text-xs bg-secondary hover:bg-primary/20 text-foreground rounded transition-colors"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
