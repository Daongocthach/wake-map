export interface WakeMapCoordinate {
  latitude: number;
  longitude: number;
}

export interface WakeMapPlace {
  id: string;
  title: string;
  subtitle: string;
  coordinate: WakeMapCoordinate;
  isSaved?: boolean;
}
