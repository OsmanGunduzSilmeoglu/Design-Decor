
export interface CalculationResult {
  gap: number;
  positions: number[];
  totalHeight: number;
  shelfCount: number;
  thickness: number;
}

export enum AppModules {
  CUTTING_LIST = 'CUTTING_LIST',
  SHELF_CALC = 'SHELF_CALC',
  CUTTING = 'CUTTING',
  SETTINGS = 'SETTINGS'
}

export interface CuttingPart {
  name: string;
  width: number;
  height: number;
  count: number;
  description?: string;
}

export interface SavedCabinet {
  id: number;
  type: 'BASE' | 'WALL';
  dims: { h: string; w: string; d: string };
  shelves: string;
  quantity: number;
  parts: CuttingPart[];
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  cabinets: SavedCabinet[];
}

export interface DesignerObject {
  id: string;
  name: string;
  type: 'BASE' | 'WALL';
  w: number;
  h: number;
  d: number;
  x: number;
  y: number;
  z: number;
  material: 'oak' | 'walnut' | 'white' | 'anthracite';
  isOpen: boolean;
}

export interface RoomDims {
  width: number;
  height: number;
  depth: number;
}
