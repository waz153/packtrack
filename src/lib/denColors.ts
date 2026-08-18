export const DEN_COLORS: Record<string, string> = {
  Tiger: '#E8601C',
  Wolf: '#4C6E91',
  Bear: '#3E7C59',
  Webelos: '#B23B3B',
  AOL: '#3A3A3A',
}

export function denColor(name: string): string {
  return DEN_COLORS[name] ?? '#555555'
}
