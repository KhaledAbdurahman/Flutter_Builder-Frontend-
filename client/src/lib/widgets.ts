/**
 * Flutter Widget Definitions and Metadata
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Centralized widget registry with complete metadata
 * - Type-safe widget definitions
 * - Support for all 18 supported Flutter widgets
 */

export interface WidgetProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'enum' | 'object';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: string[]; // For enum types
  placeholder?: string;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  icon: string;
  category: 'layout' | 'content' | 'input';
  description: string;
  canHaveChildren: boolean;
  props: WidgetProp[];
  defaultProps?: Record<string, any>;
}

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children: ComponentNode[];
}

export const FLUTTER_WIDGETS: Record<string, WidgetDefinition> = {
  Scaffold: {
    id: 'Scaffold',
    name: 'Scaffold',
    icon: '📱',
    category: 'layout',
    description: 'Basic screen structure with AppBar and body',
    canHaveChildren: true,
    props: [],
  },
  AppBar: {
    id: 'AppBar',
    name: 'App Bar',
    icon: '📊',
    category: 'layout',
    description: 'Top bar of the application',
    canHaveChildren: false,
    props: [
      {
        name: 'title',
        type: 'string',
        label: 'Title',
        defaultValue: 'My App',
        placeholder: 'Enter app bar title',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        label: 'Background Color',
        defaultValue: '#6200EE',
      },
      {
        name: 'elevation',
        type: 'number',
        label: 'Elevation',
        defaultValue: 4,
      },
    ],
  },
  Container: {
    id: 'Container',
    name: 'Container',
    icon: '📦',
    category: 'layout',
    description: 'Convenience widget combining painting and positioning',
    canHaveChildren: true,
    props: [
      {
        name: 'backgroundColor',
        type: 'color',
        label: 'Background Color',
      },
      {
        name: 'padding',
        type: 'number',
        label: 'Padding',
        defaultValue: 8,
      },
      {
        name: 'margin',
        type: 'number',
        label: 'Margin',
        defaultValue: 0,
      },
      {
        name: 'borderRadius',
        type: 'number',
        label: 'Border Radius',
        defaultValue: 0,
      },
      {
        name: 'border',
        type: 'boolean',
        label: 'Add Border',
        defaultValue: false,
      },
    ],
  },
  Row: {
    id: 'Row',
    name: 'Row',
    icon: '↔️',
    category: 'layout',
    description: 'Arranges children horizontally',
    canHaveChildren: true,
    props: [
      {
        name: 'mainAxisAlignment',
        type: 'enum',
        label: 'Main Axis Alignment',
        defaultValue: 'start',
        options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
      },
      {
        name: 'crossAxisAlignment',
        type: 'enum',
        label: 'Cross Axis Alignment',
        defaultValue: 'center',
        options: ['start', 'end', 'center', 'stretch', 'baseline'],
      },
    ],
  },
  Column: {
    id: 'Column',
    name: 'Column',
    icon: '↕️',
    category: 'layout',
    description: 'Arranges children vertically',
    canHaveChildren: true,
    props: [
      {
        name: 'mainAxisAlignment',
        type: 'enum',
        label: 'Main Axis Alignment',
        defaultValue: 'start',
        options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
      },
      {
        name: 'crossAxisAlignment',
        type: 'enum',
        label: 'Cross Axis Alignment',
        defaultValue: 'center',
        options: ['start', 'end', 'center', 'stretch', 'baseline'],
      },
    ],
  },
  Stack: {
    id: 'Stack',
    name: 'Stack',
    icon: '📚',
    category: 'layout',
    description: 'Arranges children on top of each other',
    canHaveChildren: true,
    props: [],
  },
  Positioned: {
    id: 'Positioned',
    name: 'Positioned',
    icon: '📍',
    category: 'layout',
    description: 'Positions child absolutely within Stack',
    canHaveChildren: true,
    props: [
      {
        name: 'top',
        type: 'number',
        label: 'Top',
      },
      {
        name: 'bottom',
        type: 'number',
        label: 'Bottom',
      },
      {
        name: 'left',
        type: 'number',
        label: 'Left',
      },
      {
        name: 'right',
        type: 'number',
        label: 'Right',
      },
    ],
  },
  Expanded: {
    id: 'Expanded',
    name: 'Expanded',
    icon: '📈',
    category: 'layout',
    description: 'Expands child to fill available space',
    canHaveChildren: true,
    props: [
      {
        name: 'flex',
        type: 'number',
        label: 'Flex',
        defaultValue: 1,
      },
    ],
  },
  SizedBox: {
    id: 'SizedBox',
    name: 'Sized Box',
    icon: '⬜',
    category: 'layout',
    description: 'Creates a box with specified size',
    canHaveChildren: false,
    props: [
      {
        name: 'width',
        type: 'number',
        label: 'Width',
      },
      {
        name: 'height',
        type: 'number',
        label: 'Height',
      },
    ],
  },
  Padding: {
    id: 'Padding',
    name: 'Padding',
    icon: '🔲',
    category: 'layout',
    description: 'Adds uniform padding around child',
    canHaveChildren: true,
    props: [
      {
        name: 'padding',
        type: 'number',
        label: 'Padding',
        defaultValue: 8,
      },
    ],
  },
  Center: {
    id: 'Center',
    name: 'Center',
    icon: '⭕',
    category: 'layout',
    description: 'Centers child within itself',
    canHaveChildren: true,
    props: [],
  },
  Card: {
    id: 'Card',
    name: 'Card',
    icon: '🎴',
    category: 'layout',
    description: 'Material design card with shadow',
    canHaveChildren: true,
    props: [
      {
        name: 'elevation',
        type: 'number',
        label: 'Elevation',
        defaultValue: 1,
      },
    ],
  },
  ListView: {
    id: 'ListView',
    name: 'List View',
    icon: '📋',
    category: 'layout',
    description: 'Scrollable list of items',
    canHaveChildren: false,
    props: [
      {
        name: 'itemCount',
        type: 'number',
        label: 'Item Count',
        defaultValue: 10,
      },
    ],
  },
  Text: {
    id: 'Text',
    name: 'Text',
    icon: '📝',
    category: 'content',
    description: 'Displays a string of text',
    canHaveChildren: false,
    props: [
      {
        name: 'text',
        type: 'string',
        label: 'Text',
        defaultValue: 'Hello World',
        placeholder: 'Enter text',
      },
      {
        name: 'fontSize',
        type: 'number',
        label: 'Font Size',
        defaultValue: 14,
      },
      {
        name: 'color',
        type: 'color',
        label: 'Color',
        defaultValue: '#000000',
      },
      {
        name: 'fontWeight',
        type: 'enum',
        label: 'Font Weight',
        defaultValue: 'normal',
        options: ['normal', 'bold'],
      },
      {
        name: 'alignment',
        type: 'enum',
        label: 'Alignment',
        defaultValue: 'left',
        options: ['left', 'right', 'center', 'justify', 'start', 'end'],
      },
    ],
  },
  Button: {
    id: 'Button',
    name: 'Button',
    icon: '🔘',
    category: 'input',
    description: 'Elevated button widget',
    canHaveChildren: false,
    props: [
      {
        name: 'text',
        type: 'string',
        label: 'Button Text',
        defaultValue: 'Press me',
        placeholder: 'Enter button text',
      },
      {
        name: 'onPress',
        type: 'string',
        label: 'On Press Handler',
        placeholder: 'handlePress',
      },
      {
        name: 'navigateTo',
        type: 'string',
        label: 'Navigate To',
        placeholder: '/route',
      },
    ],
  },
  TextField: {
    id: 'TextField',
    name: 'Text Field',
    icon: '⌨️',
    category: 'input',
    description: 'Text input field',
    canHaveChildren: false,
    props: [
      {
        name: 'hintText',
        type: 'string',
        label: 'Hint Text',
        placeholder: 'Enter hint text',
      },
    ],
  },
  Icon: {
    id: 'Icon',
    name: 'Icon',
    icon: '⭐',
    category: 'content',
    description: 'Material Design icon',
    canHaveChildren: false,
    props: [
      {
        name: 'icon',
        type: 'string',
        label: 'Icon Name',
        placeholder: 'star, person, arrow_forward_ios',
      },
      {
        name: 'size',
        type: 'number',
        label: 'Size',
        defaultValue: 24,
      },
      {
        name: 'color',
        type: 'color',
        label: 'Color',
        defaultValue: '#000000',
      },
    ],
  },
  Image: {
    id: 'Image',
    name: 'Image',
    icon: '🖼️',
    category: 'content',
    description: 'Displays an image',
    canHaveChildren: false,
    props: [
      {
        name: 'src',
        type: 'string',
        label: 'Image URL or Path',
        placeholder: 'https://example.com/image.png',
      },
      {
        name: 'fit',
        type: 'enum',
        label: 'Fit',
        defaultValue: 'cover',
        options: ['cover', 'contain', 'fill', 'fitWidth', 'fitHeight', 'scaleDown'],
      },
    ],
  },
};

export const WIDGET_TYPES = Object.keys(FLUTTER_WIDGETS);

export const WIDGET_CATEGORIES = {
  layout: 'Layout',
  content: 'Content',
  input: 'Input',
};

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return FLUTTER_WIDGETS[type];
}

export function canContainWidget(parentType: string, childType: string): boolean {
  const parent = getWidgetDefinition(parentType);
  if (!parent) return false;
  
  // Some widgets can only contain specific children
  if (parentType === 'ListView') return true; // ListView can contain items
  if (parentType === 'AppBar') return false; // AppBar is self-contained
  
  return parent.canHaveChildren;
}

export function createDefaultComponent(type: string): ComponentNode {
  const definition = getWidgetDefinition(type);
  if (!definition) throw new Error(`Unknown widget type: ${type}`);

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    props: definition.defaultProps || {},
    children: [],
  };
}
