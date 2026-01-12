/**
 * EmptyState Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../components/ui';
import { FileText, Upload, Search } from 'lucide-react';

describe('EmptyState Component', () => {
    it('renders with title and icon', () => {
        render(<EmptyState icon={FileText} title="No documents" />);
        expect(screen.getByText('No documents')).toBeInTheDocument();
    });

    it('renders with description', () => {
        render(
            <EmptyState 
                icon={Upload}
                title="No documents" 
                description="Upload your first document to get started"
            />
        );
        expect(screen.getByText('Upload your first document to get started')).toBeInTheDocument();
    });

    it('renders the icon', () => {
        render(
            <EmptyState 
                icon={Search}
                title="No results" 
            />
        );
        // Icon should render as SVG
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders action element when provided', () => {
        render(
            <EmptyState 
                icon={FileText}
                title="No items" 
                action={<button>Add Item</button>}
            />
        );
        
        expect(screen.getByText('Add Item')).toBeInTheDocument();
    });
});
