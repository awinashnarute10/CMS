export function updateOccupancyTotal(zoneOccupancies, zoneId, count) {
  if (!zoneId) {
    zoneOccupancies.clear()
    return count
  }

  zoneOccupancies.set(String(zoneId), count)
  return Array.from(zoneOccupancies.values()).reduce((total, value) => total + value, 0)
}

export function getAlertDedupeKey(payload) {
  return String(
    payload.id ||
      payload.eventId ||
      `${payload.siteId || payload.site || 'site'}-${payload.zoneId || payload.zone || 'zone'}-${payload.eventType || payload.action || payload.type || 'alert'}-${payload.message || payload.description || 'event'}`
  )
}
