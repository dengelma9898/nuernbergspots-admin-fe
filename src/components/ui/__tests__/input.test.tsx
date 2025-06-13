import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { Input } from '../input'

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
    // type="text" is the default and may not be explicitly set in DOM
    expect(input.tagName).toBe('INPUT')
  })

  it('applies custom type attribute', () => {
    render(<Input type="email" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders password input correctly', () => {
    render(<Input type="password" />)
    
    // Password inputs don't have textbox role, use generic input query
    const input = screen.getByDisplayValue('')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles user input correctly', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  it('calls onChange handler when value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalledTimes(4) // One for each character
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input-class')
  })

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('applies default styling classes', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('h-9')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-1')
  })

  it('forwards all HTML input props', () => {
    render(
      <Input 
        data-testid="test-input"
        aria-label="Test input"
        name="testInput"
        value="test value"
        readOnly
      />
    )
    
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('name', 'testInput')
    expect(input).toHaveValue('test value')
    expect(input).toHaveAttribute('readonly')
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('handles different input types correctly', () => {
    const { rerender } = render(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()

    rerender(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="tel" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
  })
}) 