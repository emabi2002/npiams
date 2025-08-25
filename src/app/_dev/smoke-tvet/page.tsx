// src/app/_dev/smoke-tvet/page.tsx
export const dynamic = 'force-dynamic' // don't cache this page

// If you use the @ alias to "src", use the next line:
import { TVETAcademicCalendarService as S } from '@/lib/services/tvet-academic-calendar'
// If you don't use the alias, comment the line above and use this instead:
// import { TVETAcademicCalendarService as S } from '../../lib/services/tvet-academic-calendar'

export default async function SmokeTVET() {
  const [years, config, ctx] = await Promise.all([
    S.getAllTVETAcademicYears(),
    S.getSystemConfiguration(),
    S.getCurrentTVETContext(),
  ])

  return (
    <main style={{ padding: 20 }}>
      <h1>TVET Smoke Test</h1>

      <h2>Config</h2>
      <pre>{JSON.stringify(config, null, 2)}</pre>

      <h2>Academic Years</h2>
      <pre>{JSON.stringify(years, null, 2)}</pre>

      <h2>Current Context</h2>
      <pre>{JSON.stringify(ctx, null, 2)}</pre>
    </main>
  )
}
