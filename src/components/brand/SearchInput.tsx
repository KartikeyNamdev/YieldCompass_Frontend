'use client'

import React from 'react'
import { Search, X } from 'lucide-react'

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  wrapperClassName?: string
  id?: string
  size?: 'sm' | 'md'
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  className = '',
  wrapperClassName = '',
  id = 'brand-search-input',
  size = 'md',
  ...props
}: SearchInputProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs pl-9 pr-8',
    md: 'h-9.5 text-sm pl-10 pr-9',
  }[size]

  const iconSizes = {
    sm: 14,
    md: 16,
  }[size]

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  return (
    <div className={`relative flex items-center w-full ${wrapperClassName}`}>
      {/* Absolutely positioned icon on the left with generous spacing */}
      <Search
        size={iconSizes}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none transition-colors"
        aria-hidden="true"
      />

      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={props['aria-label'] || placeholder}
        className={`
          w-full rounded-xl
          bg-[var(--surface-strong)]
          border border-[var(--border)]
          text-[var(--text)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
          transition-all duration-200
          ${sizeClasses}
          ${className}
        `}
        {...props}
      />

      {/* Clear button if text entered */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
