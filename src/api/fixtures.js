/**
 * Development-Only Fixtures Layer
 *
 * This fixture layer can be activated in offline development environments
 * via VITE_USE_FIXTURES=true without altering the production API services.
 */

export const FIXTURE_SITES = [
  {
    siteId: 'site-001',
    name: 'CMS Innovation Center',
    city: 'Sunnyvale',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    zones: [
      { zoneId: 'zone-lobby', name: 'Main Reception & Lobby', securityLevel: 'low' },
      { zoneId: 'zone-hall-a', name: 'Exhibition Hall A', securityLevel: 'medium' },
      { zoneId: 'zone-server', name: 'Secure Datacenter Wing', securityLevel: 'high' },
      { zoneId: 'zone-cafeteria', name: 'Central Food Court', securityLevel: 'low' },
    ],
  },
  {
    siteId: 'site-002',
    name: 'Downtown Commercial Hub',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    zones: [
      { zoneId: 'zone-concourse', name: 'Retail Concourse', securityLevel: 'low' },
      { zoneId: 'zone-transit', name: 'Metro Connection Hub', securityLevel: 'medium' },
      { zoneId: 'zone-vip-lounge', name: 'Executive Suite', securityLevel: 'high' },
    ],
  },
]

export function generateFixtureOccupancy(fromUtc, toUtc) {
  const buckets = []
  const step = 1000 * 60 * 60 // 1 hour steps
  const start = fromUtc || Date.now() - 1000 * 60 * 60 * 24
  const end = toUtc || Date.now()

  let current = start
  let seed = 42

  while (current <= end) {
    const d = new Date(current)
    const hour = d.getUTCHours()
    const base = hour >= 9 && hour <= 18 ? 120 + ((seed * 17) % 80) : 15 + ((seed * 7) % 25)
    seed = (seed * 31 + 13) % 100

    buckets.push({
      timestamp: current,
      hourUtc: current,
      timeLabel: `${String(hour).padStart(2, '0')}:00`,
      occupancy: base,
      entries: Math.round(base * 0.4),
      exits: Math.round(base * 0.35),
    })
    current += step
  }
  return buckets
}

export function generateFixtureDemographics(fromUtc, toUtc) {
  const buckets = []
  const step = 1000 * 60 * 60
  const start = fromUtc || Date.now() - 1000 * 60 * 60 * 24
  const end = toUtc || Date.now()

  let current = start
  let seed = 88

  while (current <= end) {
    const d = new Date(current)
    const hour = d.getUTCHours()
    const male = hour >= 9 && hour <= 18 ? 65 + ((seed * 11) % 40) : 8 + ((seed * 3) % 12)
    const female = hour >= 9 && hour <= 18 ? 55 + ((seed * 13) % 35) : 7 + ((seed * 5) % 10)
    seed = (seed * 19 + 7) % 100

    buckets.push({
      timestamp: current,
      hourUtc: current,
      timeLabel: `${String(hour).padStart(2, '0')}:00`,
      male,
      female,
    })
    current += step
  }
  return buckets
}

export function generateFixtureEntryExitRecords({ siteId, toUtc, pageSize = 50, pageNumber = 1 }) {
  const totalRecords = 185
  const totalPages = Math.ceil(totalRecords / pageSize)
  const names = [
    { name: 'Dr. Michael Vance', gender: 'male' },
    { name: 'Sarah Jenkins', gender: 'female' },
    { name: 'David Kumar', gender: 'male' },
    { name: 'Elena Rostova', gender: 'female' },
    { name: 'Marcus Chen', gender: 'male' },
    { name: 'Amara Okafor', gender: 'female' },
    { name: 'Liam O\'Connor', gender: 'male' },
    { name: 'Yuki Tanaka', gender: 'female' },
    { name: 'Alexander Wright', gender: 'male' },
    { name: 'Chloe Dubois', gender: 'female' },
  ]
  const zones = [
    { zoneId: 'zone-lobby', zoneName: 'Main Reception & Lobby', severity: 'low' },
    { zoneId: 'zone-hall-a', zoneName: 'Exhibition Hall A', severity: 'medium' },
    { zoneId: 'zone-server', zoneName: 'Secure Datacenter Wing', severity: 'high' },
    { zoneId: 'zone-cafeteria', zoneName: 'Central Food Court', severity: 'low' },
  ]

  const startIndex = (pageNumber - 1) * pageSize
  const records = []
  const baseTime = toUtc || Date.now()

  for (let i = 0; i < pageSize && startIndex + i < totalRecords; i++) {
    const recordIndex = startIndex + i
    const person = names[recordIndex % names.length]
    const zone = zones[recordIndex % zones.length]
    const entryOffset = (recordIndex * 7 + 5) * 60 * 1000
    const entryUtc = baseTime - entryOffset
    const hasExited = recordIndex % 5 !== 0
    const dwellMinutes = hasExited ? 15 + ((recordIndex * 13) % 75) : null
    const exitUtc = hasExited ? entryUtc + dwellMinutes * 60 * 1000 : null

    const entryD = new Date(entryUtc)
    const exitD = exitUtc ? new Date(exitUtc) : null

    records.push({
      personId: `PER-${String(1000 + recordIndex)}`,
      personName: person.name,
      gender: person.gender,
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      severity: zone.severity,
      entryUtc,
      entryLocal: entryD.toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }),
      exitUtc,
      exitLocal: exitD ? exitD.toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }) : null,
      dwellMinutes,
    })
  }

  return {
    siteId,
    totalRecords,
    totalPages,
    pageNumber,
    pageSize,
    records,
  }
}
