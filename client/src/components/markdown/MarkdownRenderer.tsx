import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Lightweight code block wrapper to allow future copy button etc.
const InlineCode: React.FC<React.PropsWithChildren> = ({ children }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{children}</code>
);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >{content}</ReactMarkdown>
    </div>
  );
};

// Define outside render to avoid recreation
const markdownComponents: Components = {
  code(props) {
    const { className, children } = props as any;
    const inline = (props as any).inline as boolean | undefined;
    const match = /language-(\w+)/.exec(className || '');
    if (inline) return <InlineCode>{children}</InlineCode>;
    return (
      <pre className="relative mb-4 mt-2 overflow-auto rounded-lg bg-background/60 border p-4 text-sm">
        <code className={match ? `language-${match[1]}` : ''} {...props}>{children}</code>
      </pre>
    );
  },
  a({ href, children, ...props }) {
    return <a href={href} target="_blank" rel="noreferrer" className="underline text-primary hover:opacity-80" {...props}>{children}</a>;
  },
  strong({ children }) { return <strong className="font-semibold">{children}</strong>; },
  ul({ children }) { return <ul className="list-disc pl-6 space-y-1">{children}</ul>; },
  ol({ children }) { return <ol className="list-decimal pl-6 space-y-1">{children}</ol>; },
  blockquote({ children }) { return <blockquote className="border-l-4 pl-4 italic text-muted-foreground">{children}</blockquote>; },
  h1({ children }) { return <h1 className="mt-6 mb-3 text-2xl font-bold">{children}</h1>; },
  h2({ children }) { return <h2 className="mt-6 mb-3 text-xl font-semibold">{children}</h2>; },
  h3({ children }) { return <h3 className="mt-6 mb-3 text-lg font-semibold">{children}</h3>; },
  p({ children }) { return <p className="mb-3 leading-relaxed">{children}</p>; },
};

export default MarkdownRenderer;
