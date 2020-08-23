

/*
	USAGE
Drag the button above to your Bookmarks Bar in Chrome.
Click the button when in an Originator task.

	DISCLAIMER
This script is provided as a convenience tool. 
The author will not be held liable for its potential misuse.
The user agrees to use the script responsibly and treat
SRT files obtained with its help as Netflix confidential
material as described in the NDA.

As with other confidential assets the SRT file must be deleted 
when you finish working on the project.

The source code for this tool is provided below.
Please make sure to review it.

(c) Dan Biktashev katzurki@gmail.com
May 24 2020 v2.0
*/

var our_clq = document.location.href
    .toString() 
    .split("=")[1]
if (!our_clq) {
    alert(
        "You must be in an Originator task!"
    );
    throw new Error
}
var lsJson = localStorage[our_clq]
if (!lsJson) {
    alert("Timed text events not found in localStorage\nfor CLQ: " +
        our_clq + "\n" +
        "If the CLQ is correct and" + "\n" +
        "\"Save to local storage\" is enabled in Settings," +
        "\n" +
        "save the task and try again."
    );
    throw new Error
}
var json_obj = JSON.parse(lsJson)
var src = json_obj["events"]
var fps_meta = json_obj["meta"]["fps"]
var fps = (fps_meta
        .split("_")[1]) /
    100 //From {"fps
//if (fps >= 23.97 && fps <= 24) fps =
 //   23.976023976023978 //To take care of dropframes
var fps_ = "_FPS_" + (fps *
    100
) //to include as part of the filename.srt
var frms = 1000 / fps
var mid = json_obj["meta"]["movieId"]
var pid = json_obj["meta"]["packageId"]
var template_url = "https://originator.backlot.netflix.com/api/request/timedText/"+our_clq+'/'+pid+'/'+mid+'/en/TEMPLATE/PRIMARY/'+fps_meta+'?source=ORIGINATOR'
var targetFilename = srtName(fps_+"_TRANSLATION")
var sourceFilename = srtName(fps_+"_SOURCE")

async function getSourceColumnEvents() {
  var result = await (await fetch(template_url)).json(); 
  return result;
}

async function delayedDownload() {
  var result = await getSourceColumnEvents();
  download(sourceFilename, array2srt(result))
}


delayedDownload()
download(targetFilename,array2srt(src))


function srtName(suffix = "") {
    var s = document
        .getElementsByClassName(
            "cpe-page-menu-label")[0]
        .innerText
    var srtName = (s.replace(/[ ]/g
                , '_')
            .replace(/[^a-z0-9_]/gi
                , '') + suffix + ".srt"
        ) //This gets rid of all punctuation, spaces and non-English letters
        .trim() ///resultin,array2srt(src)in a name like 14545_El_Burrito_A_Breaking_Fat_Movie_FPS_2500.srt
    if (!srtName) srtName = our_clq +        ".srt" //Fallback measure. Useful for debugging later
    return srtName
}

function frames2timecode(frames) {
    var milliseconds = Math.round(
        frames * frms)
    var srt_timecode = TimeConversion(
        milliseconds)
    return srt_timecode
}

function array2srt(events_object) {
	console.log(events_object)
    var ordered_events = []
    for (var id in events_object) {
        ordered_events.push([
            events_object[id][
                "start"
            ]
            , events_object[id][
                "end"
            ], events_object[id]
            ["txt"]
        ])
    }
    ordered_events.sort(function (a
        , b) {
        return a[0] - b[0];
    }); //Array sorted by in_cues, sequentially
    var index = 0
    var srt_txt = ''
    for (event of ordered_events) {
        index++
        var start = frames2timecode(
            event[0])
        var end = frames2timecode(event[
            1])
        var content = event[2]
        var current_event = index +
            "\n" + start + " --> " +
            end +
            "\n" + content + "\n"
        srt_txt += current_event + "\n"
    }
    return srt_txt
}

function download(filename, text) {
    var element = document
        .createElement('a');
    element.setAttribute('href'
        , 'data:text/plain;charset=utf-8,' +
        encodeURIComponent(text));
    element.setAttribute('download'
        , filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function TimeConversion(duration) {
    let time = parseDuration(duration)
    return formatTimeHMSS(time)
}

function parseDuration(duration) {
    let remain = duration
    let hours = Math.floor(remain / (
        1000 * 60 * 60))
    remain = remain % (1000 * 60 * 60)
    let minutes = Math.floor(remain / (
        1000 * 60))
    remain = remain % (1000 * 60)
    let seconds = Math.floor(remain / (
        1000))
    remain = remain % (1000)
    let milliseconds = remain
    return {
        hours
        , minutes
        , seconds
        , milliseconds
    }
}

function formatTimeHMSS(o) {
    let hours = o.hours.toString()
    if (hours.length === 1) hours =
        '0' + hours
    let minutes = o.minutes.toString()
    if (minutes.length === 1) minutes =
        '0' + minutes
    let seconds = o.seconds.toString()
    if (seconds.length === 1) seconds =
        '0' + seconds
    let milliseconds = o.milliseconds
        .toString()
    if (milliseconds.length === 1)
        milliseconds = '00' +
        milliseconds
    if (milliseconds.length === 2)
        milliseconds = '0' +
        milliseconds
    return hours + ":" + minutes + ":" +
        //Example: 00:01:02,999 -- note that the SRT spec calls for a comma, not a period!
        seconds + "," +
        milliseconds
}




