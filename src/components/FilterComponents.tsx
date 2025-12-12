import React, { useRef, useEffect } from 'react';

export const AddRingLight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9.5" stroke="currentColor" />
        <path d="M10 6.5V13.5" stroke="currentColor" strokeLinecap="round" />
        <path d="M6.5 10H13.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
);

export const RemoveLight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9.5" stroke="currentColor" />
        <path d="M6.5 10H13.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
);

export const ChevronDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="#2a2b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface FilterDropdownProps {
    label: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    activeCount?: number;
    isDefault?: boolean;
    disabled?: boolean;
    error?: boolean;
}

export const FilterDropdown = ({ label, children, isOpen, onToggle, activeCount = 0, isDefault = false, disabled = false, error = false }: FilterDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) onToggle();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    return (
        <div className={`filter-dropdown ${isOpen ? 'open' : ''} ${isDefault ? 'is-default' : ''} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`} ref={dropdownRef}>
            <button className="filter-dropdown-trigger" onClick={disabled ? undefined : onToggle} disabled={disabled}>
                <span className="dropdown-label">{label}</span>
                <span className="dropdown-arrow"><ChevronDown /></span>
            </button>
            {isOpen && (
                <div className="filter-dropdown-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export const FilterPill = ({
    label,
    isActive,
    onClick
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <div
        className={`filter-pill ${isActive ? 'active' : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
    >
        <span className="filter-text">{label}</span>
        <div className="filter-icon">
            {isActive ? <RemoveLight /> : <AddRingLight />}
        </div>
    </div>
);
