export type BBox = { x: number; y: number; width: number; height: number };

export type ParsedRegion = {
  id: string;
  page: number;
  bbox: BBox;
  text: string;
  category: 'contact' | 'experience' | 'education' | 'skill' | 'other';
  confidence?: number;
};
