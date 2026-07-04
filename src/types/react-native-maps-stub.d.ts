declare module 'react-native-maps' {
  import { Component } from 'react';
  import type { ViewProps } from 'react-native';

  export interface MapEvent {
    nativeEvent: {
      coordinate: {
        latitude: number;
        longitude: number;
      };
    };
  }

  export interface MapViewProps extends ViewProps {
    ref?: unknown;
    provider?: 'google' | 'default' | null;
    initialRegion?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    region?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    } | null;
    onPress?: (event: MapEvent) => void;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsCompass?: boolean;
    zoomEnabled?: boolean;
    rotateEnabled?: boolean;
    scrollEnabled?: boolean;
    pitchEnabled?: boolean;
  }

  export interface MarkerProps extends ViewProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
    draggable?: boolean;
    onDragEnd?: (event: MapEvent) => void;
    pinColor?: string;
  }

  export interface CircleProps extends ViewProps {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
  }

  export class MapView extends Component<MapViewProps> {
    fitToCoordinates(
      coordinates: Array<{ latitude: number; longitude: number }>,
      options?: {
        edgePadding?: {
          top?: number;
          right?: number;
          bottom?: number;
          left?: number;
        };
        animated?: boolean;
      }
    ): void;
  }

  export class Marker extends Component<MarkerProps> {}
  export class Circle extends Component<CircleProps> {}

  export const PROVIDER_GOOGLE: 'google';
  export const PROVIDER_DEFAULT: 'default';

  export default MapView;
}
