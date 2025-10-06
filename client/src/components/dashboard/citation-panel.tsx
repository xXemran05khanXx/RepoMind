import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCode, ChevronDown, ChevronRight } from 'lucide-react';

interface CitationPanelProps {
  sources: string[];
  confidence?: number;
  repositoryId: string;
}

interface RepoFileMeta {
  path: string;
  size?: number;
  language?: string | null;
  preview?: string;
}

// Fetch repository file list once and map sources -> meta content (limited preview)
export function CitationPanel({ sources, confidence, repositoryId }: CitationPanelProps) {
  const [files, setFiles] = useState<Record<string, RepoFileMeta>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!repositoryId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/repositories/${repositoryId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, RepoFileMeta> = {};
        (data.files || []).forEach((f: any) => {
          map[f.path] = {
            path: f.path,
            size: f.size,
            language: f.language,
            preview: (f.content || '').slice(0, 400)
          };
        });
        setFiles(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [repositoryId]);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4" data-testid="citation-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" /> Sources ({sources.length})
          </CardTitle>
          {confidence !== undefined && (
            <Badge variant="secondary" className="text-[10px] tracking-wide">{(confidence * 100).toFixed(1)}% conf</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="space-y-1">
          {sources.map(src => {
            const meta = files[src];
            const isOpen = expanded === src;
            return (
              <li key={src} className="border rounded-md bg-muted/40">
                <button
                  type="button"
                  className="w-full flex items-start justify-between text-left p-2 hover:bg-muted/70 transition"
                  onClick={() => setExpanded(isOpen ? null : src)}
                >
                  <div className="flex flex-col flex-1 pr-2">
                    <span className="font-mono text-xs truncate" title={src}>{src}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {meta?.language || 'text'}{meta?.size ? ` • ${meta.size}b` : ''}
                    </span>
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <pre className="mt-1 max-h-64 overflow-auto text-[11px] leading-snug bg-background/60 p-3 rounded border"><code>{meta?.preview || 'No preview available'}</code></pre>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
