import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Eye,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  required?: boolean;
}

/**
 * Wiederverwendbarer Markdown Editor mit Preview-Funktion
 * 
 * Features:
 * - Split View: Edit und Preview Tabs
 * - Toolbar mit häufigen Formatierungen
 * - Glassmorphism Design
 * - Mobile-first responsive
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Markdown-Text eingeben...',
  className,
  minHeight = 'min-h-[200px]',
  required = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toolbar-Funktionen für Textformatierung
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(newText);

    // Cursor-Position nach dem eingefügten Text setzen
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // Wenn Text ausgewählt ist, verwende ihn als Link-Text, sonst Platzhalter
    const linkText = selectedText || 'Link-Text';
    const newText = `${beforeText}[${linkText}](https://example.com)${afterText}`;
    onChange(newText);

    // Cursor-Position auf die URL setzen
    setTimeout(() => {
      textarea.focus();
      const urlStart = start + linkText.length + 3; // 3 = "[".length + "](".length
      const urlEnd = urlStart + 'https://example.com'.length;
      textarea.setSelectionRange(urlStart, urlEnd);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Fett',
      onClick: () => insertText('**', '**'),
    },
    {
      icon: Italic,
      label: 'Kursiv',
      onClick: () => insertText('*', '*'),
    },
    {
      icon: Link,
      label: 'Link einfügen',
      onClick: insertLink,
    },
    {
      icon: Heading1,
      label: 'Überschrift 1',
      onClick: () => insertText('# ', ''),
    },
    {
      icon: Heading2,
      label: 'Überschrift 2',
      onClick: () => insertText('## ', ''),
    },
    {
      icon: List,
      label: 'Aufzählung',
      onClick: () => insertText('- ', ''),
    },
    {
      icon: ListOrdered,
      label: 'Nummerierte Liste',
      onClick: () => insertText('1. ', ''),
    },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <TabsList className="backdrop-blur-2xl bg-white/10 dark:bg-white/10 border-white/20 dark:border-white/20">
            <TabsTrigger 
              value="edit" 
              className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/20 data-[state=active]:text-foreground text-foreground/70"
            >
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/20 data-[state=active]:text-foreground text-foreground/70"
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </TabsTrigger>
          </TabsList>

          {/* Toolbar - nur im Edit-Modus anzeigen */}
          {activeTab === 'edit' && (
            <div className="flex flex-wrap gap-1 p-2 backdrop-blur-2xl bg-white/5 dark:bg-white/5 rounded-lg border border-white/10 dark:border-white/10">
              {toolbarButtons.map((button) => {
                const Icon = button.icon;
                return (
                  <Button
                    key={button.label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={button.onClick}
                    className="h-8 w-8 p-0 text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/10 rounded-md"
                    title={button.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <TabsContent value="edit" className="mt-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'bg-background border-secondary placeholder:text-muted-foreground text-foreground rounded-lg font-mono text-sm',
                minHeight
              )}
              required={required}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tipp: Verwende die Toolbar-Buttons für schnelle Formatierung oder Markdown-Syntax direkt.
          </p>
        </TabsContent>

        <TabsContent value="preview" className="mt-2">
          <div
            className={cn(
              'backdrop-blur-2xl bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 rounded-lg p-4 text-foreground overflow-auto',
              minHeight,
              // Prose-Klassen für Markdown-Rendering - angepasst für Dark/Light Mode
              'prose dark:prose-invert prose-sm max-w-none',
              // Überschreibungen für Glassmorphism-Design mit Dark/Light Mode Support
              '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-foreground',
              '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-foreground',
              '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-foreground',
              '[&_p]:text-foreground/90 [&_p]:my-2',
              '[&_strong]:text-foreground [&_strong]:font-bold',
              '[&_em]:text-foreground/90 [&_em]:italic',
              '[&_a]:text-blue-600 dark:text-blue-300 [&_a]:no-underline hover:[&_a]:underline [&_a]:font-medium',
              '[&_ul]:text-foreground/90 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
              '[&_ol]:text-foreground/90 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
              '[&_li]:text-foreground/90 [&_li]:my-1',
              '[&_code]:text-pink-600 dark:text-pink-300 [&_code]:bg-white/10 dark:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
              '[&_pre]:bg-white/10 dark:bg-white/10 [&_pre]:text-foreground/90 [&_pre]:border [&_pre]:border-white/20 dark:border-white/20 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto',
              '[&_blockquote]:border-l-4 [&_blockquote]:border-white/30 dark:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:text-foreground/80 [&_blockquote]:italic',
              '[&_hr]:border-white/20 dark:border-white/20',
              '[&_img]:rounded-lg [&_img]:my-4'
            )}
          >
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Keine Vorschau verfügbar. Beginne mit der Eingabe im Bearbeiten-Modus.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

