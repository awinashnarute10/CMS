import { cn } from "@/lib/utils"

function Card({ className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-subtle",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn(
        "text-xl md:text-2xl font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ref, ...props }) {
  return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
}

function CardFooter({ className, ref, ...props }) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
