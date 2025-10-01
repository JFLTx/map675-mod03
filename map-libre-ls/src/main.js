import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";

const map = new maplibregl.Map({
  container: "map",
  center: [-84.5, 38], // starting position [lng, lat]
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
  // console.log(
  //   `Longitude: ${center.lng.toFixed(4)} Latitude: ${center.lat.toFixed(4)}`
  // );
});

map.on("zoomend", () => {
  // console.log("Zoom: ", map.getZoom().toFixed(2));
});
