# Customer Response Platform: React Components Implementation
## Core UI Components for Claude Code Implementation

### 🎯 **OVERVIEW**
Essential React components for Customer Response Decision Intelligence platform. Mobile-first design with Tailwind CSS.

---

## 🎨 **UI COMPONENTS**

### Button Component
```typescript
// src/components/ui/Button.tsx
import { ButtonProps } from '@/types';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
```

### Input Component
```typescript
// src/components/ui/Input.tsx
import { InputProps } from '@/types';

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  type = 'text',
  className = ''
}: InputProps) {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

### Card Component
```typescript
// src/components/ui/Card.tsx
import { CardProps } from '@/types';

export default function Card({
  title,
  children,
  className = '',
  onClick
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200';
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';

  return (
    <div 
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}
```

### Progress Component
```typescript
// src/components/ui/Progress.tsx
import { ProgressProps } from '@/types';

export default function Progress({
  current,
  total,
  phases,
  className = ''
}: ProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Phase {current} of {total}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {phases.map((phase, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              index < current
                ? 'bg-green-100 text-green-800'
                : index === current - 1
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {phase}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🏠 **LAYOUT COMPONENTS**

### Header Component
```typescript
// src/components/layout/Header.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, team, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">CHOSEBY</h1>
            <span className="ml-2 text-sm text-gray-500">Customer Response</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            <a href="/decisions" className="text-gray-700 hover:text-gray-900">Decisions</a>
            <a href="/analytics" className="text-gray-700 hover:text-gray-900">Analytics</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-700">
              <div>{user?.name}</div>
              <div className="text-xs text-gray-500">{team?.company_name}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Mobile Navigation
```typescript
// src/components/layout/MobileNav.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
          <div className="px-4 py-2 space-y-2">
            <a href="/dashboard" className="block py-2 text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/decisions" className="block py-2 text-gray-700 hover:text-gray-900">
              Decisions
            </a>
            <a href="/analytics" className="block py-2 text-gray-700 hover:text-gray-900">
              Analytics
            </a>
            <div className="border-t pt-2">
              <div className="text-sm text-gray-700">{user?.name}</div>
              <button 
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 **DECISION COMPONENTS**

### Decision Card Component
```typescript
// src/components/decisions/DecisionCard.tsx
import { DecisionCardProps } from '@/types';
import Card from '@/components/ui/Card';

export default function DecisionCard({ 
  decision, 
  priority = 'normal',
  onClick 
}: DecisionCardProps) {
  const urgencyColors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800'
  };

  const priorityBorder = priority === 'urgent' ? 'border-l-4 border-l-red-500' : '';

  return (
    <Card 
      className={`${priorityBorder} hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {decision.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[decision.urgency_level]}`}>
            Level {decision.urgency_level}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">{decision.customer_name}</span>
          <span className="capitalize">{decision.customer_tier}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            decision.status === 'created' ? 'bg-gray-100 text-gray-800' :
            decision.status === 'team_input' ? 'bg-blue-100 text-blue-800' :
            decision.status === 'evaluating' ? 'bg-yellow-100 text-yellow-800' :
            decision.status === 'resolved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {decision.status.replace('_', ' ')}
          </span>
          
          <span className="text-xs text-gray-500">
            {new Date(decision.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="text-sm text-gray-600 line-clamp-2">
          {decision.description}
        </div>
      </div>
    </Card>
  );
}
```

### Quick Actions Component
```typescript
// src/components/decisions/QuickActions.tsx
import Button from '@/components/ui/Button';

interface QuickActionsProps {
  onCreateDecision: (type: 'emergency' | 'express' | 'full') => void;
}

export default function QuickActions({ onCreateDecision }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Button
        variant="danger"
        size="lg"
        onClick={() => onCreateDecision('emergency')}
        className="p-6 h-auto flex flex-col items-center space-y-2"
      >
        <span className="text-2xl">🚨</span>
        <span className="font-semibold">Emergency Response</span>
        <span className="text-sm opacity-80">Critical customer issue</span>
      </Button>

      <Button
        variant="primary"
        size="lg"
        onClick={() => onCreateDecision('express')}
        className="p-6 h-auto flex flex-col items-center space-y-2"
      >
        <span className="text-2xl">⚡</span>
        <span className="font-semibold">Express Response</span>
        <span className="text-sm opacity-80">Same-day resolution</span>
      </Button>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => onCreateDecision('full')}
        className="p-6 h-auto flex flex-col items-center space-y-2"
      >
        <span className="text-2xl">📋</span>
        <span className="font-semibold">Full Process</span>
        <span className="text-sm opacity-80">Complete workflow</span>
      </Button>
    </div>
  );
}
```

**Status**: Core React components complete
**Next**: Hooks and API client implementation