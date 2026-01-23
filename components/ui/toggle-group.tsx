import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const ToggleGroupContext = React.createContext<{
  size?: VariantProps<typeof toggleVariants>["size"]
  variant?: VariantProps<typeof toggleVariants>["variant"]
  value?: string | string[]
  onValueChange?: (value: any) => void
  type: "single" | "multiple"
}>({
  size: "default",
  variant: "default",
  type: "single",
})

const toggleGroupVariants = cva(
  "flex items-center justify-center gap-1",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-sm",
      },
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toggleGroupVariants> & {
      type: "single" | "multiple"
      value?: string | string[]
      onValueChange?: (value: any) => void
    }
>(({ className, variant, size, children, type, value, onValueChange, ...props }, ref) => (
  <ToggleGroupContext.Provider value={{ variant, size, value, onValueChange, type }}>
    <div
      ref={ref}
      role="group"
      className={cn(toggleGroupVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </div>
  </ToggleGroupContext.Provider>
))

ToggleGroup.displayName = "ToggleGroup"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-accent-foreground data-[state=on]:shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof toggleVariants> & {
      value: string
    }
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  
  const isSelected = context.type === "single" 
    ? context.value === value 
    : (Array.isArray(context.value) && context.value.includes(value))

  const handleClick = () => {
    if (context.onValueChange) {
      if (context.type === "single") {
        // Prevent unselecting if it's single mode (act like a radio group)
        if (!isSelected) {
            context.onValueChange(value)
        }
      } else {
        // Multiple logic would go here
        const current = Array.isArray(context.value) ? context.value : []
        const next = isSelected 
            ? current.filter(v => v !== value) 
            : [...current, value]
        context.onValueChange(next)
      }
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      onClick={handleClick}
      data-state={isSelected ? "on" : "off"}
      {...props}
    >
      {children}
    </button>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
