import { memo, useCallback, useEffect, useState, type ComponentProps } from 'react'
import { ComposableMap, Geographies, Geography, Graticule, ZoomableGroup } from 'react-simple-maps'
import atlasUrl from 'world-atlas/countries-50m.json?url'
import { COUNTRY_BY_ID } from '../data/countries'
import { VISIT_GROUPS, type VisitGroup } from '../data/visits'

type GeographiesProps = ComponentProps<typeof Geographies>
type Atlas = Exclude<GeographiesProps['geography'], string>
const AtlasGeographies = memo(Geographies)

interface Props {
  visited: ReadonlySet<string>
  group: VisitGroup
  visitsLoading: boolean
}

export default function WorldMap({ visited, group, visitsLoading }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const [atlas, setAtlas] = useState<Atlas | 'error' | null>(null)
  const label = VISIT_GROUPS.find((entry) => entry.id === group)?.label

  useEffect(() => {
    const request = new AbortController()

    async function loadAtlas() {
      try {
        const response = await fetch(atlasUrl, { signal: request.signal })
        if (!response.ok) throw new Error(response.statusText)
        const data: Atlas = await response.json()
        if (!request.signal.aborted) setAtlas(data)
      } catch {
        if (!request.signal.aborted) setAtlas('error')
      }
    }

    void loadAtlas()
    return () => request.abort()
  }, [])

  const renderCountries = useCallback<GeographiesProps['children']>(({ geographies }) =>
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
    }), [visited])

  const mapError = atlas === 'error'
  const loading = atlas === null || visitsLoading

  return (
    <div className="map" data-group={group} role="region" aria-label={group === 'together' ? 'Countries visited together' : `Countries visited by ${label}`}>
      <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 170 }}>
        <ZoomableGroup minZoom={1} maxZoom={12}>
          {atlas && !mapError
            ? <AtlasGeographies geography={atlas}>{renderCountries}</AtlasGeographies>
            : <Graticule className="map-graticule" step={[20, 20]} aria-hidden="true" />}
        </ZoomableGroup>
      </ComposableMap>
      <div className="map-status" role="status">
        {mapError && <span>Couldn’t load the map.</span>}
        {loading && !mapError && <span>Loading travel map…</span>}
      </div>
      <div className="tooltip" aria-live="polite">
        {hover ?? ' '}
      </div>
    </div>
  )
}
