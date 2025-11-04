// Minimal PDF parser helper (stub) for MVP
// Returns an array of parsed regions (untyped for the stub).

export async function parsePdfBuffer(buffer: Buffer, _maxPages = 3): Promise<unknown[]> {
  // reference _maxPages to avoid unused-variable lint warning in stub
  void _maxPages;
  // TODO: implement real parsing using pdfjs-dist and return strongly-typed ParsedRegion[]
  return [];
}

export default parsePdfBuffer;
