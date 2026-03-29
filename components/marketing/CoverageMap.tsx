'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import type { CoverageGroup } from '@/lib/coverage/coverageBoundaries';

type CoverageMapProps = {
	groups: CoverageGroup[];
};

type NeighborhoodFeature = {
	properties: {
		NTAName: string;
	};
	geometry: {
		type: 'Polygon' | 'MultiPolygon';
		coordinates: number[][][] | number[][][][];
	};
};

type NeighborhoodFeatureCollection = {w
	features: NeighborhoodFeature[];
};

const NYC_CENTER: LatLngTuple = [40.7306, -73.9352];
const NYC_BOUNDS: [LatLngTuple, LatLngTuple] = [
	[40.4774, -74.2591],
	[40.9176, -73.7004],
];

const FlyToSelection = ({ coordinates }: { coordinates: LatLngTuple }) => {
	const map = useMap();

	useEffect(() => {
		map.flyTo(coordinates, Math.max(map.getZoom(), 11), { duration: 0.5 });
	}, [coordinates, map]);

	return null;
};

export const CoverageMap = ({ groups }: CoverageMapProps) => {
	const allAreas = useMemo(() => groups.flatMap((group) => group.areas), [groups]);
	const [selectedAreaName, setSelectedAreaName] = useState(allAreas[0]?.name ?? null);
	const [featuresByArea, setFeaturesByArea] = useState<Record<string, LatLngTuple[][]>>({});

	const selectedArea = useMemo(
		() => allAreas.find((area) => area.name === selectedAreaName) ?? null,
		[allAreas, selectedAreaName],
	);
	const selectedCoordinates = selectedArea?.coordinates ?? NYC_CENTER;
	const selectedStyle = useMemo(
		() => ({
			color: '#c46844',
			weight: 2.4,
			fillColor: '#c46844',
			fillOpacity: 0.2,
		}),
		[],
	);
	const defaultStyle = useMemo(
		() => ({
			color: '#64748b',
			weight: 1.6,
			fillColor: '#94a3b8',
			fillOpacity: 0.08,
		}),
		[],
	);

	useEffect(() => {
		let isCancelled = false;

		const loadNeighborhoodPolygons = async () => {
			const response = await fetch('/data/nyc-neighborhoods.geojson');
			if (!response.ok) {
				return;
			}

			const geojson = (await response.json()) as NeighborhoodFeatureCollection;
			const nextFeaturesByArea: Record<string, LatLngTuple[][]> = {};

			for (const area of allAreas) {
				const manualPolygons = area.boundaryPolygons ?? [];
				const boundaryNames = area.boundaryNames ?? [];

				if (!boundaryNames.length) {
					nextFeaturesByArea[area.name] = manualPolygons;
					continue;
				}

				const boundarySet = new Set(boundaryNames);
				const matchedFeatures = geojson.features.filter((feature) => boundarySet.has(feature.properties.NTAName));
				const parsedPolygons: LatLngTuple[][] = [];

				for (const feature of matchedFeatures) {
					if (feature.geometry.type === 'Polygon') {
						const ringCoordinates = feature.geometry.coordinates[0] as number[][];
						parsedPolygons.push(ringCoordinates.map(([lng, lat]) => [lat, lng] as LatLngTuple));
						continue;
					}

					const multiPolygonCoordinates = feature.geometry.coordinates as number[][][][];
					for (const polygon of multiPolygonCoordinates) {
						const ringCoordinates = polygon[0];
						parsedPolygons.push(ringCoordinates.map(([lng, lat]) => [lat, lng] as LatLngTuple));
					}
				}

				nextFeaturesByArea[area.name] = parsedPolygons.length ? parsedPolygons : manualPolygons;
			}

			if (!isCancelled) {
				setFeaturesByArea(nextFeaturesByArea);
			}
		};

		void loadNeighborhoodPolygons();
		return () => {
			isCancelled = true;
		};
	}, [allAreas]);

	return (
		<div className='mx-auto max-w-4xl'>
			<div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
				<div className='relative'>
					<MapContainer
						center={NYC_CENTER}
						zoom={10.2}
						scrollWheelZoom={false}
						className='h-[420px] w-full'
						maxBounds={NYC_BOUNDS}
						maxBoundsViscosity={1}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
							url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
						/>
						{allAreas.map((area) => {
							const isSelected = selectedAreaName === area.name;
							const pathOptions = isSelected ? selectedStyle : defaultStyle;
							const polygons = featuresByArea[area.name] ?? area.boundaryPolygons ?? [];

							return polygons.map((polygon, index) => (
								<Polygon
									key={`${area.name}-${index}`}
									positions={polygon}
									pathOptions={pathOptions}
									eventHandlers={{
										click: () => {
											setSelectedAreaName(area.name);
										},
									}}
								/>
							));
						})}
						<FlyToSelection coordinates={selectedCoordinates} />
					</MapContainer>
					<div className='pointer-events-none absolute left-4 top-4 rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xs'>
						NYC metro coverage overview
					</div>
				</div>
			</div>

			<div className='mt-16 grid gap-8 sm:grid-cols-3'>
				{groups.map((group) => (
					<div key={group.borough}>
						<h3 className='text-sm font-semibold uppercase tracking-widest text-accent-warm'>{group.borough}</h3>
						<ul className='mt-4 space-y-2.5'>
							{group.areas.map((area) => {
								const isSelected = selectedAreaName === area.name;

								return (
									<li key={area.name}>
										<button
											type='button'
											onClick={() => {
												setSelectedAreaName(area.name);
											}}
											className={`flex w-full items-center text-left text-foreground transition-colors hover:text-accent-warm ${isSelected ? 'text-accent-warm' : ''}`}
										>
											<span>{area.name}</span>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};
