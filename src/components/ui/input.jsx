import { cn } from "@/lib/utils"

function Input({ className, type, ref, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-xs text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 shadow-subtle",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Input }
