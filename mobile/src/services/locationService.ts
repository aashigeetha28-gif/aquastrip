import * as Location from 'expo-location';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
  source: 'gps' | 'fallback' | 'simulated';
}

const DEFAULT_VILLAGE_COORDS = {
  lat: 18.8471,
  lng: 73.9118,
  accuracy: 12,
  address: 'Khed, Pune District, Maharashtra (JJM Tap Post #04)',
};

export async function getCurrentLocation(): Promise<LocationData> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        ...DEFAULT_VILLAGE_COORDS,
        source: 'fallback',
      };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: Number(loc.coords.latitude.toFixed(6)),
      lng: Number(loc.coords.longitude.toFixed(6)),
      accuracy: Math.round(loc.coords.accuracy || 15),
      source: 'gps',
    };
  } catch (error) {
    console.warn('Location retrieval fallback used:', error);
    return {
      ...DEFAULT_VILLAGE_COORDS,
      source: 'fallback',
    };
  }
}
