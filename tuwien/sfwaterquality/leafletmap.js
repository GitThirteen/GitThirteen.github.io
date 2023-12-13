const LOC_JSON_PATH = "./Stations.geojson";
const map = L.map('leaflet-map').setView([37.7, -122.3], 11);

(async () => {
    const response = await fetch(LOC_JSON_PATH);
    const stations = await response.json();
    
    for (const location of stations.features) {
        const { properties, geometry } = location;

        const marker = L.marker(geometry.coordinates);
        marker.addTo(map);
    }
})();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// D3 map
const svg = d3.select(map.getPanes().overlayPane).append("svg");
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
}
