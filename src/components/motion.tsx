import React, { CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type TransitionConfig = {
  delay?: number;
  duration?: number;
};

type MotionProps<T extends ElementType> = React.ComponentPropsWithoutRef<T> & {
  children?: ReactNode;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  variants?: Record<string, unknown>;
  transition?: TransitionConfig;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  whileFocus?: Record<string, unknown>;
  layout?: boolean;
};

function getDelay(transition?: TransitionConfig): string | undefined {
  if (transition?.delay === undefined) {
    return undefined;
  }
  return `${transition.delay}s`;
}

function getAnimationClass(variants?: Record<string, unknown>): string {
  if (variants && (variants as { __motion?: string }).__motion === 'stagger-item') {
    return 'motion-stagger-item';
  }
  return 'animate-fade-in-up';
}

function createMotionComponent<T extends ElementType>(Component: T) {
  const MotionComponent = React.forwardRef<HTMLElement, MotionProps<T>>(
    (
      {
        children,
        className,
        whileHover,
        whileTap,
        whileFocus,
        variants,
        transition,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        layout: _layout,
        style,
        ...props
      },
      ref
    ) => {
      const animationDelay = getDelay(transition);

      return React.createElement(
        Component,
        {
          ref,
          className: cn(
            getAnimationClass(variants as Record<string, unknown>),
            whileHover && 'motion-hover-scale',
            whileTap && 'motion-tap-scale',
            className
          ),
          style: {
            ...(style as CSSProperties),
            animationDelay,
          },
          ...props,
        },
        children
      );
    }
  );

  MotionComponent.displayName = `motion.${String(Component)}`;
  return MotionComponent;
}

export const motion = {
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  form: createMotionComponent('form'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  span: createMotionComponent('span'),
};

interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
}

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}
