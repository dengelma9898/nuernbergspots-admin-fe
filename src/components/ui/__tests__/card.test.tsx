import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly with default props', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-slot', 'card')
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'gap-6', 'rounded-xl', 'border', 'py-6', 'shadow-sm')
    })

    it('applies custom className', () => {
      render(<Card className="custom-card">Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards all div props', () => {
      render(
        <Card data-testid="test-card" role="article">
          Card content
        </Card>
      )
      
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('role', 'article')
    })
  })

  describe('CardHeader', () => {
    it('renders correctly with default props', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('data-slot', 'card-header')
      expect(header).toHaveClass('@container/card-header', 'grid', 'auto-rows-min')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders correctly with default props', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute('data-slot', 'card-title')
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders correctly with default props', () => {
      render(<CardDescription>Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'card-description')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-description">Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toHaveClass('custom-description')
    })
  })

  describe('CardAction', () => {
    it('renders correctly with default props', () => {
      render(<CardAction>Action content</CardAction>)
      
      const action = screen.getByText('Action content')
      expect(action).toBeInTheDocument()
      expect(action).toHaveAttribute('data-slot', 'card-action')
      expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1', 'self-start', 'justify-self-end')
    })

    it('applies custom className', () => {
      render(<CardAction className="custom-action">Action content</CardAction>)
      
      const action = screen.getByText('Action content')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('renders correctly with default props', () => {
      render(<CardContent>Card content</CardContent>)
      
      const content = screen.getByText('Card content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-slot', 'card-content')
      expect(content).toHaveClass('px-6')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Card content</CardContent>)
      
      const content = screen.getByText('Card content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('renders correctly with default props', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>Test card description</CardDescription>
            <CardAction>Action Button</CardAction>
          </CardHeader>
          <CardContent>Main card content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      )

      const card = screen.getByTestId('complete-card')
      expect(card).toBeInTheDocument()

      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
      expect(screen.getByText('Test card description')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
      expect(screen.getByText('Main card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer actions')).toBeInTheDocument()
    })
  })
}) 