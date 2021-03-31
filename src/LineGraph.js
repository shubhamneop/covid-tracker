import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

const casesTypeColors = {
  cases: {
    hex: "#FF0000",
    rgb: "rgb(168,0,0)",
  },
  recovered: {
    hex: "#00FF00",
    rgb: "rgb(125, 215, 29)",
  },
  deaths: {
    hex: "#282828",
    rgb: "rgb(128,128,128)",
  },
};

function LineGraph({ casesType = "cases", countryCode, ...props }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const url =
        countryCode === "worldwide"
          ? "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
          : `https://disease.sh/v3/covid-19/historical/${countryCode}?lastdays=120`;
      await fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let chartData = buildChartData(
            countryCode === "worldwide" ? data : data.timeline,
            casesType
          );
          setData(chartData);
        });
    };

    fetchData();
  }, [casesType, countryCode]);

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: casesTypeColors[casesType].rgb,
                borderColor: casesTypeColors[casesType].hex,
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}
export default LineGraph;
