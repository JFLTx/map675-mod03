import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";

const map = new maplibregl.Map({
  container: "map",
  center: [-82.7673, 37.5716], // starting position [lng, lat]
  zoom: 9, // starting zoom
  maxPitch: 85, // max pitch allowed
  hash: true, // sync map position with URL
  style: {
    version: 8,
    sprite: "https://nyc3.digitaloceanspaces.com/astoria/tiles/sprite/sprite",
    glyphs:
      "https://nyc3.digitaloceanspaces.com/astoria/tiles/fonts/{fontstack}/{range}.pbf",
    sources: {
      // Raster tile service from KyFromAbove
      // Note: They are using ArcGIS REST services to serve the tiles in a slippy map format.
      hillshade: {
        type: "raster",
        tiles: [
          "https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_MultiDirectional_Hillshade_WGS84WM/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 20,
      },
      aerial: {
        type: "raster",
        tiles: [
          "https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Imagery_Phase3_3IN_WGS84WM/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 21,
      },
      // Vector tile service from ArcGIS Online - courtesy of Department of Geography, University of Kentucky
      // Note: Vector tiles have multiple layers within a single source.
      NHDHydro_WM: {
        type: "vector",
        tiles: [
          "https://vectortileservices.arcgis.com/vQ8kO5zdqETeirEL/arcgis/rest/services/NHDHydro_WM/VectorTileServer/tile/{z}/{y}/{x}.pbf",
        ],
      },
      ky_mask: {
        type: "vector",
        tiles: [
          "https://vectortileservices.arcgis.com/vQ8kO5zdqETeirEL/arcgis/rest/services/ky_mask/VectorTileServer/tile/{z}/{y}/{x}.pbf",
        ],
      },
      // Raster DEM source for terrain - using a local terrain.json file
      // The terrain.json file references the actual raster tiles.
      terrainSource: {
        type: "raster-dem",
        url: "terrain.json",
        tileSize: 256,
      },
    },
    // Layers define how the data is displayed on the map.
    // The order of the layers is important as it defines the order in which they are drawn.
    // Each layer references a source defined above.
    // Has layout and paint properties that define how the layer looks.
    // This example uses background, raster, line, and fill layers.
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "rgba(195, 175, 165, 1)",
          "background-opacity": 1,
        },
      },
      {
        id: "hillshade",
        type: "raster",
        source: "hillshade",
        layout: {
          visibility: "visible",
        },
        paint: {
          "raster-brightness-min": 0.5,
          "raster-opacity": 0.75,
        },
      },
      {
        id: "aerial",
        type: "raster",
        source: "aerial",
        layout: {
          visibility: "none", // Can be toggled to "visible" to see aerial imagery
        },
        paint: {
          "raster-brightness-min": 0.3,
          "raster-saturation": 0.5,
          "raster-hue-rotate": 20,
          "raster-opacity": 0.3,
        },
      },
      // NHD Hydrography layers - from vector tile source
      {
        id: "NHDFlowline",
        type: "line",
        source: "NHDHydro_WM",
        "source-layer": "NHDFlowline", // specific layer within the vector tile source
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          // Makes the lines fade in as you zoom in
          // At Zoom 9, lines are invisible
          // At Zoom 12, lines are 25% opaque
          // At Zoom 14, lines are 50% opaque
          // At Zoom 17 and above, lines are fully opaque
          "line-opacity": {
            base: 1,
            stops: [
              [9, 0],
              [12, 0.25],
              [14, 0.5],
              [17, 1],
            ],
          },
          "line-color": "#43BCFDFF",
          "line-width": 1.33333,
        },
        minzoom: 9,
      },
      {
        id: "NHDArea/Inundation Area",
        type: "fill",
        source: "NHDHydro_WM",
        "source-layer": "NHDArea",
        // Filter to show only Inundation Area features
        // _symbol field is from the NHD data and defines the type of feature
        // This is only known from the ArcGIS Online item and is not standard across all NHD data
        // Inundation Area features have a _symbol value of 8
        filter: ["==", "_symbol", 8],
        paint: {
          "fill-opacity": 0.4,
          "fill-color": "#A2DBF9FF",
        },
      },
      {
        id: "NHDArea",
        type: "fill",
        source: "NHDHydro_WM",
        "source-layer": "NHDArea",
        filter: ["!=", "_symbol", 8],
        paint: {
          "fill-color": "#60C7FFFF",
          "fill-outline-color": "#43BCFDFF",
        },
      },

      {
        id: "NHDWaterbody",
        type: "fill",
        source: "NHDHydro_WM",
        "source-layer": "NHDWaterbody",
        paint: {
          "fill-color": "#60C7FFFF",
          "fill-outline-color": "#43BCFDFF",
        },
      },
      {
        id: "ky_mask_polygons",
        type: "fill",
        source: "ky_mask",
        "source-layer": "ky_mask_polygons",
        layout: {
          visibility: "visible",
        },
        paint: {
          "fill-opacity": {
            base: 1,
            stops: [
              [7, 1],
              [10, 0.75],
            ],
          },
          "fill-color": "#e3e3e3",
        },
      },
    ],
  },
});

