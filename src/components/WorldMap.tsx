import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import atlasUrl from 'world-atlas/countries-50m.json?url'
import { COUNTRY_BY_ID } from '../data/countries'
import { VISIT_GROUPS, type VisitGroup } from '../data/visits'

export default function WorldMap({ visited, group }: { visited: ReadonlySet<string>; group: VisitGroup }) {
  const [hover, setHover] = useState<string | null>(null)
  const label = VISIT_GROUPS.find((entry) => entry.id === group)?.label

  return (
    <div className="map" data-group={group} role="region" aria-label={group === 'together' ? 'Countries visited together' : `Countries visited by ${label}`}>
      <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 170 }}>
        <ZoomableGroup minZoom={1} maxZoom={12}>
          <Geographies geography={atlasUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = String(geo.id ?? '')
                const name = COUNTRY_BY_ID.get(id)?.name ?? (geo.properties?.name as string | undefined)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={`country${visited.has(id) ? ' visited' : ''}`}
                    onMouseEnter={() => setHover(name ?? null)}
                    onMouseLeave={() => setHover(null)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="tooltip" aria-live="polite">
        {hover ?? ' '}
      </div>
    </div>
  )
}
