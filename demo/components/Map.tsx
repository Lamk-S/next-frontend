import React, { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon,Text, Fill } from 'ol/style';

interface MapProps {
  buildings?: { lat: number; lng: number; name: string }[]; // Lista de edificios
  onLocationSelect?: (coordinates: [number, number]) => void; // Función opcional para seleccionar ubicación
  initialCoordinates?: [number, number]; // Coordenadas iniciales opcionales
}

const MapComponent: React.FC<MapProps> = ({ buildings = [], onLocationSelect, initialCoordinates }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [vectorSource] = useState(new VectorSource()); // Fuente de marcadores

  useEffect(() => {
    // Inicialización del mapa si aún no está configurado
    if (mapElement.current && !mapRef.current) {
      const markerLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) =>
          new Style({
            image: new Icon({
              src: '/marcador-de-posicion.png', // Ruta del icono
              scale: 0.06,
            }),
            text: feature.get('name') // Agrega el texto solo si existe
              ? new Text({
                  text: feature.get('name'),
                  offsetY: -20,
                  font: '12px Arial, sans-serif',
                  fill: new Fill({ color: '#000' }),
                })
              : undefined,
          }),
      });

      const map = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          markerLayer,
        ],
        view: new View({
          center: initialCoordinates
            ? fromLonLat(initialCoordinates)
            : fromLonLat([-79.03914887833339, -8.114324076752652]), // Coordenadas predeterminadas
          zoom: 16,
        }),
      });

      // Agregar evento de clic si `onLocationSelect` está definido
      if (onLocationSelect) {
        map.on('click', (event) => {
          const coordinates = toLonLat(event.coordinate);
          onLocationSelect([coordinates[0], coordinates[1]]);

          // Limpia marcadores previos y agrega uno nuevo
          vectorSource.clear();
          const newMarker = new Feature({
            geometry: new Point(event.coordinate),
          });
          vectorSource.addFeature(newMarker);
        });
      }

      mapRef.current = map;
    }

    // Siempre limpia y actualiza los marcadores de edificios
    vectorSource.clear();
    if (buildings.length > 0) {
      buildings.forEach((building) => {
        const marker = new Feature({
          geometry: new Point(fromLonLat([building.lng, building.lat])),
        });
        marker.set('name', building.name); // Agrega el nombre para mostrar
        vectorSource.addFeature(marker);
      });
    }

    // Si hay coordenadas iniciales, agrega un marcador
    if (initialCoordinates && !buildings.length) {
      const initialMarker = new Feature({
        geometry: new Point(fromLonLat(initialCoordinates)),
      });
      vectorSource.addFeature(initialMarker);
    }
  }, [buildings, initialCoordinates, onLocationSelect, vectorSource]);

  return <div ref={mapElement} style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;