// UTILITY //

/**
 * Swaps an array tuple (a, b) in-place such that it becomes (b, a).
 * @param {*} param0 the array tuple (a, b)
 */
const swap = ([a, b]) => [b, a]

/**
 * Initializes the map with all relevant values for it to work.
 * @returns The initialized map as a Leaflet Map object
 */
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

/**
 * A simple csv to json parser function.
 * @param {*} csv The csv content to be converted
 * @returns The csv file as workable JS object
 */
const csvToJs = (csv) => {
    const lines = csv.split('\n');

    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].split(',');

        const entry = { };
        for (let [j, header] of headers.entries()) {
            header = header.replace(/\r/g, '');
            entry[header] = line[j].replace(/\r/g, '');
        }
        result.push(entry);
    }

    return result;
}

const filterDataByYear = (raw, year) => {
    return raw.filter(el => Number(el["Year"]) === year);
}

const swapData = (year) => {
    if (year === selectedYear) return;

    filteredData = filterDataByYear(data, year);
    selectedYear = year;
    
    for (let i = 2021; i <= 2023; i++) {
        const curSelector = document.getElementById(i);
        curSelector.style.backgroundColor = (i === selectedYear) 
            ? 'var(--color-sun)' 
            : 'transparent';
    }
}

// MAIN //

const LOC_JSON_PATH = './Stations.geojson';
const CSV_PATH = './full_dataset.csv';

const map = genMap();
let data;
let filteredData;
let selectedYear = 2023;

(async () => {
    // Map stuff
    const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });
    layer.addTo(map);

    const response = await fetch(LOC_JSON_PATH);
    const stations = await response.json();
    
    for (const location of stations.features) {
        const { properties, geometry } = location;

        const marker = L.marker(swap(geometry.coordinates), {
            opacity: 0.33,
            riseOnHover: true
        });
        marker.bindTooltip(properties.name).openTooltip();
        marker.addTo(map);
    }

    // Fetch data from csv and optimize it
    const csv = await fetch(CSV_PATH);
    data = csvToJs(await csv.text());
    filteredData = filterDataByYear(data, selectedYear);

    // Highlight currently selected year
    const curSelector = document.getElementById(selectedYear);
    curSelector.style.backgroundColor = 'var(--color-sun)'

    // Add event listeners to year selectors
    let y = 2021;
    const selectors = document.getElementsByClassName('unselectable selector-item');
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        selector.addEventListener('click', () => swapData(y + i));
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
