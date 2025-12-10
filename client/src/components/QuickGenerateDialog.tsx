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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * QuickGenerateDialog Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Modal for quick generation without database storage
 * - Streamlined form with essential fields only
 * - Real-time validation and error handling
 */

interface QuickGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    app_name: string;
    package_name: string;
    json_data: Record<string, any>;
  }) => Promise<void>;
}

export function QuickGenerateDialog({
  open,
  onClose,
  onSubmit,
}: QuickGenerateDialogProps) {
  const [appName, setAppName] = useState('my_app');
  const [packageName, setPackageName] = useState('com.example.myapp');
  const [jsonData, setJsonData] = useState(
    JSON.stringify(
      {
        screens: [
          {
            id: 'home',
            name: 'Home',
            route: '/',
            is_home: true,
            components: [
              {
                type: 'Scaffold',
                children: [
                  {
                    type: 'AppBar',
                    props: {
                      title: 'My App',
                    },
                  },
                  {
                    type: 'Center',
                    children: [
                      {
                        type: 'Text',
                        props: {
                          text: 'Hello World!',
                          fontSize: 24,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      null,
      2
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const parsedJson = JSON.parse(jsonData);
      await onSubmit({
        app_name: appName,
        package_name: packageName,
        json_data: parsedJson,
      });
      onClose();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your JSON data.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Generate Flutter App</DialogTitle>
          <DialogDescription>
            Generate a Flutter app instantly without saving to database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="appName">App Name</Label>
            <Input
              id="appName"
              placeholder="my_app"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              required
            />
          </div>

          {/* Package Name */}
          <div className="space-y-2">
            <Label htmlFor="packageName">Package Name</Label>
            <Input
              id="packageName"
              placeholder="com.example.myapp"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
            />
          </div>

          {/* JSON Configuration */}
          <div className="space-y-2">
            <Label htmlFor="jsonData">JSON Configuration</Label>
            <Textarea
              id="jsonData"
              placeholder="Paste your Flutter JSON configuration here..."
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Define your Flutter app structure using the supported widgets and props
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate & Download
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
