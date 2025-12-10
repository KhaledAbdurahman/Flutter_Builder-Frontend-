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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validatePageName, validateRoute } from '@/lib/validation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

/**
 * Page Manager Component
 * 
 * Manages multiple pages/screens in a Flutter project
 * Allows creating, editing, and deleting pages
 */

export interface Page {
  id: string;
  name: string;
  route: string;
  is_home: boolean;
}

interface PageManagerProps {
  pages: Page[];
  currentPageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: (page: Page) => void;
  onDeletePage: (id: string) => void;
  onUpdatePage: (id: string, page: Partial<Page>) => void;
}

export function PageManager({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePage,
}: PageManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageName, setPageName] = useState('');
  const [pageRoute, setPageRoute] = useState('');
  const [isHome, setIsHome] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setPageName('');
    setPageRoute('');
    setIsHome(false);
    setErrors({});
  };

  const handleAddPage = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    // Validate page name
    const nameValidation = validatePageName(pageName);
    if (!nameValidation.isValid) {
      nameValidation.errors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
    }

    // Validate route
    const existingRoutes = pages.map((p) => p.route);
    const routeValidation = validateRoute(pageRoute, existingRoutes);
    if (!routeValidation.isValid) {
      routeValidation.errors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const pageId = `page_${Date.now()}`;
      onAddPage({
        id: pageId,
        name: pageName,
        route: pageRoute,
        is_home: isHome,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPage = async () => {
    if (!editingPageId) return;

    setErrors({});
    const newErrors: Record<string, string> = {};

    // Validate page name
    const nameValidation = validatePageName(pageName);
    if (!nameValidation.isValid) {
      nameValidation.errors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
    }

    // Validate route (excluding current page's route)
    const existingRoutes = pages
      .filter((p) => p.id !== editingPageId)
      .map((p) => p.route);
    const routeValidation = validateRoute(pageRoute, existingRoutes);
    if (!routeValidation.isValid) {
      routeValidation.errors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      onUpdatePage(editingPageId, {
        name: pageName,
        route: pageRoute,
        is_home: isHome,
      });

      resetForm();
      setIsEditDialogOpen(false);
      setEditingPageId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditDialog = (page: Page) => {
    setEditingPageId(page.id);
    setPageName(page.name);
    setPageRoute(page.route);
    setIsHome(page.is_home);
    setErrors({});
    setIsEditDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pages</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your app screens
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pages.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No pages yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  currentPageId === page.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                }`}
                onClick={() => onSelectPage(page.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {page.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {page.route}
                    </p>
                  </div>
                  {page.is_home && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                      Home
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(page);
                    }}
                    className="flex-1 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Delete page "${page.name}"? This cannot be undone.`
                        )
                      ) {
                        onDeletePage(page.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Page Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new screen for your Flutter app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                placeholder="e.g., Home, Profile, Settings"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageRoute">Route</Label>
              <Input
                id="pageRoute"
                placeholder="e.g., /, /profile, /settings"
                value={pageRoute}
                onChange={(e) => setPageRoute(e.target.value)}
              />
              {errors.route && (
                <p className="text-xs text-destructive">{errors.route}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isHome"
                type="checkbox"
                checked={isHome}
                onChange={(e) => setIsHome(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isHome" className="text-sm cursor-pointer">
                Set as home page
              </Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPage} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Update page details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPageName">Page Name</Label>
              <Input
                id="editPageName"
                placeholder="e.g., Home, Profile, Settings"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPageRoute">Route</Label>
              <Input
                id="editPageRoute"
                placeholder="e.g., /, /profile, /settings"
                value={pageRoute}
                onChange={(e) => setPageRoute(e.target.value)}
              />
              {errors.route && (
                <p className="text-xs text-destructive">{errors.route}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="editIsHome"
                type="checkbox"
                checked={isHome}
                onChange={(e) => setIsHome(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="editIsHome" className="text-sm cursor-pointer">
                Set as home page
              </Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                  setEditingPageId(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleEditPage} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
