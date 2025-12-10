import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * ProjectLogs Component
 * 
 * Design Philosophy: Modern Developer Workspace
 * - Monospace font for technical logs
 * - Dark background for reduced eye strain
 * - Auto-scroll to latest log entries
 * - Copy-to-clipboard functionality
 */

interface ProjectLogsProps {
  open: boolean;
  projectId: number | null;
  onClose: () => void;
  onFetchLogs: (id: number) => Promise<string>;
}

export function ProjectLogs({
  open,
  projectId,
  onClose,
  onFetchLogs,
}: ProjectLogsProps) {
  const [logs, setLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && projectId) {
      fetchLogs();
    }
  }, [open, projectId]);

  const fetchLogs = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const logsContent = await onFetchLogs(projectId);
      setLogs(logsContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(logs);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generation Logs</DialogTitle>
          <DialogDescription>
            View detailed logs from your Flutter app generation
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Logs Display */}
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded p-4">
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                {logs || 'No logs available'}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!logs}
              >
                Copy Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
