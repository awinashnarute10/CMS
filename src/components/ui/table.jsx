import { cn } from "@/lib/utils"

function Table({ className, ref, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ref, ...props }) {
  return <thead ref={ref} className={cn("[&_tr]:border-b bg-[#F6F7F8]", className)} {...props} />
}

function TableBody({ className, ref, ...props }) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ref, ...props }) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ref, ...props }) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ref, ...props }) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-11 px-4 text-left align-middle font-bold text-foreground text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ref, ...props }) {
  return (
    <td
      ref={ref}
      className={cn("py-3.5 px-4 align-middle text-xs text-foreground [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ref, ...props }) {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
