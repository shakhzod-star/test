<template>
  <div ref="mapViewDiv" style="height: 500px"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol.js";
import Graphic from "@arcgis/core/Graphic.js";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
// import Popup from "@arcgis/core/widgets/Popup.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const mapViewDiv = ref(null);

onMounted(() => {
  const map = new Map({
    basemap: "topo-vector", // This is where you can change the basemap type
  });
  var layer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0",
  });
  map.add(layer);

  const mapView = new MapView({
    container: mapViewDiv.value, // This references the <div> element
    map: map,
    zoom: 80, // Starting zoom level
    center: [69.336241, 41.34226], // Longitude, Latitude
  });

  // Path to your SVG icon
  const iconUrl = "/public/img/Work.svg"; // Adjust the path as necessary

  const markerSymbol = new PictureMarkerSymbol({
    url: iconUrl,
    width: "24px", // Set the size of the icon
    height: "24px",
  });

  const point = {
    type: "point", // autocasts as new Point()
    longitude: 69.336241,
    latitude: 41.34226,
  };

  var popupTemplate = new PopupTemplate({
    title: "Location Information",
    content: "Работа: Министерство цифровых технологий",
  });

  const pointGraphic = new Graphic({
    geometry: point,
    symbol: markerSymbol,
    outFields: ["*"],
    popupTemplate: popupTemplate,
  });

  mapView.graphics.add(pointGraphic);
});
</script>
