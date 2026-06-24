import { ViewStyle } from 'react-native';

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  color: string; // teardrop fill
  label?: string;
}

export interface MapPanelProps {
  markers: MapMarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  rounded?: 'top' | 'all';
  showYouAreHere?: boolean;
  style?: ViewStyle;
}
