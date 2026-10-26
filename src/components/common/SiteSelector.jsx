import { MapPin, Loader2 } from 'lucide-react'
import { useSite } from '@/context/SiteContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function SiteSelector({ className }) {
  const { sites, selectedSiteId, setSelectedSiteId, isLoading } = useSite()

  if (isLoading && sites.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 h-9 px-3 rounded-lg bg-card border border-border text-xs text-muted-foreground', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Loading sites...</span>
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className={cn('flex items-center gap-1.5 h-9 px-3 rounded-lg bg-card border border-border text-xs text-muted-foreground', className)}>
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span>No sites found</span>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <Select
        value={selectedSiteId || ''}
        onValueChange={(val) => setSelectedSiteId(val)}
      >
        <SelectTrigger
          className="h-9 w-full text-xs font-medium border-border bg-card text-foreground hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-xs transition-colors"
          aria-label="Select active monitoring site"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <SelectValue placeholder="Select site..." />
          </div>
        </SelectTrigger>
        <SelectContent align="start" className="min-w-[240px] bg-popover border-border shadow-md rounded-lg">
          {sites.map((site) => (
            <SelectItem key={site.siteId} value={site.siteId} className="text-xs focus:bg-accent focus:text-accent-foreground">
              <div className="flex flex-col text-left py-0.5">
                <span className="font-medium text-foreground">{site.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {site.city}, {site.country} • {site.timezone}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
