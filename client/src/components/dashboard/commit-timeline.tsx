import { useState } from "react";
import type { Commit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, GitCommit } from "lucide-react";

interface CommitTimelineProps {
  commits: Commit[];
  onSummarize: (commitId: string) => void;
  summarizing: boolean;
}

export function CommitTimeline({ commits, onSummarize, summarizing }: CommitTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (commits.length === 0) {
    return (
      <Card className="mb-6" data-testid="commit-timeline-empty">
        <CardHeader>
          <CardTitle>Commit Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No commits processed yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" data-testid="commit-timeline">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Commit Timeline</CardTitle>
        <Badge variant="secondary">{commits.length}</Badge>
      </CardHeader>
      <CardContent>
        <ul className="relative border-l border-border pl-4 space-y-4">
          {commits.map(commit => {
            const isOpen = expanded === commit.id;
            return (
              <li key={commit.id} className="relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-primary" />
                <div className="flex items-start justify-between">
                  <div className="pr-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : commit.id)}>
                    <div className="flex items-center space-x-2">
                      <GitCommit className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate max-w-[320px]" title={commit.message}>{commit.message.split('\n')[0]}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(commit.date).toLocaleString()} · {commit.additions}+ / {commit.deletions}- · {commit.author}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {commit.aiSummary ? (
                      <Badge variant="outline" className="text-xs">AI</Badge>
                    ) : (
                      <Button size="sm" variant="outline" disabled={summarizing} onClick={() => onSummarize(commit.id)}>
                        {summarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Summarize'}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : commit.id)}>
                      {isOpen ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className={cn("mt-3 ml-2 p-3 rounded-md border bg-muted/40", commit.aiSummary ? "" : "italic text-muted-foreground")}> 
                    {commit.aiSummary || 'No AI summary yet. Click Summarize to generate.'}
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
