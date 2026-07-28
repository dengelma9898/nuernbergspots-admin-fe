import { Button } from '@/components/ui/button';
import { ReactNode, ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonProps = ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div
      className={cn(
        !isDisabled && 'motion-hover-scale motion-tap-scale',
        isLoading && 'motion-loading-pulse'
      )}
    >
      <Button
        {...props}
        disabled={isDisabled}
        className={cn('relative overflow-hidden', isLoading && 'cursor-wait', className)}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 motion-spin" />
            {loadingText && <span>{loadingText}</span>}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 w-full h-full">{children}</span>
        )}
      </Button>
    </div>
  );
}
