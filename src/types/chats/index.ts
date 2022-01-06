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
];

export const drawChart = (data: Array<number[]>, color?: string) => {
  var config = {
    colors: [red],
    height: 30,
  };

  if (color) {
    config.colors.pop();
    config.colors.push(dictionaryColorsPool.get(color));
  }

  if (data[0].length > process.stdout.columns - 30) {
    return plot(
      data[0].slice(data[0].length - process.stdout.columns - 30),
      config
    );
  }

  return plot(data, config);
};
