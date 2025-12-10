import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComponentNode, getWidgetDefinition } from '@/lib/widgets';
import { Trash2 } from 'lucide-react';

/**
 * Property Editor Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Real-time property editing
 * - Type-specific input controls
 * - Color picker for color props
 * - Enum selector for constrained values
 */

interface PropertyEditorProps {
  component: ComponentNode | null;
  onUpdateProps: (props: Record<string, any>) => void;
  onDeleteComponent: () => void;
}

export function PropertyEditor({
  component,
  onUpdateProps,
  onDeleteComponent,
}: PropertyEditorProps) {
  if (!component) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-2">No component selected</p>
          <p className="text-xs text-muted-foreground">
            Click on a component in the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const definition = getWidgetDefinition(component.type);
  if (!definition) return null;

  const handlePropChange = (propName: string, value: any) => {
    onUpdateProps({
      ...component.props,
      [propName]: value,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{definition.icon}</span>
            {definition.name}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeleteComponent}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{component.id}</p>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {definition.props.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              This component has no editable properties
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {definition.props.map((prop) => (
              <PropertyInput
                key={prop.name}
                prop={prop}
                value={component.props[prop.name]}
                onChange={(value) => handlePropChange(prop.name, value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PropertyInputProps {
  prop: any;
  value: any;
  onChange: (value: any) => void;
}

function PropertyInput({ prop, value, onChange }: PropertyInputProps) {
  const displayValue = value !== undefined ? value : prop.defaultValue ?? '';

  switch (prop.type) {
    case 'string':
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name} className="text-xs">
            {prop.label}
          </Label>
          <Input
            id={prop.name}
            type="text"
            placeholder={prop.placeholder}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name} className="text-xs">
            {prop.label}
          </Label>
          <Input
            id={prop.name}
            type="number"
            value={displayValue}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2 py-2">
          <input
            id={prop.name}
            type="checkbox"
            checked={displayValue || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor={prop.name} className="text-xs cursor-pointer">
            {prop.label}
          </Label>
        </div>
      );

    case 'color':
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name} className="text-xs">
            {prop.label}
          </Label>
          <div className="flex gap-2">
            <input
              id={prop.name}
              type="color"
              value={displayValue || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-border"
            />
            <Input
              type="text"
              placeholder="#000000"
              value={displayValue}
              onChange={(e) => onChange(e.target.value)}
              className="text-sm flex-1 font-mono"
            />
          </div>
        </div>
      );

    case 'enum':
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.name} className="text-xs">
            {prop.label}
          </Label>
          <Select value={displayValue} onValueChange={onChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    default:
      return null;
  }
}
