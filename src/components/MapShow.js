import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MapShow = ({ lat, lng }) => {
    const defaultIcon = new Icon({
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
  
    return (
        <MapContainer center={[lat, lng]} zoom={13} style={{ height: "250px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[lat, lng]} icon={defaultIcon} />
        </MapContainer>
    );
};

export default MapShow;