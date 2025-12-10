/**
 * Validation Utilities
 * 
 * Comprehensive validation for forms, components, and Flutter app structure
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Project validation
export function validateProjectForm(data: {
  name?: string;
  description?: string;
  json_data?: any;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Project name is required',
    });
  } else if (data.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'Project name must be at least 3 characters',
    });
  } else if (data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Project name must be less than 100 characters',
    });
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 500 characters',
    });
  }

  // Validate JSON data
  if (!data.json_data) {
    errors.push({
      field: 'json_data',
      message: 'JSON configuration is required',
    });
  } else {
    const jsonErrors = validateJsonData(data.json_data);
    errors.push(...jsonErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// JSON data validation
export function validateJsonData(jsonData: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  if (!jsonData.app_name) {
    errors.push({
      field: 'app_name',
      message: 'app_name is required',
    });
  } else if (!/^[a-z_][a-z0-9_]*$/.test(jsonData.app_name)) {
    errors.push({
      field: 'app_name',
      message: 'app_name must be lowercase with underscores only',
    });
  }

  if (!jsonData.package_name) {
    errors.push({
      field: 'package_name',
      message: 'package_name is required',
    });
  } else if (!/^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/.test(jsonData.package_name)) {
    errors.push({
      field: 'package_name',
      message: 'package_name must be a valid Java package name (e.g., com.example.app)',
    });
  }

  // Validate screens
  if (!jsonData.screens || !Array.isArray(jsonData.screens)) {
    errors.push({
      field: 'screens',
      message: 'screens must be an array',
    });
  } else if (jsonData.screens.length === 0) {
    errors.push({
      field: 'screens',
      message: 'At least one screen is required',
    });
  } else {
    jsonData.screens.forEach((screen: any, index: number) => {
      const screenErrors = validateScreen(screen, index);
      errors.push(...screenErrors);
    });
  }

  return errors;
}

// Screen validation
export function validateScreen(screen: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `screens[${index}]`;

  if (!screen.id) {
    errors.push({
      field: `${prefix}.id`,
      message: 'Screen id is required',
    });
  } else if (!/^[a-z_][a-z0-9_]*$/.test(screen.id)) {
    errors.push({
      field: `${prefix}.id`,
      message: 'Screen id must be lowercase with underscores only',
    });
  }

  if (!screen.name) {
    errors.push({
      field: `${prefix}.name`,
      message: 'Screen name is required',
    });
  }

  if (!screen.route) {
    errors.push({
      field: `${prefix}.route`,
      message: 'Screen route is required',
    });
  } else if (!screen.route.startsWith('/')) {
    errors.push({
      field: `${prefix}.route`,
      message: 'Screen route must start with /',
    });
  }

  if (typeof screen.is_home !== 'boolean') {
    errors.push({
      field: `${prefix}.is_home`,
      message: 'is_home must be a boolean',
    });
  }

  if (!screen.components || !Array.isArray(screen.components)) {
    errors.push({
      field: `${prefix}.components`,
      message: 'components must be an array',
    });
  } else if (screen.components.length === 0) {
    errors.push({
      field: `${prefix}.components`,
      message: 'At least one component is required',
    });
  }

  return errors;
}

// Page name validation
export function validatePageName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Page name is required',
    });
  } else if (name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Page name must be at least 2 characters',
    });
  } else if (name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Page name must be less than 50 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Route validation
export function validateRoute(route: string, existingRoutes: string[] = []): ValidationResult {
  const errors: ValidationError[] = [];

  if (!route || route.trim() === '') {
    errors.push({
      field: 'route',
      message: 'Route is required',
    });
  } else if (!route.startsWith('/')) {
    errors.push({
      field: 'route',
      message: 'Route must start with /',
    });
  } else if (!/^\/[a-z0-9_\-\/]*$/.test(route)) {
    errors.push({
      field: 'route',
      message: 'Route can only contain lowercase letters, numbers, underscores, hyphens, and slashes',
    });
  } else if (existingRoutes.includes(route)) {
    errors.push({
      field: 'route',
      message: 'This route already exists',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Component nesting validation
export function validateComponentNesting(parentType: string, childType: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Define invalid parent-child combinations
  const invalidCombinations: Record<string, string[]> = {
    'AppBar': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'ListView': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'Center', 'Padding', 'Expanded'],
    'TextField': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'Button': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'Text': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'Icon': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'Image': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
    'SizedBox': ['Scaffold', 'Row', 'Column', 'Container', 'Stack', 'Card', 'ListView', 'Center', 'Padding', 'Expanded'],
  };

  if (invalidCombinations[childType]?.includes(parentType)) {
    errors.push({
      field: 'nesting',
      message: `${childType} cannot be a child of ${parentType}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Quick generate validation
export function validateQuickGenerate(data: {
  app_name?: string;
  package_name?: string;
  json_data?: any;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.app_name || data.app_name.trim() === '') {
    errors.push({
      field: 'app_name',
      message: 'App name is required',
    });
  } else if (!/^[a-z_][a-z0-9_]*$/.test(data.app_name)) {
    errors.push({
      field: 'app_name',
      message: 'App name must be lowercase with underscores only',
    });
  }

  if (!data.package_name || data.package_name.trim() === '') {
    errors.push({
      field: 'package_name',
      message: 'Package name is required',
    });
  } else if (!/^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/.test(data.package_name)) {
    errors.push({
      field: 'package_name',
      message: 'Package name must be a valid Java package name',
    });
  }

  if (!data.json_data) {
    errors.push({
      field: 'json_data',
      message: 'JSON configuration is required',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
