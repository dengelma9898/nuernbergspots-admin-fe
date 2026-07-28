import { Card } from '@/components/ui/card';
import { ReactNode, ComponentProps, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type CardProps = ComponentProps<typeof Card>;

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  index?: number;
  delay?: number;
}

export function AnimatedCard({
  children,
  index = 0,
  delay = 0,
  className,
  style,
  ...props
}: AnimatedCardProps) {
  const animationDelay = `${delay + index * 0.02}s`;

  return (
    <div
      className="motion-stagger-item motion-hover-scale"
      style={{ animationDelay, ...(style as CSSProperties) }}
    >
      <Card className={cn(className)} {...props}>
        {children}
      </Card>
    </div>
  );
}
