import React, { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '../markdown/MarkdownRenderer';

interface TypingStreamProps {
  repositoryId: string;
  question: string;
  autoStart?: boolean;
  onDone?: (meta: { sources?: string[]; confidence?: number }) => void;
  className?: string;
}

interface StreamEventMeta {
  sources?: string[];
  confidence?: number;
}

export const TypingStream: React.FC<TypingStreamProps> = ({ repositoryId, question, autoStart = true, onDone, className }) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<StreamEventMeta | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!autoStart) return;
    start();
    // cleanup on unmount
    return () => { esRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryId, question]);

  function start() {
    setText('');
    setMeta(null);
    setError(null);
    setIsStreaming(true);
    const url = `/api/repositories/${repositoryId}/query/stream?q=${encodeURIComponent(question)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('token', (e) => {
      try {
        const data = JSON.parse(e.data) as { chunk: string };
        setText(prev => prev + data.chunk);
      } catch {}
    });

    es.addEventListener('done', (e) => {
      try {
        const data = JSON.parse(e.data) as { sources?: string[]; confidence?: number };
        setMeta({ sources: data.sources, confidence: data.confidence });
        onDone?.(data);
      } catch {}
      setIsStreaming(false);
      es.close();
    });

    es.addEventListener('error', (e) => {
      setError('Stream error');
      setIsStreaming(false);
      es.close();
    });
  }

  return (
    <div className={className}>
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
      <div className="rounded border bg-background/50 p-4 min-h-[160px]">
        <MarkdownRenderer content={text || '*Waiting for response...*'} />
        {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-baseline" />}
      </div>
      {meta && (
        <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-4">
          {meta.confidence !== undefined && <span>Confidence: {(meta.confidence * 100).toFixed(1)}%</span>}
          {meta.sources && meta.sources.length > 0 && (
            <span>Sources: {meta.sources.slice(0,5).join(', ')}{meta.sources.length>5?'…':''}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TypingStream;
