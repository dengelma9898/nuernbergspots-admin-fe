import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TrendingUp, TrendingDown, BarChart } from 'lucide-react'

import { AnalyticsCard } from '../AnalyticsCard'

describe('AnalyticsCard', () => {
  const defaultProps = {
    icon: BarChart,
    title: 'Test Analytics',
    value: 1234,
  }

  it('renders correctly with basic props', () => {
    render(<AnalyticsCard {...defaultProps} />)
    
    expect(screen.getByText('Test Analytics')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
    
    // Check if icon container is rendered
    const iconContainer = document.querySelector('.bg-primary\\/10')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with string value', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        value="€1,234.56" 
      />
    )
    
    expect(screen.getByText('€1,234.56')).toBeInTheDocument()
  })

  it('displays positive trend correctly', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        trend={15.5}
      />
    )
    
    expect(screen.getByText('15.5%')).toBeInTheDocument()
    
    // Check for TrendingUp icon
    const trendContainer = screen.getByText('15.5%').parentElement
    expect(trendContainer).toHaveClass('text-green-500')
    
    // Check for TrendingUp icon in DOM
    const trendingUpIcon = document.querySelector('svg[data-lucide="trending-up"]') ||
                          trendContainer?.querySelector('svg')
    expect(trendingUpIcon).toBeInTheDocument()
  })

  it('displays negative trend correctly', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        trend={-8.3}
      />
    )
    
    expect(screen.getByText('8.3%')).toBeInTheDocument()
    
    // Check for red color on negative trend
    const trendContainer = screen.getByText('8.3%').parentElement
    expect(trendContainer).toHaveClass('text-red-500')
    
    // Check for TrendingDown icon in DOM
    const trendingDownIcon = document.querySelector('svg[data-lucide="trending-down"]') ||
                           trendContainer?.querySelector('svg')
    expect(trendingDownIcon).toBeInTheDocument()
  })

  it('handles zero trend', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        trend={0}
      />
    )
    
    expect(screen.getByText('0.0%')).toBeInTheDocument()
    
    // Zero should be treated as positive (green)
    const trendContainer = screen.getByText('0.0%').parentElement
    expect(trendContainer).toHaveClass('text-green-500')
  })

  it('does not display trend when undefined', () => {
    render(<AnalyticsCard {...defaultProps} />)
    
    // Should not have any trend indicators
    expect(screen.queryByText('%')).not.toBeInTheDocument()
    expect(document.querySelector('svg[data-lucide="trending-up"]')).not.toBeInTheDocument()
    expect(document.querySelector('svg[data-lucide="trending-down"]')).not.toBeInTheDocument()
  })

  it('displays description when provided', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        description="This is a test description" 
      />
    )
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('displays trend description when provided', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        trendDescription="Compared to last month" 
      />
    )
    
    expect(screen.getByText('Compared to last month')).toBeInTheDocument()
  })

  it('displays both descriptions when provided', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        description="Main description"
        trendDescription="Trend description" 
      />
    )
    
    expect(screen.getByText('Main description')).toBeInTheDocument()
    expect(screen.getByText('Trend description')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<AnalyticsCard {...defaultProps} />)
    
    // Check card structure
    const title = screen.getByText('Test Analytics')
    expect(title).toHaveClass('text-sm', 'font-medium')
    
    const value = screen.getByText('1234')
    expect(value).toHaveClass('text-2xl', 'font-bold')
    
    // Check icon container
    const iconContainer = document.querySelector('.bg-primary\\/10')
    expect(iconContainer).toHaveClass('p-2', 'rounded-lg')
    
    const icon = iconContainer?.querySelector('svg')
    expect(icon).toHaveClass('h-5', 'w-5', 'text-primary')
  })

  it('renders with custom icon', () => {
    const CustomIcon = ({ className }: { className?: string }) => (
      <div className={className} data-testid="custom-analytics-icon">Custom Analytics</div>
    )
    
    render(
      <AnalyticsCard 
        {...defaultProps} 
        icon={CustomIcon} 
      />
    )
    
    expect(screen.getByTestId('custom-analytics-icon')).toBeInTheDocument()
    expect(screen.getByTestId('custom-analytics-icon')).toHaveClass('h-5', 'w-5', 'text-primary')
  })

  it('handles large values correctly', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        value={9999999} 
      />
    )
    
    expect(screen.getByText('9999999')).toBeInTheDocument()
  })

  it('handles decimal trends correctly', () => {
    render(
      <AnalyticsCard 
        {...defaultProps} 
        trend={12.34567} 
      />
    )
    
    // Should round to 1 decimal place
    expect(screen.getByText('12.3%')).toBeInTheDocument()
  })
}) 