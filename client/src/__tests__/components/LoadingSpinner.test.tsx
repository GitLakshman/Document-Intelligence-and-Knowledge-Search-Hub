/**
 * LoadingSpinner Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../components/ui';

describe('LoadingSpinner Component', () => {
    it('renders default spinner', () => {
        render(<LoadingSpinner />);
        // Check for spinner animation element
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with loading text', () => {
        render(<LoadingSpinner text="Loading data..." />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('renders spinner element for all sizes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();

        rerender(<LoadingSpinner size="md" />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();

        rerender(<LoadingSpinner size="lg" />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders centered by default', () => {
        const { container } = render(<LoadingSpinner />);
        // Default is centered with justify-center
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('justify-center');
    });

    it('shows branded version with sparkles icon', () => {
        const { container } = render(<LoadingSpinner branded />);
        // Branded version has a sparkles icon with animate-pulse
        const pulseIcon = container.querySelector('.animate-pulse');
        expect(pulseIcon).toBeInTheDocument();
    });

    it('renders without centering when centered is false', () => {
        const { container } = render(<LoadingSpinner centered={false} />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).not.toContain('justify-center');
    });
});
