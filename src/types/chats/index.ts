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

export const drawChart = (data: number[], color?: string) => {
  var config = {
    colors: [red],
    height: 50,
  };

  if (color) {
    config.colors.pop();
    config.colors.push(dictionaryColorsPool.get(color));
  }

  if (data.length > 120) {
    data = data.slice(data.length - 120, data.length);
  }

  return plot(data, config);
};
