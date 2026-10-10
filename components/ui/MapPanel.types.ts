import { ViewStyle } from 'react-native';

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  /** Pill label, e.g. "Bugis Jn · 4 min" or "★ 4.5 · Zam Zam" */
  label: string;
  selected?: boolean;
  /** 'masjid' renders a brand-colour pill with the mosque glyph (no stem). */
  kind?: 'place' | 'masjid';
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPanelProps {
  markers: MapMarkerData[];
  /** Initial centre; changing it pans the map. */
  center?: LatLng;
  /** Where the user-location dot sits (defaults to `center` at mount). */
  userLocation?: LatLng;
  zoom?: number;
  height?: number;
  showYouAreHere?: boolean;
  onMarkerPress?: (id: string) => void;
  /** Dashed walking route (ink, 2.5px, dash 2.5 2). */
  route?: LatLng[];
  /** false = static preview (no gestures). */
  interactive?: boolean;
  dark?: boolean;
  /** Colours for the pins */
  ink: string;
  bg: string;
  surface: string;
  ring: string;
  brand?: string;
  brandInk?: string;
  style?: ViewStyle;
}
