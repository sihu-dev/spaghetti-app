/**
 * Component Templates for Code Generation
 * CVA (class-variance-authority) 기반 컴포넌트 템플릿
 */

import type { ComponentTemplate } from "./types";

export const BUTTON_TEMPLATE: ComponentTemplate = {
  name: "Button",
  description: "Filled, Outlined, Text 버튼 컴포넌트",
  category: "ui",
  dependencies: ["class-variance-authority"],
  template: `"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        filled: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)]",
        outlined: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-50)]",
        text: "text-[var(--color-primary)] hover:bg-[var(--color-primary-50)]",
        ghost: "hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)]",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[var(--radius-sm)]",
        md: "h-10 px-4 text-base rounded-[var(--radius-md)]",
        lg: "h-12 px-6 text-lg rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
`,
};

export const INPUT_TEMPLATE: ComponentTemplate = {
  name: "Input",
  description: "텍스트 입력 필드",
  category: "form",
  template: `"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || \`input-\${Math.random().toString(36).slice(2, 9)}\`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-10 px-3 rounded-[var(--radius-md)] border bg-white transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
            "placeholder:text-[var(--color-neutral-400)]",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-[var(--color-neutral-300)] hover:border-[var(--color-neutral-400)]",
            "disabled:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p
            className={cn(
              "mt-1.5 text-sm",
              error ? "text-red-500" : "text-[var(--color-neutral-500)]"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
`,
};

export const CARD_TEMPLATE: ComponentTemplate = {
  name: "Card",
  description: "카드 컨테이너 컴포넌트",
  category: "ui",
  template: `"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius-lg)] transition-shadow",
  {
    variants: {
      variant: {
        elevated: "bg-white shadow-md hover:shadow-lg",
        outlined: "bg-white border border-[var(--color-neutral-200)]",
        filled: "bg-[var(--color-neutral-100)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "elevated",
      padding: "md",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-[var(--color-neutral-900)]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-neutral-500)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
export type { CardProps };
`,
};

export const BADGE_TEMPLATE: ComponentTemplate = {
  name: "Badge",
  description: "상태 표시 뱃지",
  category: "ui",
  template: `"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white",
        secondary: "bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        outline: "border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)]",
      },
      size: {
        sm: "text-xs px-2 py-0.5 rounded-[var(--radius-sm)]",
        md: "text-sm px-2.5 py-0.5 rounded-[var(--radius-md)]",
        lg: "text-base px-3 py-1 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
`,
};

export const ALL_TEMPLATES: ComponentTemplate[] = [
  BUTTON_TEMPLATE,
  INPUT_TEMPLATE,
  CARD_TEMPLATE,
  BADGE_TEMPLATE,
];

export function getTemplateByName(name: string): ComponentTemplate | undefined {
  return ALL_TEMPLATES.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}
