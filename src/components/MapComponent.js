import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationPicker = ({ formik }) => {
    const defaultIcon = new Icon({
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const map = useMapEvents({
        click: (e) => {
        formik.setFieldValue('lat', e.latlng.lat);
        formik.setFieldValue('lng', e.latlng.lng);
        },
    });
  
  
  return formik.values.lat && formik.values.lng ? (
    <Marker position={[formik.values.lat, formik.values.lng]} icon={defaultIcon} />
  ) : null;
};

const MapComponent = ({ formik }) => (
  <MapContainer center={[-17.383831, -66.151143]} zoom={13} style={{ height: "250px", width: "100%" }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    />
    <LocationPicker formik={formik} />
  </MapContainer>
);

export default MapComponent;