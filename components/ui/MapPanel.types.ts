import { ViewStyle } from 'react-native';

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  /** Pill label, e.g. "Bugis Jn · 4 min" */
  label: string;
  selected?: boolean;
}

export interface MapPanelProps {
  markers: MapMarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  showYouAreHere?: boolean;
  onMarkerPress?: (id: string) => void;
  dark?: boolean;
  /** Colours for the pill pins */
  ink: string;
  bg: string;
  surface: string;
  ring: string;
  style?: ViewStyle;
}
