
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import { collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const getNearbyPosts = async (center: [number, number], radiusInM: number = 10000) => {
  const bounds = geohashQueryBounds(center, radiusInM);
  const promises = [];
  
  for (const b of bounds) {
    const q = query(
      collection(db, 'posts'),
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const lat = doc.get('location.latitude');
      const lng = doc.get('location.longitude');

      if (lat && lng) {
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push({ id: doc.id, ...doc.data() });
        }
      }
    }
  }

  return matchingDocs.sort((a: any, b: any) => b.createdAt - a.createdAt);
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
