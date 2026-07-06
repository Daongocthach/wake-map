import type { Region } from 'react-native-maps';
import type { WakeMapPlace } from '../types';

export const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const SAVED_PLACES: WakeMapPlace[] = [
  {
    id: 'home',
    title: 'Nhà - Quận 1',
    subtitle: 'Điểm lưu sẵn',
    coordinate: {
      latitude: 10.7781,
      longitude: 106.6996,
    },
    isSaved: true,
  },
  {
    id: 'work',
    title: 'Công ty - Quận 7',
    subtitle: 'Điểm lưu sẵn',
    coordinate: {
      latitude: 10.7378,
      longitude: 106.7218,
    },
    isSaved: true,
  },
  {
    id: 'cafe',
    title: 'Quán cà phê - Thảo Điền',
    subtitle: 'Điểm lưu sẵn',
    coordinate: {
      latitude: 10.8032,
      longitude: 106.7358,
    },
    isSaved: true,
  },
];
