import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";

const Map = dynamic(() => import("react-leaflet").then((mod) => mod.Map), {
  ssr: false,
});

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});

const MapView = ({ onMapClick }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const L = require("leaflet");

    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [-36.8225012, -73.0132711],
        zoom: 10,
        minZoom: 2,
        maxZoom: 17,
      });

      const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
      });

      mapRef.current.addLayer(Esri_WorldStreetMap);

      const LeafletGeosearch = require("leaflet-geosearch");

      const searchControl = new LeafletGeosearch.GeoSearchControl({
        provider: new LeafletGeosearch.OpenStreetMapProvider(),
        style: 'bar',
        showMarker: false,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        searchLabel: 'Ingrese dirección',
      });

      mapRef.current.addControl(searchControl);

      mapRef.current.on("click", handleMapClick);

      mapRef.current.on("move", () => {
        const bounds = mapRef.current.getBounds();
        const maxLat = 85.0511;
        const minLat = -85.0511;

        if (bounds.getNorth() > maxLat) {
          mapRef.current.panBy([0, bounds.getNorth() - maxLat], { animate: false });
        } else if (bounds.getSouth() < minLat) {
          mapRef.current.panBy([0, bounds.getSouth() - minLat], { animate: false });
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; 
      }
    };
  }, []);




  let currentMarker = null;
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    console.log(`Latitud: ${lat}, Longitud: ${lng}`);
    if (currentMarker) {
      mapRef.current.removeLayer(currentMarker);
    }

    if (onMapClick) {
      onMapClick(lat, lng);
      const customIcon = L.icon({
        iconUrl: 'marcador.png',
        iconSize: [16, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -32] 
      });
      currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
    }


    
      
  };


  

  return (
    <div id="map" style={{ height: "100vh", width: "100%" }}>
      <Map center={[-36.8225012, -73.0132711]} zoom={13} minZoom={5} maxZoom={15}>
        <TileLayer
          url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
          attribution='<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
          wrap={true}
        />
      </Map>
 
    </div>
    
  );
};

export default MapView;
