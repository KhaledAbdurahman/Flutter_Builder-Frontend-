import { ComponentNode, getWidgetDefinition } from '@/lib/widgets';
import { useState } from 'react';

/**
 * Canvas Renderer Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - WYSIWYG preview of Flutter components
 * - Interactive selection and highlighting
 * - Responsive layout simulation
 */

interface CanvasRendererProps {
  component: ComponentNode;
  selectedId?: string;
  onSelectComponent?: (id: string) => void;
  level?: number;
}

export function CanvasRenderer({
  component,
  selectedId,
  onSelectComponent,
  level = 0,
}: CanvasRendererProps) {
  const definition = getWidgetDefinition(component.type);
  const isSelected = selectedId === component.id;

  if (!definition) {
    return (
      <div className="p-2 bg-destructive/20 border border-destructive rounded text-destructive text-xs">
        Unknown widget: {component.type}
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectComponent?.(component.id);
  };

  // Get styling based on component type
  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      cursor: 'pointer',
      outline: isSelected ? '2px solid #6366f1' : 'none',
      outlineOffset: isSelected ? '2px' : '0px',
      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
      borderRadius: '4px',
      transition: 'all 200ms ease',
    };

    const { props } = component;

    switch (component.type) {
      case 'Container':
        return {
          ...baseStyle,
          backgroundColor: props.backgroundColor || '#ffffff',
          padding: props.padding ? `${props.padding}px` : '0px',
          margin: props.margin ? `${props.margin}px` : '0px',
          borderRadius: props.borderRadius ? `${props.borderRadius}px` : '0px',
          border: props.border ? '1px solid #ccc' : 'none',
          minHeight: '40px',
        };

      case 'Row':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: getFlexJustify(props.mainAxisAlignment),
          alignItems: getFlexAlign(props.crossAxisAlignment),
          gap: '8px',
          minHeight: '40px',
          width: '100%',
        };

      case 'Column':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: getFlexJustify(props.mainAxisAlignment),
          alignItems: getFlexAlign(props.crossAxisAlignment),
          gap: '8px',
          minHeight: '40px',
          width: '100%',
        };

      case 'Center':
        return {
          ...baseStyle,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40px',
          width: '100%',
        };

      case 'Card':
        return {
          ...baseStyle,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: `0 ${props.elevation || 1}px ${(props.elevation || 1) * 2}px rgba(0, 0, 0, 0.1)`,
          padding: '16px',
          minHeight: '40px',
        };

      case 'Stack':
        return {
          ...baseStyle,
          position: 'relative',
          minHeight: '100px',
          width: '100%',
        };

      case 'Positioned':
        return {
          ...baseStyle,
          position: 'absolute',
          top: props.top ? `${props.top}px` : 'auto',
          bottom: props.bottom ? `${props.bottom}px` : 'auto',
          left: props.left ? `${props.left}px` : 'auto',
          right: props.right ? `${props.right}px` : 'auto',
        };

      case 'Padding':
        return {
          ...baseStyle,
          padding: props.padding ? `${props.padding}px` : '8px',
        };

      case 'SizedBox':
        return {
          ...baseStyle,
          width: props.width ? `${props.width}px` : 'auto',
          height: props.height ? `${props.height}px` : 'auto',
        };

      case 'Expanded':
        return {
          ...baseStyle,
          flex: props.flex || 1,
          minHeight: '40px',
        };

      case 'Text':
        return {
          ...baseStyle,
          fontSize: `${props.fontSize || 14}px`,
          color: props.color || '#000000',
          fontWeight: props.fontWeight === 'bold' ? 'bold' : 'normal',
          textAlign: props.alignment || 'left',
          wordBreak: 'break-word',
          padding: '4px 8px',
        };

      case 'Button':
        return {
          ...baseStyle,
          padding: '8px 16px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
        };

      case 'TextField':
        return {
          ...baseStyle,
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: '40px',
          width: '100%',
          fontFamily: 'inherit',
        };

      case 'Icon':
        return {
          ...baseStyle,
          fontSize: `${props.size || 24}px`,
          color: props.color || '#000000',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

      case 'Image':
        return {
          ...baseStyle,
          width: '100%',
          height: 'auto',
          minHeight: '100px',
          objectFit: props.fit || 'cover',
        };

      case 'AppBar':
        return {
          ...baseStyle,
          backgroundColor: props.backgroundColor || '#6200EE',
          color: '#ffffff',
          padding: '12px 16px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: `0 ${props.elevation || 4}px 8px rgba(0, 0, 0, 0.1)`,
          width: '100%',
        };

      case 'Scaffold':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
          backgroundColor: '#f5f5f5',
        };

      case 'ListView':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '100px',
          width: '100%',
          overflowY: 'auto',
          maxHeight: '300px',
        };

      default:
        return baseStyle;
    }
  };

  // Render content based on widget type
  const renderContent = () => {
    const { props, children } = component;

    switch (component.type) {
      case 'Text':
        return props.text || 'Text';

      case 'Button':
        return props.text || 'Button';

      case 'TextField':
        return (
          <input
            type="text"
            placeholder={props.hintText || 'Enter text...'}
            onClick={handleClick}
            readOnly
            style={{ width: '100%', border: 'none', background: 'transparent' }}
          />
        );

      case 'Icon':
        return '⭐'; // Placeholder icon

      case 'Image':
        return (
          <div
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#999',
            }}
          >
            [Image: {props.src || 'No URL'}]
          </div>
        );

      case 'AppBar':
        return props.title || 'App Bar';

      case 'ListView':
        return (
          <div style={{ width: '100%' }}>
            {Array.from({ length: props.itemCount || 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                List Item {i + 1}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Render children
  const renderChildren = () => {
    if (component.children.length === 0) return null;

    return component.children.map((child) => (
      <CanvasRenderer
        key={child.id}
        component={child}
        selectedId={selectedId}
        onSelectComponent={onSelectComponent}
        level={level + 1}
      />
    ));
  };

  return (
    <div
      style={getContainerStyle()}
      onClick={handleClick}
      className="group"
      title={`${definition.name} - Click to select`}
    >
      {renderContent()}
      {renderChildren()}
    </div>
  );
}

function getFlexJustify(alignment?: string): React.CSSProperties['justifyContent'] {
  switch (alignment) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    case 'center':
      return 'center';
    case 'spaceBetween':
      return 'space-between';
    case 'spaceAround':
      return 'space-around';
    case 'spaceEvenly':
      return 'space-evenly';
    default:
      return 'flex-start';
  }
}

function getFlexAlign(alignment?: string): React.CSSProperties['alignItems'] {
  switch (alignment) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    case 'center':
      return 'center';
    case 'stretch':
      return 'stretch';
    case 'baseline':
      return 'baseline';
    default:
      return 'center';
  }
}
