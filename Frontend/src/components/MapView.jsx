import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet-geosearch/dist/geosearch.css"; // Importa los estilos CSS de leaflet-geosearch

const Map = dynamic(() => import("react-leaflet").then((mod) => mod.Map), {
  ssr: false,
});

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});

const MapView = ({ onMapClick, onRectangle }) => {
  const mapRef = useRef(null);
  const rectangleRef = useRef(null);
  const handleRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      require("leaflet-path-transform");
      if (!mapRef.current) {
        mapRef.current = L.map("map", {
          center: [-36.8225012, -73.0132711],
          zoom: 8,
          minZoom: 2,
          maxZoom: 17,
        });

        const Esri_WorldStreetMap = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
          }
        );

        mapRef.current.addLayer(Esri_WorldStreetMap);

        const LeafletGeosearch = require("leaflet-geosearch");

        const searchControl = new LeafletGeosearch.GeoSearchControl({
          provider: new LeafletGeosearch.OpenStreetMapProvider(),
          style: "bar",
          showMarker: false,
          showPopup: false,
          autoClose: true,
          retainZoomLevel: false,
          animateZoom: true,
          searchLabel: "Ingrese dirección",
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
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    console.log(`Latitud: ${lat}, Longitud: ${lng}`);
    if (onMapClick) {
      onMapClick(lat, lng);
      if (!rectangleRef.current) {
        const bounds = [
          [lat - 0.025, lng - 0.025],
          [lat - 0.025, lng + 0.025],
          [lat + 0.025, lng + 0.025],
          [lat + 0.025, lng - 0.025],
          [lat - 0.025, lng - 0.025],
        ];
        rectangleRef.current = L.polygon(bounds, { transform: true, color: "#ff7800", weight: 1 }).addTo(mapRef.current);

        rectangleRef.current.transform.enable();

        const southWest = rectangleRef.current.getBounds().getSouthWest();
        const northEast = rectangleRef.current.getBounds().getNorthEast();
        // console.log("Latitud inferior izquierda:", southWest.lat, "Longitud inferior izquierda:", southWest.lng);
        //console.log("Latitud superior derecha:", northEast.lat, "Longitud superior derecha:", northEast.lng);

        rectangleRef.current.on("transform", handleTransform);
        onRectangle(southWest.lat, southWest.lng, northEast.lat, northEast.lng);
      }

      if (!handleRef.current) {
        const handleBounds = [
          [lat - 0.025, lng + 0.025],
          [lat + 0.025, lng + 0.025],
          [lat + 0.025, lng + 0.05],
          [lat - 0.025, lng + 0.05],
          [lat - 0.025, lng + 0.025], // cerrando la zona de manejo
        ];
        handleRef.current = L.polygon(handleBounds, { color: "#000", weight: 0 }).addTo(mapRef.current);
      }
    }
  };

  const handleTransform = () => {
    const bounds = rectangleRef.current.getLatLngs()[0];
    let bottomLeft, upperRight;

    bounds.forEach((corner, index) => {
      if (index === 0) {
        bottomLeft = corner;
        // console.log(`Latitud inferior izquierda: ${corner.lat}, Longitud inferior izquierda: ${corner.lng}`);
      }
      if (index === 2) {
        upperRight = corner;
        // console.log(`Latitud superior derecha: ${corner.lat}, Longitud superior derecha: ${corner.lng}`);
      }
    });

    const latDiff = Math.abs(upperRight.lat - bottomLeft.lat);
    const lngDiff = Math.abs(upperRight.lng - bottomLeft.lng);

    if (latDiff > 10 || lngDiff > 10) {
      setImage('bad.png'); // Actualiza la imagen a 'bad.png' si excede el máximo
    } else if (latDiff < 2 || lngDiff < 2) {
      setImage('bad.png'); // Actualiza la imagen a 'bad.png' si está por debajo del mínimo
    } else {
      setImage('ok.png'); // Si no está ni por debajo del mínimo ni por encima del máximo, actualiza la imagen a 'ok.png'
    }

    onRectangle(bottomLeft.lat, upperRight.lat, bottomLeft.lng, upperRight.lng);
  };

  const handleDeleteRectangles = () => {
    if (rectangleRef.current) {
      mapRef.current.removeLayer(rectangleRef.current);
      rectangleRef.current.transform.disable(); // Deshabilitar la transformación
      rectangleRef.current = null;
    }
    if (handleRef.current) {
      mapRef.current.removeLayer(handleRef.current);
      handleRef.current = null;
    }
  };
  const [image, setImage] = useState('bad.png'); // Por defecto, muestra la imagen 'ok.png'


  return (
    <div className="">

      <div id="map" style={{ height: "96vh", width: "100%" }} className="select-none">

        <Map center={[-36.8225012, -73.0132711]} zoom={13} minZoom={5} maxZoom={15}>
          <TileLayer
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
            attribution='<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
            wrap={true}
          />
        </Map>

      </div>
      <div className="flex items-center justify-center w-full  p-1'bg-blue-100 " >
        <button onClick={handleDeleteRectangles} className="mr-2 bg-red-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Borrar</button>
        <img src={image} alt="StatusMap" className="w-8 h-8" />
      </div>
    </div>
  );
};

export default MapView;
