import React from 'react';
import { Send, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsComposerBarProps {
  input: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onOpenImageModal: () => void;
  onOpenPollModal: () => void;
}

export function NewsComposerBar({
  input,
  sending,
  onInputChange,
  onSend,
  onOpenImageModal,
  onOpenPollModal,
}: NewsComposerBarProps) {
  return (
    <motion.form
      className={cn(cardPreset, 'fixed bottom-0 left-0 w-full z-30 border-t p-4')}
      style={{ maxWidth: '100vw' }}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ ...defaultTransition, delay: 0.2 }}
      onSubmit={e => {
        e.preventDefault();
        onSend();
      }}
    >
      <div className="flex flex-col gap-3">
        <Input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          placeholder="Neue Nachricht schreiben..."
          disabled={sending}
          className={cn(inputPreset, 'w-full')}
          autoFocus
        />
        <div className="flex gap-2 w-full">
          <LoadingButton
            type="submit"
            disabled={sending || !input.trim()}
            isLoading={sending}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenImageModal}
            title="Bild-News hinzufügen"
            className={cn(buttonPreset, 'flex-1')}
          >
            <ImageIcon className="w-4 h-4" />
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenPollModal}
            title="Umfrage erstellen"
            className={cn(buttonPreset, 'flex-1')}
          >
            <BarChart2 className="w-4 h-4" />
          </LoadingButton>
        </div>
      </div>
    </motion.form>
  );
}
