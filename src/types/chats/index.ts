import asciichart, {black,
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
    plot
} from "asciichart"

var dictionaryColorsPool = new Map<string, any> 
(Object.entries({
    "black" : black,
    "red" : red,
    "green" : green,
    "yellow" : yellow,
    "blue" : blue,
    "magenta" : magenta,
    "cyan" : cyan,
    "lightgray" : lightgray,
    "darkgray" : darkgray,
    "lightred" : lightred,
    "lightgreen" : lightgreen,
    "lightyellow" : lightyellow,
    "lightblue" : lightblue,
    "lightmagenta" : lightmagenta,
    "lightcyan" : lightcyan,
    "white" : white,
}))

const drawChart = (data: number[], color?:string) =>
{
    var config = {
        colors: [
            red
        ],
        height:  50
    }

    if (color)
    {
        config.colors.pop()
        config.colors.push(dictionaryColorsPool.get(color))
    }

    if (data.length > 120)
    {
        data = data.slice(data.length - 120,data.length)
    }

    console.log (plot(data, config))
}