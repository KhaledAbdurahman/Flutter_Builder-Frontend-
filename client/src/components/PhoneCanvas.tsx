import { ComponentNode } from '@/lib/widgets';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Phone Canvas Component
 * 
 * Renders Flutter widgets in a realistic iPhone-style frame
 * Shows how the app will look on an actual mobile device
 */

interface PhoneCanvasProps {
  component: ComponentNode;
  selectedId?: string;
  onSelectComponent: (id: string) => void;
  onAddChild?: (parentId: string, childType: string) => void;
}

export function PhoneCanvas({
  component,
  selectedId,
  onSelectComponent,
}: PhoneCanvasProps) {
  return (
    <div className="flex items-center justify-center min-h-full py-8">
      {/* iPhone Frame */}
      <div className="relative" style={{ width: '375px', height: '812px' }}>
        {/* Phone Bezel */}
        <div className="absolute inset-0 bg-black rounded-3xl shadow-2xl" style={{ borderWidth: '12px' }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10"></div>

          {/* Screen */}
          <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden" style={{ margin: '12px' }}>
            {/* Status Bar */}
            <div className="h-8 bg-white border-b border-gray-200 flex items-center justify-between px-4 text-xs font-semibold">
              <span>9:41</span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-auto h-full bg-white">
              <WidgetRenderer
                component={component}
                selectedId={selectedId}
                onSelectComponent={onSelectComponent}
                depth={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WidgetRendererProps {
  component: ComponentNode;
  selectedId?: string;
  onSelectComponent: (id: string) => void;
  depth: number;
}

function WidgetRenderer({
  component,
  selectedId,
  onSelectComponent,
  depth,
}: WidgetRendererProps) {
  const isSelected = component.id === selectedId;
  const baseClasses = `
    relative cursor-pointer transition-all duration-200
    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-0' : 'hover:ring-1 hover:ring-blue-300'}
  `;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectComponent(component.id);
  };

  const renderContent = (): ReactNode => {
    const props = component.props;

    switch (component.type) {
      case 'Scaffold':
        return (
          <div
            className={`${baseClasses} w-full h-full flex flex-col bg-white`}
            onClick={handleClick}
          >
            {/* AppBar */}
            {props.app_bar && (
              <div className="bg-blue-600 text-white px-4 py-3 shadow-md">
                <h1 className="font-bold text-lg">{props.app_bar.title || 'App'}</h1>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-auto">
              {component.children.length > 0 ? (
                component.children.map((child) => (
                  <WidgetRenderer
                    key={child.id}
                    component={child}
                    selectedId={selectedId}
                    onSelectComponent={onSelectComponent}
                    depth={depth + 1}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Add widgets here</p>
                </div>
              )}
            </div>

            {/* FloatingActionButton */}
            {props.floating_action_button && (
              <div className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl">
                {props.floating_action_button.label || '+'}
              </div>
            )}
          </div>
        );

      case 'Container':
        return (
          <div
            className={`${baseClasses}`}
            style={{
              backgroundColor: props.color || 'transparent',
              padding: `${props.padding || 0}px`,
              margin: `${props.margin || 0}px`,
              borderRadius: `${props.border_radius || 0}px`,
              width: props.width ? `${props.width}px` : 'auto',
              height: props.height ? `${props.height}px` : 'auto',
              border: props.border ? `1px solid ${props.border_color || '#ccc'}` : 'none',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                Empty Container
              </div>
            )}
          </div>
        );

      case 'Row':
        return (
          <div
            className={`${baseClasses} flex flex-row`}
            style={{
              gap: `${props.spacing || 0}px`,
              padding: `${props.padding || 0}px`,
              margin: `${props.margin || 0}px`,
              justifyContent: props.main_axis_alignment || 'flex-start',
              alignItems: props.cross_axis_alignment || 'center',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Empty Row</div>
            )}
          </div>
        );

      case 'Column':
        return (
          <div
            className={`${baseClasses} flex flex-col`}
            style={{
              gap: `${props.spacing || 0}px`,
              padding: `${props.padding || 0}px`,
              margin: `${props.margin || 0}px`,
              justifyContent: props.main_axis_alignment || 'flex-start',
              alignItems: props.cross_axis_alignment || 'stretch',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Empty Column</div>
            )}
          </div>
        );

      case 'Stack':
        return (
          <div
            className={`${baseClasses} relative`}
            style={{
              width: props.width ? `${props.width}px` : '100%',
              height: props.height ? `${props.height}px` : '200px',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <div key={child.id} className="absolute">
                  <WidgetRenderer
                    component={child}
                    selectedId={selectedId}
                    onSelectComponent={onSelectComponent}
                    depth={depth + 1}
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                Empty Stack
              </div>
            )}
          </div>
        );

      case 'Card':
        return (
          <div
            className={`${baseClasses} bg-white rounded-lg shadow-md p-4 m-2`}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Card Content</div>
            )}
          </div>
        );

      case 'ListView':
        return (
          <div
            className={`${baseClasses} border border-gray-200 rounded`}
            style={{
              height: props.height ? `${props.height}px` : '300px',
              overflow: 'auto',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              <div className="divide-y">
                {component.children.map((child) => (
                  <div key={child.id} className="p-2">
                    <WidgetRenderer
                      component={child}
                      selectedId={selectedId}
                      onSelectComponent={onSelectComponent}
                      depth={depth + 1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                Empty List
              </div>
            )}
          </div>
        );

      case 'Center':
        return (
          <div
            className={`${baseClasses} flex items-center justify-center`}
            style={{
              width: props.width ? `${props.width}px` : '100%',
              height: props.height ? `${props.height}px` : '100px',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Center</div>
            )}
          </div>
        );

      case 'Padding':
        return (
          <div
            className={`${baseClasses}`}
            style={{
              padding: `${props.padding || 8}px`,
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Padding</div>
            )}
          </div>
        );

      case 'Expanded':
        return (
          <div
            className={`${baseClasses} flex-1`}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="text-gray-400 text-xs">Expanded</div>
            )}
          </div>
        );

      case 'SizedBox':
        return (
          <div
            className={`${baseClasses}`}
            style={{
              width: props.width ? `${props.width}px` : 'auto',
              height: props.height ? `${props.height}px` : 'auto',
              backgroundColor: isSelected ? '#f0f0f0' : 'transparent',
            }}
            onClick={handleClick}
          >
            {component.children.length > 0 ? (
              component.children.map((child) => (
                <WidgetRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelectComponent={onSelectComponent}
                  depth={depth + 1}
                />
              ))
            ) : null}
          </div>
        );

      case 'Text':
        return (
          <div
            className={`${baseClasses}`}
            style={{
              fontSize: `${props.font_size || 14}px`,
              fontWeight: props.font_weight || 'normal',
              color: props.color || '#000',
              textAlign: props.text_align || 'left',
            }}
            onClick={handleClick}
          >
            {props.text || 'Text'}
          </div>
        );

      case 'Button':
        return (
          <button
            className={`${baseClasses} px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors`}
            onClick={handleClick}
          >
            {props.label || 'Button'}
          </button>
        );

      case 'TextField':
        return (
          <input
            type="text"
            className={`${baseClasses} px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder={props.hint_text || 'Enter text'}
            onClick={handleClick}
            readOnly
          />
        );

      case 'Icon':
        return (
          <div
            className={`${baseClasses} text-2xl`}
            onClick={handleClick}
          >
            {props.icon || '⭐'}
          </div>
        );

      case 'Image':
        return (
          <div
            className={`${baseClasses} bg-gray-200 flex items-center justify-center`}
            style={{
              width: props.width ? `${props.width}px` : '100px',
              height: props.height ? `${props.height}px` : '100px',
            }}
            onClick={handleClick}
          >
            <span className="text-gray-400 text-xs">Image</span>
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} p-2 bg-gray-100 rounded border border-gray-300`}
            onClick={handleClick}
          >
            <p className="text-xs font-semibold">{component.type}</p>
            {component.children.length > 0 && (
              <div className="mt-2 space-y-1">
                {component.children.map((child) => (
                  <WidgetRenderer
                    key={child.id}
                    component={child}
                    selectedId={selectedId}
                    onSelectComponent={onSelectComponent}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return renderContent();
}
