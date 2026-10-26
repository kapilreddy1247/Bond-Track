// Renders an OpenStreetMap tile map with the child's marker, an optional
// trail (polyline), and an optional parent "you are here" marker + a
// straight-line connector between the two. No API key or billing needed.

import { WebView } from "react-native-webview";

type LatLng = { latitude: number; longitude: number };

type Props = {
  latitude: number;
  longitude: number;
  label?: string;
  path?: LatLng[];
  userLocation?: LatLng;
};

export default function LeafletMap({ latitude, longitude, label, path, userLocation }: Props) {
  const pathCoords = (path ?? []).map((p) => `[${p.latitude},${p.longitude}]`).join(",");

  const connectorCoords = userLocation
    ? `[[${userLocation.latitude},${userLocation.longitude}],[${latitude},${longitude}]]`
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map', { zoomControl: false });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          ${pathCoords ? `L.polyline([${pathCoords}], { color: '#2E6F6E', weight: 3, opacity: 0.7 }).addTo(map);` : ""}
          ${connectorCoords ? `L.polyline(${connectorCoords}, { color: '#E8A33D', weight: 2, opacity: 0.9, dashArray: '6 8' }).addTo(map);` : ""}

          const childMarker = L.marker([${latitude}, ${longitude}])
            .addTo(map)
            ${label ? `.bindPopup(${JSON.stringify(label)})` : ""};

          const bounds = [[${latitude}, ${longitude}]];

          ${
            userLocation
              ? `
          L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
            radius: 8,
            color: '#2F5FA8',
            fillColor: '#2F5FA8',
            fillOpacity: 0.9,
          }).addTo(map).bindPopup('You');
          bounds.push([${userLocation.latitude}, ${userLocation.longitude}]);
          `
              : ""
          }

          if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [40, 40] });
          } else {
            map.setView(bounds[0], 15);
            childMarker.openPopup();
          }
        </script>
      </body>
    </html>
  `;

  return <WebView originWhitelist={["*"]} source={{ html }} style={{ flex: 1 }} />;
}