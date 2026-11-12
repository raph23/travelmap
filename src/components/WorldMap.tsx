import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import atlasUrl from 'world-atlas/countries-50m.json?url'
import { COUNTRY_BY_ID } from '../data/countries'

export default function WorldMap({ visited }: { visited: Set<string> }) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="map">
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
