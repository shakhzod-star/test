<script setup>
import Papa from "papaparse";
import { ref, onMounted } from "vue";
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
onMounted(() => {
  loadData();
});
// A function to format date strings to "Year Month" format

const filteredDatesAscending = ref([]);
const filteredValueAscending = ref([]);
const dateStringAscending = ref([]);
async function Ascending() {
  return new Promise((resolve, reject) => {
    Papa.parse("/src/data/ascending.csv", {
      download: true,
      header: true,
      complete: async (results) => {
        console.log(results, "ascending");
        console.log(results);

        filteredValueAscending.value = findMiddleArifmetic(results.data);

        dateStringAscending.value = await results?.meta?.fields;
        filteredDatesAscending.value = dateStringAscending.value
          .filter((date) => {
            const year = parseInt(date.substring(0, 4));
            return year;
          })
          .map((date) => {
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);
            return `${year}-${month}-${day}`;
          });

        // Convert and log the formatted dates

        resolve();
      },
    });
  });
}

const filteredDatesDescending = ref([]);
async function Descending() {
  return new Promise((resolve, reject) => {
    Papa.parse("/src/data/descending.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const dateStrings = results?.meta?.fields;
        filteredDatesDescending.value = dateStrings
          .filter((date) => {
            const year = parseInt(date.substring(0, 4));
            return year;
          })
          .map((date) => {
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);
            return `${year}-${month}-${day}`;
          });

        resolve();
      },
    });
  });
}
function formatDateStrings(dateStrings) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedDates = new Set(); // Using a Set to avoid duplicates

  for (const key in dateStrings) {
    const date = new Date(dateStrings[key]);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    formattedDates.add(`${day}-${month} ${year}`);
  }

  return Array.from(formattedDates);
}
function sortDate(array) {
  return array.sort(function (a, b) {
    return new Date(b) - new Date(a);
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
  const means = {};
  Object.keys(sums).forEach((key) => {
    if (counts[key] > 0) {
      const year = key.substring(0, 4);
      const month = key.substring(4, 6);
      const day = key.substring(6, 8);
      let newDate = `${year}-${month}-${day}`;
      means[newDate] = Math.floor((sums[key] / counts[key]) * 10) / 10;
    } else {
      const year = key.substring(0, 4);
      const month = key.substring(4, 6);
      const day = key.substring(6, 8);
      let newDate = `${year}-${month}-${day}`;
      means[newDate] = 0; // Handle the case of no data
    }
  });

  return means;

  // Example usage with your data format
}
function dateFillWithMinus(data) {
  console.log(data);

  return data.map((obj) => {
    const transformed = {};
    Object.entries(obj).forEach(([key, value]) => {
      const year = key.substring(0, 4);
      const month = key.substring(4, 6);
      const day = key.substring(6, 8);
      transformed[`${year}-${month}-${day}`] = value;
    });
    return transformed;
  });
}
const categoriesXasis = ref([]);
async function loadData() {
  await Ascending();
  await Descending();
  let arr = sortDate([
    ...filteredDatesAscending.value,
    ...filteredDatesDescending.value,
  ]);
  categoriesXasis.value = formatDateStrings(arr.reverse());
  chartOptions.value = {
    xaxis: {
      categories: categoriesXasis,
    },
  };
  // console.log(filteredValueAscending.value);
  // console.log(arr, filteredDatesAscending.value);
  console.log(arr);
  // let arrr = arr.map((item) => {
  //   return filteredDatesAscending.value.includes(item) ? item : 0;
  // });
  // for (var prop in filteredValueAscending.value) {
  //   prop = 0;
  //   console.log(prop);
  // }
  console.log(filteredValueAscending.value);
  // let arr3 = dateFillWithMinus(filteredValueAscending.value);
  // console.log(arrr);
  // console.log(arrr, filteredValueAscending.value);
  // console.log(filteredDatesAscending.value, arr.reverse());
  // series.value[0].data
}
</script>
<template>
  <apexchart
    type="line"
    height="400px"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>
