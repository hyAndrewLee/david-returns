import type { LatLngTuple } from 'leaflet';

export type CoverageArea = {
	name: string;
	coordinates: LatLngTuple;
	boundaryPolygons?: LatLngTuple[][];
	boundaryNames?: string[];
};

export type CoverageGroup = {
	borough: string;
	areas: CoverageArea[];
};
