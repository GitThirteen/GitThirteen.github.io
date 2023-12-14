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

const editDataDisplay = (e, isMarker) => {
    const id = !dfStatus[0] ? 'df-1-' : 'df-2-';

    let dataField = document.getElementById(id + 'default');
    dataField.classList.add('hidden');

    dataField = document.getElementById(id + 'data');
    dataField.classList.remove('hidden');

    const title = document.getElementById(id + 'title');
    const coords = document.getElementById(id + 'coords');
    const temp = document.getElementById(id + 'temp');
    const muddiness = document.getElementById(id + 'muddiness');
    const algae = document.getElementById(id + 'algae');
    const salinity = document.getElementById(id + 'salinity');

    title.innerHTML = isMarker ? e.target._tooltip._content : 'Custom Selection';
    
    const { lat, lng } = e.latlng;
    coords.innerHTML = `[${lat.toFixed(3)}, ${lng.toFixed(3)}]`;

    /*for (let i = 0; i < dataField.children.length; i++) {
        const child = dataField.children[i];
        console.log(child.innerHTML);
        if (child.id === 'title') {
            child.innerHTML = isMarker ? e.target._tooltip._content : 'Custom Selection';
        }
        else if (child.id === 'coords') {
            const { lat, lng } = e.latlng;
            child.innerHTML = `[${lat.toFixed(3)}, ${lng.toFixed(3)}]`;
        }
    }*/

    if (id === 'df-1-') dfStatus[0] = true;
    else dfStatus[1] = true;
}

const resetDataDisplay = (id) => {
    let dataField = document.getElementById(id + 'data');
    dataField.classList.add('hidden');

    dataField = document.getElementById(id + 'default');
    dataField.classList.remove('hidden');

    if (id === 'df-1-') dfStatus[0] = false;
    else dfStatus[1] = false;
}

// MAIN //

const LOC_JSON_PATH = './Stations.geojson';
const CSV_PATH = './full_dataset.csv';

const map = genMap();
let data;
let filteredData;
let dfStatus = [false, false];
let selectedYear = 2023;

(async () => {
    // Map stuff
    const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });
    layer.addTo(map);

    // Add on-click event listener for map
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        editDataDisplay(e, false);
    });

    // Add on-click event listener for del icon
    const titleWrappers = document.getElementsByClassName('title-wrapper');
    for (let i = 0; i < titleWrappers.length; i++) {
        const children = [...titleWrappers[i].children]
        const icons = children.filter(child => child.tagName.toLowerCase() === 'i');
        icons[0].addEventListener('click', () => resetDataDisplay(`df-${i + 1}-`));
    }

    // Map markers
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
        
        // Add on-click event listener for each marker
        marker.on('click', (e) => {
            const { lat, lng } = e.latlng;
            console.log(e);
            editDataDisplay(e, true);
        });
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