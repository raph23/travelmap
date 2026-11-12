import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import atlasUrl from 'world-atlas/countries-50m.json?url'
import { COUNTRY_BY_ID } from '../data/countries'

interface Props {
  visited: Set<string>
  canEdit: boolean
  onToggle: (id: string) => void
}

export default function WorldMap({ visited, canEdit, onToggle }: Props) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="map">
      <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 170 }}>
        <ZoomableGroup minZoom={1} maxZoom={12}>
          <Geographies geography={atlasUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = String(geo.id ?? '')
                const country = COUNTRY_BY_ID.get(id)
                const isVisited = visited.has(id)
                const name = country?.name ?? (geo.properties?.name as string | undefined)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={`country${isVisited ? ' visited' : ''}${canEdit && country ? ' editable' : ''}`}
                    onMouseEnter={() => setHover(name ?? null)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => country && onToggle(id)}
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
