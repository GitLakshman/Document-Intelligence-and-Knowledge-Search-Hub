/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui';
import { Send } from 'lucide-react';

describe('Button Component', () => {
    it('renders with children text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies primary variant styles by default', () => {
        render(<Button>Primary</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-[#10a37f]');
    });

    it('applies secondary variant styles', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-[#2f2f2f]');
    });

    it('applies danger variant styles', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('red');
    });

    it('shows loading spinner when loading', () => {
        render(<Button loading>Loading</Button>);
        // Should have spinner animation
        const button = screen.getByRole('button');
        expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
        render(<Button loading>Loading</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Click</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with icon', () => {
        render(<Button icon={Send}>Send</Button>);
        // Icon should be rendered as SVG
        const button = screen.getByRole('button');
        expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('applies different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button').className).toContain('px-3');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button').className).toContain('px-5');
    });

    it('renders as full width when fullWidth is true', () => {
        render(<Button fullWidth>Full Width</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('w-full');
    });
});
