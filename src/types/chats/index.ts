import {
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  lightgray,
  darkgray,
  lightred,
  lightgreen,
  lightyellow,
  lightblue,
  lightmagenta,
  lightcyan,
  white,
  plot,
} from "asciichart";

const dictionaryColorsPool = new Map<string, any>(
  Object.entries({
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    lightgray,
    darkgray,
    lightred,
    lightgreen,
    lightyellow,
    lightblue,
    lightmagenta,
    lightcyan,
    white,
  })
);

const a = [
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  lightred,
  lightgreen,
  lightyellow,
  lightblue,
  lightmagenta,
  lightcyan,
  white,
  black,
  lightgray,
  darkgray,
];

export const drawChart = (data: Array<number[]>, customConfig?: any) => {

  var tempConfigs = customConfig
  if (!tempConfigs)
  {
    tempConfigs = {
      colors: [],
      height: 30
    };
  }
  if (!tempConfigs.colors)
  {
    tempConfigs.colors = []
  }
  for (var i = 0; i < data.length; i++) 
  {
    tempConfigs.colors.push(a[i])

    if (data[i].length > process.stdout.columns - 15) {
        data[i] = data[i].slice(data[i].length - process.stdout.columns + 15)
    }
  }

  return plot(data, tempConfigs);
};