// When the map loads, add the GeoJSON source and layers
map.on("load", () => {
  // Add sky style to the map, giving an atmospheric effect
  map.setSky({
    "sky-color": "#61C2FEFF",
    "sky-horizon-blend": 0.5,
    "horizon-color": "#EBF1F4FF",
    "horizon-fog-blend": 0.5,
    "fog-color": "#B5B5B5FF",
    "fog-ground-blend": 0.5,
    "atmosphere-blend": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      1,
      10,
      1,
      12,
      0,
    ],
  });

  // GeoJSON layers locally stored
  map.addSource("landslides", {
    type: "geojson",
    data: "/assets/data/d12_KGS_landslides.geojson",
  });

  map.addSource("counties", {
    type: "geojson",
    data: "/assets/data/kytc-d12-counties.geojson",
  });

  // Style points as circles
  map.addLayer({
    id: "landslides",
    type: "circle",
    source: "landslides",
    paint: {
      "circle-radius": 6,
      "circle-color": "#CD0101FF",
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 1,
      "circle-opacity": 0.75,
    },
  });

  // Add labels for landslides
  // map.addLayer({
  //   id: "landslides-labels",
  //   type: "symbol",
  //   source: "landslides",
  //   layout: {
  //     "text-field": ["get", "ID"],
  //     "text-font": ["Open Sans Bold"], // Font must be available in the glyphs URL
  //     "text-size": 12,
  //     "text-offset": [0, 1.2],
  //     "text-anchor": "top",
  //   },
  //   paint: {
  //     "text-color": "#000000",
  //     "text-halo-color": "#FFFFFF",
  //     "text-halo-width": 1,
  //     "text-halo-blur": 1,
  //     "text-opacity": {
  //       base: 1,
  //       // Labels show at zoom 17 and above
  //       stops: [
  //         [17, 0],
  //         [17.1, 1],
  //       ],
  //     },
  //   },
  // });

  map.addLayer(
    {
      id: "counties-outline",
      type: "line",
      source: "counties",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#53555c",
        "line-opacity": 0.9,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          0.6,
          8,
          1.2,
          10,
          1.8,
          12,
          2.4,
          14,
          3.0,
        ],
      },
    },
    "landslides" // ensures that the counties is added before landslides
  );

  // Add interactivity with popups when hovering over points
  map.on("mouseenter", "landslides", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Reset cursor when not hovering over points
  map.on("mouseleave", "landslides", () => {
    map.getCanvas().style.cursor = "";
  });

  // helper function to handle null/undefined/empty feature properties
  function value(val, text = "Unknown") {
    return val === null || val === undefined || val == "" ? text : val; // if anything is empty/null/undefined, the string will return "Unknown"
  }

  // Show popup when clicking on a point
  map.on("click", "landslides", (e) => {
    const f = e.features[0].properties; // shorthand the properties values
    console.log(e.features[0]);

    const coordinates = e.features[0].geometry.coordinates.slice();
    const id = value(f.ID);
    const county = value(f.County);
    const unit = value(f.GeologicUnit);
    const rock = value(f.Lithology);
    const surfaceGeo = value(f.Surficial_Geology);
    const position = value(f.Geomorphic_Position);
    const aspect = value(f.Aspect);
    const factor = value(f.Contributing_Factor);

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<h2 class="text-xl">KGS Landslide ID: ${id}</h2><p>Landslide in ${county} County, occurred in ${unit}<br>
        <br>Aspect: ${aspect}
        <br>Factors: ${factor} <br>
        <br>Lithology: ${rock}; ${surfaceGeo} surficial geology
        <br>Geomorphic Position: ${position}</p>`
      )
      .addTo(map);
  });
});

// Add basic map controls
map.addControl(new maplibregl.NavigationControl(), "top-left");
map.addControl(new maplibregl.FullscreenControl());
map.addControl(
  new maplibregl.ScaleControl({
    maxWidth: 80,
    unit: "imperial",
  })
);

// Add geolocate control to the map
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: true,
  })
);

// Add terrain control for 3D effect
map.addControl(
  new maplibregl.TerrainControl({
    source: "terrainSource",
    exaggeration: 2,
  })
);

// Event listeners to monitor map changes
map.on("move", () => {
  const center = map.getCenter();
  console.log(
    `Longitude: ${center.lng.toFixed(4)} Latitude: ${center.lat.toFixed(4)}`
  );
});

map.on("zoomend", () => {
  // console.log("Zoom: ", map.getZoom().toFixed(2));
});
