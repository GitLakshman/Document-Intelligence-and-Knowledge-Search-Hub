/**
 * ErrorState Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '../../components/ui';

describe('ErrorState Component', () => {
    it('renders with default title and provided message', () => {
        render(<ErrorState message="Connection failed" />);
        // Default title is "Something went wrong"
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
        render(<ErrorState title="Network Error" message="Failed to connect" />);
        expect(screen.getByText('Network Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to connect')).toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
        const handleRetry = vi.fn();
        render(
            <ErrorState 
                message="Error occurred" 
                onRetry={handleRetry}
            />
        );
        
        const retryButton = screen.getByText('Try Again');
        expect(retryButton).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
        const handleRetry = vi.fn();
        render(
            <ErrorState 
                message="Error occurred" 
                onRetry={handleRetry}
            />
        );
        
        fireEvent.click(screen.getByText('Try Again'));
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when onRetry is not provided', () => {
        render(<ErrorState message="Error occurred" />);
        expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('renders custom retry text', () => {
        const handleRetry = vi.fn();
        render(
            <ErrorState 
                message="Error occurred" 
                onRetry={handleRetry}
                retryText="Reload Page"
            />
        );
        
        expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
});
