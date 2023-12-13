// UTILITY //

const swap = ([a, b]) => [b, a]

const genMap = () => {
    const map = L.map('leaflet-map');
    map.setView([37.648, -122.169], 11);
    map.setMinZoom(10);
    map.setMaxZoom(13);

    const boundsNE = L.latLng(38.238, -121.600);
    const boundsSW = L.latLng(37.385, -122.615);
    const bounds = L.latLngBounds(boundsNE, boundsSW);
    map.setMaxBounds(bounds);

    return map;
}

// MAIN //

const LOC_JSON_PATH = "./Stations.geojson";
const map = genMap();

(async () => {
    const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });
    layer.addTo(map);

    const response = await fetch(LOC_JSON_PATH);
    const stations = await response.json();
    
    for (const location of stations.features) {
        const { properties, geometry } = location;

        const marker = L.marker(swap(geometry.coordinates), {
            title: properties.name,
            opacity: 0.33,
            riseOnHover: true
        });
        marker.addTo(map);
    }
})();

// D3 map
/*const svg = d3.select(map.getPanes().overlayPane).append("svg");
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

map.on("viewreset move", update);

// Event listener for map click
map.on("click", function (event) {
    const [lat, lon] = [event.latlng.lat, event.latlng.lng];
    console.log("Clicked at Lat: " + lat + ", Lon: " + lon);
    // Create a popup and set its content
    const popup = L.popup()
        .setLatLng(event.latlng)
        .setContent(`Clicked at Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`)
        .openOn(map);

    // You can do further processing with the lat and lon values as needed
});

update();

function update() {
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    svg.attr("width", bottomRight.x - topLeft.x)
        .attr("height", bottomRight.y - topLeft.y)
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");

    g.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
}*/
