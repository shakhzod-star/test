<script setup>
import Papa from "papaparse";
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// apexchart Start

// const filteredDatesAscending = ref([]);
const filteredValueAscending = ref([]);
const dateStringAscending = ref([]);
async function Ascending() {
  return new Promise((resolve, reject) => {
    Papa.parse("/src/data/ascending.csv", {
      download: true,
      header: true,
      complete: async (results) => {
        // console.log(results, "ascending");
        filteredValueAscending.value = findMiddleArifmetic(results.data);
        dateStringAscending.value = await results?.meta?.fields;

        resolve();
      },
    });
  });
}
// const filteredDatesDescending = ref([]);
const filteredValueDescending = ref([]);
async function Descending() {
  return new Promise((resolve, reject) => {
    Papa.parse("/src/data/descending.csv", {
      download: true,
      header: true,
      complete: (results) => {
        dateStringAscending.value = results?.meta?.fields;
        filteredValueDescending.value = findMiddleArifmetic(results.data);
        // filteredDatesDescending.value = dateStringAscending.value
        //   .filter((date) => {
        //     const year = parseInt(date.substring(0, 4));
        //     return year;
        //   })
        //   .map((date) => {
        //     const year = date.substring(0, 4);
        //     const month = date.substring(4, 6);
        //     const day = date.substring(6, 8);
        //     return `${year}-${month}-${day}`;
        //   });

        resolve();
      },
    });
  });
}

function findMiddleArifmetic(data) {
  const sums = {};
  const counts = {};

  // Sum values and count occurrences dynamically
  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      // Initialize sums and counts for each key
      if (!sums.hasOwnProperty(key)) {
        sums[key] = 0;
        counts[key] = 0;
      }
      sums[key] += Number(entry[key]);
      counts[key]++;
    });
  });
  // Calculate means
  console.log(sums);
  let means = [];
  Object.keys(sums).forEach((key) => {
    if (counts[key] > 0) {
      const year = key.substring(0, 4);
      const month = key.substring(4, 6);
      const day = key.substring(6, 8);
      let date = new Date(year, month, day);
      let newDate = date.getTime();
      // means[newDate] = Math.floor((sums[key] / counts[key]) * 10) / 10;
      means.push({
        date: newDate,
        value: Math.floor((sums[key] / counts[key]) * 10) / 10,
      });
    } else {
      const year = key.substring(0, 4);
      const month = key.substring(4, 6);
      const day = key.substring(6, 8);
      let date = new Date(year, month, day);
      let newDate = date.getTime();
      means.push({
        date: newDate,
        value: 0,
      });
    }
  });
  console.log(means);
  return means;

  // Example usage with your data format
}
// async function loadData() {
//   return new Promise((resolve, reject) => {
//     console.log(1);
//     resolve();
//   });
// }

// apexchartEnd
let root;
onMounted(async () => {
  await Ascending();
  await Descending();
  console.log(filteredValueAscending.value, 2);
  // console.log(typeof filteredValueDescending.value, 2);

  root = am5.Root.new("chartdiv");

  // Custom theme
  const myTheme = am5.Theme.new(root);
  myTheme.rule("AxisLabel", ["minor"]).setAll({
    dy: 1,
  });
  myTheme.rule("Grid", ["x"]).setAll({
    strokeOpacity: 0.05,
  });
  myTheme.rule("Grid", ["x", "minor"]).setAll({
    strokeOpacity: 0.05,
  });

  // Set themes
  root.setThemes([am5themes_Animated.new(root), myTheme]);

  // Create chart
  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      pinchZoomX: true,
    })
  );

  // Data generator
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  let value = 100;
  function myGenerator(series) {
    return series == "Ascending"
      ? filteredValueAscending.value
      : filteredValueDescending.value;
  }

  // Axes
  let xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "day",
        count: 1,
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
      }),
      tooltip: am5.Tooltip.new(root, {}),
    })
  );

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );
  let seriesArr = ["Ascending", "Descending"];
  // Series
  for (let i = 0; i < seriesArr.length; i++) {
    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: seriesArr[i],
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}",
        }),
      })
    );

    date = new Date();
    date.setHours(0, 0, 0, 0);
    value = 0;
    // console.log(generateDatas(10));
    // console.log(myGenerator());
    series.data.setAll(myGenerator(seriesArr[i]));
    series.appear();
  }

  // Cursor and Scrollbars
  let cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "none" })
  );
  cursor.lineY.set("visible", false);

  chart.set(
    "scrollbarX",
    am5.Scrollbar.new(root, { orientation: "horizontal" })
  );
  chart.set("scrollbarY", am5.Scrollbar.new(root, { orientation: "vertical" }));

  // Legend
  let legend = chart.rightAxesContainer.children.push(
    am5.Legend.new(root, {
      width: 200,
      paddingLeft: 10,
      height: am5.percent(50),
    })
  );

  legend.data.setAll(chart.series.values);
  // chart.appear(10, 100);
});

onBeforeUnmount(() => {
  if (root) {
    root.dispose();
  }
});
// My Apexchart Code
const series = ref([
  {
    name: "Ascending",
    data: [],
  },
  {
    name: "Descending",
    data: [],
  },
]);

const chartOptions = ref({
  chart: {
    height: 350,
    type: "line",
    dropShadow: {
      enabled: true,
      color: "#000",
      top: 18,
      left: 8,
      blur: 10,
      opacity: 0.2,
    },
    toolbar: {
      show: false,
    },
  },
  colors: ["#77B6EA", "#545454"],
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: "smooth",
  },
  title: {
    text: "Average High & Low Temperature",
    align: "left",
  },
  grid: {
    borderColor: "#e7e7e7",
    row: {
      colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
  },
  markers: {
    size: 1,
  },
  // categoriesXasis
  xaxis: {
    categories: [1, 2],
    title: {
      text: "Statistics Ascending and Descending Data",
    },
  },
  yaxis: {
    title: {
      text: "Temperature",
    },
    min: 5,
    max: 40,
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -25,
    offsetX: -5,
  },
});
// onMounted(() => {
//   loadData();
// });
// A function to format date strings to "Year Month" format
</script>
<template>
  <div id="chartdiv" style="width: 100%; height: 500px"></div>
</template>

<style>
#chartdiv {
  width: 100%;
  height: 500px;
}
</style>
