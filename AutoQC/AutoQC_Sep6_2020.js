        javascript: (function () {
            //Originator/Backlot/SRT AutoQC Tool under GNU GPLv3
            //No guarantee of result, no warranty. 
            //Data obtained with this tool inherits access rights from source
            //Change LANG to switch to language-specific CPS and line limits
            //(AR, CN, DE, FR, GR, PT, RU, EN)
            //USAGE: Run from console, or drag to bar as bookmarklet (https://caiorss.github.io/bookmarklet-maker/) and click once

            var LANG = "EN"
            var outOfTheBox
            var qcMeta = {}
            qcMeta.lang = LANG
            if(document.location.href.includes(
                    "originator.backlot.netflix.com")) {
                var our_clq = document.location.href
                    .split(":")[3]
                if(our_clq) {
                    qcMeta.clq = our_clq
                }
                outOfTheBox = false
                console.log(
                    "DEBUG: state: inTheBox\nour_clq: from location " +
                    our_clq)
            }
            else if(typeof Window.autoQC_safe_meta !==
                "undefined") {
                var qcSavedMeta = JSON.parse(Window
                    .autoQC_safe_meta)
                var our_clq = qcSavedMeta.clq
                console.log(
                    "DEBUG: state: outOfTheBox\nour_clq: from qcSavedMeta " +
                    our_clq)
            }
            else if(document.body.innerText.split("\n")[1]
                .includes(" --> ")) {
                var our_clq = document.body.innerText.split(
                    "\n")
                console.log(
                    "DEBUG: state: in SRT file\nour_clq: split object " +
                    (typeof our_clq))
            }

            function setShotChanges() {
                if(typeof our_clq !== "object" && document
                    .location.href.includes(
                        "originator.backlot.netflix.com")) {
                    var getJSON = function (url, callback) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, true);
                        xhr.responseType = 'json';
                        xhr.onload = function () {
                            var status = xhr.status;
                            if(status === 200) {
                                callback(null, xhr
                                    .response);
                            }
                            else {
                                callback(status, xhr
                                    .response);
                            }
                        };
                        xhr.send();
                    }

                    if(!localStorage.getItem("shotChanges:" +
                            our_clq)) {

                        if(!outOfTheBox) {
                            getJSON("https://originator.backlot.netflix.com/api/request/shotchanges/clq:origination:" +
                                our_clq,
                                function (err, data) {
                                    if(err !== null) {
                                        alert('Something went wrong with error status: ' +
                                            err +
                                            '\nIf it\'s 500-something, please reload the page and try again.'
                                        );
                                    }
                                    else {
                                        localStorage
                                            .setItem(
                                                "shotChanges:" +
                                                our_clq,
                                                data[
                                                    "frameNumbers"
                                                ])
                                        qcMeta.SC = data[
                                            "frameNumbers"
                                        ]

                                        console.log(
                                            "DEBUG: Shot changes for " +
                                            our_clq +
                                            " saved in localStorage"
                                        )

                                    }
                                })
                        }
                        else {
                            localStorage.setItem(
                                "shotChanges:" +
                                qcSavedMeta.clq,
                                qcSavedMeta.SC)
                        }

                    }
                    else {
                        console.log(
                            "DEBUG: Shot changes for " +
                            our_clq +
                            " already present in localStorage"
                        )
                        qcMeta.SC = localStorage.getItem(
                            "shotChanges:" + our_clq)

                    }

                }

            }

            function defer(method) {
                if(localStorage.getItem("shotChanges:" +
                        our_clq) || typeof our_clq ==
                    "object") {
                    setTimeout(function () {
                        runAutoQC(our_clq);
                    }, 2400);
                }
                else {
                    setTimeout(function () {
                        defer(runAutoQC)
                    }, 350);
                }
            }

            (function (global, factory) {
                typeof exports === 'object' &&
                    typeof module !==
                    'undefined' ?
                    module.exports = factory() :
                    typeof define === 'function' && define
                    .amd ?
                    define(
                        factory) :
                    (global.runAutoQC = factory());
            }(this, (function () {
                'use strict';

                function uid() {
                    return ([1e7] + -1e3 + -4e3 +
                            -8e3 + -1e11)
                        .replace(/[018]/g, c => (
                                c ^ crypto
                                .getRandomValues(
                                    new Uint8Array(
                                        1))[0] &
                                15 >> c / 4)
                            .toString(16))
                }

                function runAutoQC() {
                    var clq_pattern = new RegExp(
                        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
                        'i');

                    if(typeof our_clq !==
                        "object") {
                        our_clq = arguments
                            .length > 0 &&
                            arguments[0] !==
                            undefined &&
                            clq_pattern.test(
                                arguments[0]) ?
                            arguments[0] : '';
                    }

                    LANG = LANG.toUpperCase()
                    console.log(
                        "DEBUG: Starting AutoQC with LANG: " +
                        LANG)
                    var line_limit = 0
                    var max_cps = 0
                    var normal_cps = 0

                    switch (LANG) {

                    case "AR":
                        line_limit = 42
                        normal_cps = 20
                        max_cps = 26
                        break;

                    case "CN":
                        line_limit = 16
                        normal_cps = 9
                        max_cps = 11.7
                        break;

                    case "RU":
                        line_limit = 39
                        normal_cps = 17
                        max_cps = 22.1
                        break;

                    case "DE":
                    case "GR":
                    case "FR":
                    case "PT":
                    case "EN":
                    default:
                        line_limit = 42
                        normal_cps = 17
                        max_cps = 22.1
                    }

                    if(typeof our_clq !==
                        "object") {
                        if(!our_clq || !
                            clq_pattern.test(
                                our_clq)) {
                            alert(
                                "You must be in a started, saved Originator task!"
                            );
                            return null
                        }

                        if(!clq_pattern.test(
                                our_clq)) {
                            alert("The CLQ is invalid: " +
                                our_clq +
                                "\n" +
                                "Please report me to the developer."
                            );
                            return null
                        }
                    }

                    var shotChanges = localStorage
                        .getItem("shotChanges:" +
                            our_clq)

                    try {
                        shotChanges = shotChanges
                            .split(
                                ",");
                        console.log(
                            "DEBUG: Shot changes validated."
                        )
                    }
                    catch (e) {
                        var shotChanges =
                            undefined;
                        console.log(
                            "DEBUG: No shot changes found, which is ok if our_clq is object: " +
                            (typeof our_clq)
                        )
                    }

                    var hasSafeBox = document
                        .getElementsByClassName(
                            "marketing-border")[
                            0] ?
                        true : false

                    try {
                        var userIp = document
                            .getElementsByClassName(
                                "Watermark")[0]
                            .innerHTML;
                        var userName = document
                            .getElementsByClassName(
                                "username")[0]
                            .textContent;

                    }
                    catch (e) {
                        var userIp =
                            "LOCAL ITERATION"
                    }

                    var reportHtml =
                        `<head><meta charset="utf-8">
                        <script>
                        Window.autoQC_safe_meta = METADATATOKEN
                        </script>
            <script>var prevScrollpos = window.pageYOffset;
            window.onscroll = function() {
              var currentScrollPos = window.pageYOffset;
              if (prevScrollpos > currentScrollPos) {
                document.getElementById("navbar").style.top = "0";
              } else {
                document.getElementById("navbar").style.top = "-50px";
              }
              prevScrollpos = currentScrollPos;
            }</script>
                            <script>var z=function(q) {
                var s=document.getElementsByClassName(q);
                for(x of s) {
                    x.className===q ? (x.className=q+" of0"): (x.setAttribute("class", q))
                }
            }

            ;
            </script><style>body {
                background-color: #212121
            }

            #navbar {
              background-color: #333;
              position: fixed; 
              top: 0; 
              width: 100%;
              transition: top 0.5s;

            }

            #navbar a {
              float: left;
              display: block;
              color: white;
              text-align: center;
              padding: 5px;
              text-decoration: none;
            }

            #navbar a:hover {
              background-color: #ddd;
              color: black;
            }

            #background{
                position:fixed;
                z-index:-999;
                background:#212121;
                display:block
                height:100vh; 
                width:100vh;
                color:grey; 
            }

            .bg-text
            {
                font-family: Netflix-Sans;
                pointer-events: none;
                color:lightgrey;
                text-align: center;
                opacity: 0.06;
                font-size:80px;
                transform:rotate(320deg);
                -webkit-transform:rotate(320deg);
                position: relative;
                overflow: visible;
                user-select: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            }

            .of0 {
                visibility: hidden;
                color: #000!important;
            }

            .username {
               float:left;
            }

            .ipAddress {
               float:right; 
            }

            .cSpace {
                color: #00fa00;
                visibility: visible;
            }

            .StyledTextEditor {
                font-family: Netflix-Sans;
                line-height: 1.3;
                margin: 2px;
                white-space: nowrap;
                overflow: hidden;
                font-variant-ligatures: none;
                position: relative;
                pointer-events: none
            }

            .StyledTextEditor .ltr {
                unicode-bidi: embed;
                direction: ltr
            }

            .TimedTextEvent {
                font-family: Netflix-Sans;
                font-size: 1.3rem;
                font-weight: 400;
                line-height: 2rem;
                margin-top: .5rem;
                display: -webkit-box;
                display: -moz-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: box;
                display: flex;
                -webkit-box-orient: vertical;
                -moz-box-orient: vertical;
                -o-box-orient: vertical;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;
                border: 1px solid transparent;
                -webkit-transition: height 250ms ease, border 150ms ease;
                -moz-transition: height 250ms ease, border 150ms ease;
                -o-transition: height 250ms ease, border 150ms ease;
                -ms-transition: height 250ms ease, border 150ms ease;
                transition: height 250ms ease, border 150ms ease
            }

            .TimedTextEvent .details {
                padding-top: .5rem;
                padding-left: 1rem;
                padding-right: 1rem;
                display: -webkit-box;
                display: -moz-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: box;
                display: flex;
                -webkit-box-orient: horizontal;
                -moz-box-orient: horizontal;
                -o-box-orient: horizontal;
                -webkit-flex-direction: row;
                -ms-flex-direction: row;
                flex-direction: row
            }

            .TimedTextEvent .details .timing {
                -webkit-flex-shrink: 0;
                flex-shrink: 0;
                display: -webkit-box;
                display: -moz-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: box;
                display: flex;
                -webkit-box-orient: vertical;
                -moz-box-orient: vertical;
                -o-box-orient: vertical;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;
                width: 8rem
            }

            #titleinfo {
            color: #fffff0;
            font-weight: bolder;
            font-style: normal;
            font-family: Roboto, Netflix-Sans;
            font-size: 150%;
            margin-left: 30px;
            margin-right: 20px;
            position: relative; top: 7px; left: -5px;
            width: 580px;
            flex-shrink: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            }



            .issue {
                font-size: 16;
                vertical-align: middle;
                font-family: Netflix-Sans;
                position: relative;
                top: -1px
            }

            .TimedTextEvent .details .timing .TimeCode {
                color: rgba(255, 255, 255, .54);
                padding: 0 .5rem;
                border-radius: 1rem;
                white-space: nowrap
            }

            .TimedTextEvent .details .content {
                -webkit-box-flex: 1;
                -moz-box-flex: 1;
                -o-box-flex: 1;
                -ms-box-flex: 1;
                box-flex: 1;
                -webkit-flex-grow: 1;
                flex-grow: 1;
                display: -webkit-box;
                display: -moz-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: box;
                display: flex;
                -webkit-box-orient: vertical;
                -moz-box-orient: vertical;
                -o-box-orient: vertical;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;
                padding-left: 2rem;
                padding-bottom: .5rem;
                width: 24rem
            }

            .TimedTextEvent .details .content .header {
                display: -webkit-box;
                display: -moz-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: box;
                display: flex;
                -webkit-box-orient: horizontal;
                -moz-box-orient: horizontal;
                -o-box-orient: horizontal;
                -webkit-flex-direction: row;
                -ms-flex-direction: row;
                flex-direction: row
            }

            .TimedTextEvent .details .content .header .index {
                color: rgba(255, 255, 255, .66)
            }

            .TimedTextEvent .details .content .header .duration {
                color: rgba(255, 255, 255, .54);
                margin-left: auto;
                border-radius: 1rem
            }

            .TimedTextEvent .details .content .StyledTextEditor {
                color: rgba(255, 255, 255, .87);
                min-height: 3.2rem;
                margin-top: .3rem
            }

            img {
                display: table-cell;
                vertical-align: middle
            }

            #logonetflix {
                margin-left: 12px;
            }

            .TimedTextEvent .footer {
                height: .5rem;
                border-bottom: 2px solid rgba(0, 0, 0, .77);
                margin-left: 1rem;
                margin-right: 1rem
            }

            .outline {
                color: #000;
                position: relative;
                left: 350%;
            }

            button {
                background-color: black;
                color: #39ff1a;
                opacity: 0.5;
            }

            i {
                font-style: italic!important;
                font-family: serif!important
            }

            #feedback {
                height: 0;
                width: 65px;
                position: fixed;
                right: 0;
                top: 50%;
                z-index: 1000;
                transform: rotate(-90deg);
                -webkit-transform: rotate(-90deg);
                -moz-transform: rotate(-90deg);
                -o-transform: rotate(-90deg)
            }

            #feedback a {
                display: block;
                background: #06c;
                height: 15px;
                width: 165px;
                padding: 8px 16px;
                color: #fff;
                font-family: Arial, sans-serif;
                font-size: 17px;
                font-weight: 700;
                text-decoration: none;
                border-bottom: solid 1px #333;
                border-left: solid 1px #333;
                border-right: solid 1px #fff
            }

            #feedback a:hover {
                background: #ccc
            }

            </style><body style="width:70%;height:100%">
            <div id="navbar">
              <a href="https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements"><img id="logonetflix" width="auto" height="32" src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" title="Netflix TTSG Quality Compliance Initiative"></a>
              <span id="titleinfo" title="TITLEINFOTOKEN">TITLEINFOTOKEN</span>
            </div>
            <div id="background">
            <p class="bg-text" style="top: 0px; left: 100px;">WATERMARKPLACEHOLDER<br>NETFLIX CONFIDENTIAL</p>
            <p class="bg-text" style="top: -100px; left: 540px;">NETFLIX CONFIDENTIAL<br>WATERMARKPLACEHOLDER</p>
                </div>

                <div id="stick" style="position:relative;left:750px;"><button type="button" class="f" onclick="alert(Window.autoQC_safe_meta)">🛈</button><button type="button" class="f" onclick="z(\'cSpace\')" title="Highlight whitespace">🟩</button><button title="Display minor issues" type="button" class="f" onclick="z(\'minor_issue\') ">⚠️</button><button title="Display major issues" type="button" class="f" onclick="z(\'major_issue\')">🚫</button><button title="Shot-change suggestions" type="button" onclick="z(\'shot_change_issue\') ">🎞</button>DLFIXSRTTOKEN<span style="position: relative; top: 3px; left: 165px; font-family: monospace; color: #fdfdf2; opacity: 0.33;">Linguist: LINGUISTNAME</div>`

                    if(document.location.href
                        .includes(
                            "originator.backlot.netflix.com"
                        )) {
                        var lsJson = localStorage[
                            "clq:origination:" +
                            our_clq]
                        if(!lsJson) {
                            alert("Timed text events not found in localStorage\nfor CLQ: " +
                                our_clq +
                                "\n" +
                                "If the CLQ is correct and" +
                                "\n" +
                                "\"Save to local storage\" is enabled in Settings," +
                                "\n" +
                                "save the task and try again."
                            );

                            return null
                        }

                        var json_obj = JSON.parse(
                            lsJson)
                        var src = json_obj[
                            "events"]
                        var fps_ = json_obj[
                            "meta"]["fps"];
                        var fps = fps_.split("_")[
                            1] / 100
                        qcMeta.fps = fps
                        qcMeta.fps_ = fps_
                    }
                    else if(outOfTheBox) {
                        var fps = qcSavedMeta.fps
                        var fps_ = qcSavedMeta
                            .fps_

                    }
                    else if(typeof our_clq ==
                        "object") {
                        var srt_fps = prompt(
                            "What FPS does this SRT file likely have?\n2397, 2398, 2400, 2500, 2997 are the most likely"
                        )
                        if(srt_fps.length < 4) {
                            var fps = 24.00;
                            var fps_ = "FPS_2400"
                        }
                        else {
                            var fps_ = "FPS_" + (
                                srt_fps
                                .replace(
                                    /[^\d]/g,
                                    "")
                                .replace(
                                    /(^....)(.+$)/,
                                    "$1"))
                            var fps = fps_.split(
                                "_")[1] / 100
                        }
                        alert("Continuing with " +
                            fps_ +
                            " and real fps set to " +
                            fps)

                    }

                    var majTotal = 0
                    var minTotal = 0
                    var scTotal = 0
                    var evTotal = 0
                    var afTotal = 0
                    if(typeof our_clq !==
                        "object") {
                        var proposed_fps = prompt(
                            "Framerate set to: " +
                            fps +
                            " fps.\nEnter custom FPS or press Enter to keep current"
                        );

                        if(proposed_fps) {
                            var int_fps =
                                proposed_fps
                                .substring(0, 2);
                            var decimal_fps =
                                proposed_fps
                                .substring(2,
                                    proposed_fps
                                    .length);
                            fps_ = "FPS" + "_" +
                                int_fps +
                                decimal_fps
                            fps = (int_fps + "." +
                                    decimal_fps) *
                                1;
                            alert("Continuing with " +
                                fps_ +
                                " and real fps set to " +
                                fps);
                        }
                    }

                    var frms = 1000 / fps
                    if(document.location.href
                        .includes(
                            "originator.backlot.netflix.com"
                        )) {
                        var titleInfo = document
                            .getElementsByClassName(
                                "cpe-page-menu-label"
                            )[0]
                            .innerText.replace(
                                / "/g, ' “')
                            .replace(/"/g, "”")
                        qcMeta.titleinfo =
                            titleInfo
                    }
                    else if(typeof our_clq !==
                        "object") {
                        var titleInfo =
                            qcSavedMeta.titleinfo
                    }
                    else {
                        var titleInfo = document
                            .location.href
                            .replace(
                                /(.+?)([^/]+$)/g,
                                "$2")
                    }

                    function srtName(suffix = "",
                        extension =
                        ".srt") {
                        var s = titleInfo
                        var srtName = (s.replace(
                                    /[ ]/g,
                                    '_')
                                .replace(
                                    /[^a-z0-9_]/gi,
                                    '') + "_" +
                                suffix +
                                extension
                            ) //This gets rid of all punctuation, spaces and non-English letters
                            .trim() //resulting in a name like 14545_El_Burrito_A_Breaking_Fat_Movie_FPS_2500.srt
                        if(!srtName) srtName =
                            our_clq +
                            "_" + suffix +
                            extension
                        return srtName
                    }

                    function frames2tcf(
                        framenumber,
                        framerate =
                        fps
                    ) { //frames to 00:01:02:24 format
                        var seconds_float =
                            framenumber /
                            framerate
                        var seconds_int = Math
                            .floor(
                                seconds_float)
                        var seconds_frac =
                            seconds_float -
                            seconds_int
                        var frames = Math.round(
                            seconds_frac *
                            framerate) + ''
                        var date = new Date(0);
                        date.setSeconds(
                            seconds_int);
                        try {
                            var timeString = date
                                .toISOString()
                                .substr(11, 8)
                            if(frames.length == 1)
                                frames = "0" +
                                frames
                            var timecodef =
                                timeString +
                                ":" + frames
                        }
                        catch (e) {
                            var timecodef =
                                'ERROR'
                        }
                        return timecodef
                    }

                    function frames2timecode(
                        frames
                    ) { //frames to 00:01:02,000 format
                        var milliseconds = Math
                            .round(
                                frames * frms)
                        var srt_timecode =
                            TimeConversion(
                                milliseconds)
                        return srt_timecode
                    }

                    function array2srt(
                        events_object) {
                        var ordered_events = []
                        for(var id in
                                events_object) {
                            try {
                                var type_fn =
                                    events_object[
                                        id][
                                        "type"
                                    ]
                                if(type_fn ===
                                    "fn") {
                                    events_object[
                                            id][
                                            "txt"
                                        ] +=
                                        "<b></b>";
                                }
                            }
                            catch (e) {}
                            ordered_events.push([
                                events_object[
                                    id]
                                ["start"],
                                events_object[
                                    id]
                                ["end"],
                                events_object[
                                    id]
                                ["txt"],
                                events_object[
                                    id]
                                [
                                    "styles"
                                ],
                                events_object[
                                    id]
                                ["rgn"]
                            ])
                        }
                        ordered_events.sort(
                            function (a,
                                b) {
                                return a[0] -
                                    b[0];
                            }
                        ); //Array sorted by in_cues, sequentially
                        var index = 0
                        var srt_txt = ''
                        for(event of
                            ordered_events) {
                            index++
                            var start =
                                frames2timecode(
                                    event[0])
                            var end =
                                frames2timecode(
                                    event[
                                        1])
                            var content = event[2]
                            try {
                                if(typeof event[3]
                                    [0][
                                        "type"
                                    ] !==
                                    "undefined") {
                                    if(event[3][0]
                                        [
                                            "type"
                                        ] ==
                                        "italic"
                                    ) {
                                        content =
                                            italicize(
                                                content,
                                                event[
                                                    3
                                                ]
                                            )
                                    }
                                }
                            }
                            catch (e) {}

                            try {
                                if(typeof event[
                                        4] !==
                                    "undefined") {
                                    if(event[4] ==
                                        "top") {
                                        content =
                                            "{\\an8}" +
                                            content
                                    }
                                }
                            }
                            catch (e) {}

                            try {
                                if(event[
                                        "type"] ==
                                    "fn") {
                                    content +=
                                        '<b></b>'
                                }
                            }
                            catch (e) {}
                            //                      console.log(content)
                            var current_event =
                                index +
                                "\n" + start +
                                " --> " +
                                end +
                                "\n" + content +
                                "\n"
                            srt_txt +=
                                current_event +
                                "\n"
                        }
                        return srt_txt
                    }

                    function parsed2srt(
                        parsedSRT) {
                        var nbspRegex =
                            new RegExp(String
                                .fromCharCode(
                                    160), "gi");

                        var srt_txt = ''
                        for(let event of
                                parsedSRT) {
                            var cleanTxt = event[
                                    "text"]
                                .replace(
                                    nbspRegex, " "
                                ).trim()
                                .replace(
                                    /[ ][ ]/gi,
                                    " ")
                            if(cleanTxt.length <
                                2) {
                                cleanTxt = "\n"
                            }
                            let text_event =
                                event["id"] +
                                "\n" + event[
                                    "start"] +
                                " --> " + event[
                                    "end"] +
                                "\n" + cleanTxt +
                                "\n\n"
                            srt_txt += text_event
                        }
                        return srt_txt
                    }

                    function italicize(content,
                        italics_array) {
                        var position_offset = 0
                        for(var italic of
                                italics_array) {
                            var position_from =
                                italic[
                                    "from"] +
                                position_offset;
                            position_offset += 3
                            content = [content
                                .slice(0,
                                    position_from
                                ),
                                "<i>", content
                                .slice(
                                    position_from
                                )
                            ].join('')
                            var position_to =
                                italic[
                                    "to"] +
                                position_offset;
                            position_offset += 4
                            content = [content
                                .slice(0,
                                    position_to
                                ),
                                "</i>",
                                content
                                .slice(
                                    position_to
                                )
                            ].join('')
                        }
                        return content
                    }

                    function download(filename,
                        text) {
                        var element = document
                            .createElement('a');
                        element.setAttribute(
                            'href',
                            'data:text/plain;charset=utf-8,' +
                            encodeURIComponent(
                                text));
                        element.setAttribute(
                            'download',
                            filename);
                        element.style.display =
                            'none';
                        document.body.appendChild(
                            element);
                        element.click();
                        document.body.removeChild(
                            element);
                    }

                    function TimeConversion(
                        duration) {
                        let time = parseDuration(
                            duration)
                        return formatTimeHMSS(
                            time)
                    }

                    function parseDuration(
                        duration) {
                        let remain = duration
                        let hours = Math.floor(
                            remain / (
                                1000 * 60 * 60
                            ))
                        remain = remain % (1000 *
                            60 * 60)
                        let minutes = Math.floor(
                            remain /
                            (
                                1000 * 60))
                        remain = remain % (1000 *
                            60)
                        let seconds = Math.floor(
                            remain /
                            (
                                1000))
                        remain = remain % (1000)
                        let milliseconds = remain
                        return {
                            hours,
                            minutes,
                            seconds,
                            milliseconds
                        }
                    }

                    function formatTimeHMSS(o) {
                        let hours = o.hours
                            .toString()
                        if(hours.length === 1)
                            hours =
                            '0' + hours
                        let minutes = o.minutes
                            .toString()
                        if(minutes.length === 1)
                            minutes =
                            '0' + minutes
                        let seconds = o.seconds
                            .toString()
                        if(seconds.length === 1)
                            seconds =
                            '0' + seconds
                        let milliseconds = o
                            .milliseconds
                            .toString()
                        if(milliseconds.length ===
                            1)
                            milliseconds = '00' +
                            milliseconds
                        if(milliseconds.length ===
                            2)
                            milliseconds = '0' +
                            milliseconds
                        return hours + ":" +
                            minutes +
                            ":" +
                            //Example: 00:01:02,999 -- note that the SRT spec calls for a comma, not a period!
                            seconds + "," +
                            milliseconds
                    }

                    function isBetween(distance,
                        a, b) {
                        var left_lim = a;
                        var right_lim = b;
                        if(a > b) {
                            left_lim = b;
                            right_lim = a
                        }
                        if(distance >= left_lim &&
                            distance <= right_lim
                        ) {
                            return true
                        }
                        return false
                    }

                    function validateScE(distance,
                        framesE, sc, distance2) {
                        var violation = false
                        var V = {}
                        var css_cs1 =
                            '<span class="shot_change_issue">';
                        var css_cs2 = '</span>';
                        var oldTcf = frames2tcf(
                            framesE)
                        var scTcf = frames2tcf(sc)
                        var distanceNext =
                            distance2
                        if(isBetween(distance, 5,
                                11))

                        {
                            var moveTo = 12 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move out-cue right ' +
                                moveTo +
                                ' to +12 frames after shot change<br><font style="color: #7DFDFE; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(isBetween(distance, -1,
                                4)) {
                            var moveTo = -2 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move out-cue left ' +
                                moveTo +
                                ' to -2 frames before shot change<br><font style="color: #7DFDFE; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }
                        if(isBetween(distance, -3,
                                -7)) {
                            var moveTo = -2 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move out-cue right ' +
                                moveTo +
                                ' to -2 before shot change<br><font style="color: #7DFDFE; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(distanceNext > 2 &&
                            distanceNext < 12 &&
                            distanceNext <= Math
                            .abs(
                                distance)
                        ) //fixes nasty, nasty situation!
                        {
                            var moveTo =
                                distanceNext - 2
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move out-cue right ' +
                                moveTo +
                                ' to reduce frame gap from ' +
                                distanceNext +
                                ' to 2.<br><font style="color: #7DFDFE; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(cpsFixable) {
                            var moveTo =
                                framesToFixCPS
                            var newFramesE =
                                framesE +
                                framesToFixCPS
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ? "+" +
                                moveTo : moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '📖 Move out-cue right ' +
                                moveTo +
                                ' to reduce CPS to 17.<br><font style="color: #7DDDFF; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                            cpsFixable = false
                        }

                        if(cpsAttemptable) {
                            var moveTo =
                                framesToFixCPS
                            var newFramesE =
                                framesE +
                                framesToFixCPS
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ? "+" +
                                moveTo : moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            cpsAttemptable = false
                            violation =
                                '📖 Move out-cue right ' +
                                moveTo +
                                ' to reduce CPS to ' +
                                bestWorstCPS +
                                '.<br><font style="color: #7DDDFF; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                            cpsAttemptable = false
                        }

                        if(Math.abs(
                                distanceNext) <
                            2) {
                            var moveTo = (2 + Math
                                .abs(
                                    distanceNext
                                )) * (-1)
                            var newFramesE =
                                framesE + moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move out-cue ' +
                                moveTo +
                                ' to -2 before next subtitle event<br><font style="color: #7DFDFE; font-family: monospace">[OUT-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(violation) {
                            scTotal++
                            afTotal++
                            V = {
                                violation: css_cs1 +
                                    violation +
                                    css_cs2,
                                start: undefined,
                                end: frames2timecode(
                                    newFramesE
                                )
                            }
                            return V;
                        }
                        return false
                    }

                    function moveToSigned(
                        moveTo) {
                        var frames = " frames"
                        if(Math.abs(moveTo) ==
                            1) {
                            var frames = " frame"
                        }
                        if(moveTo <= 0) {
                            return moveTo + frames
                        }
                        else {
                            return '+' + moveTo +
                                frames
                        }
                    }

                    function validateScS(distance,
                        framesE, sc) {
                        var violation = false
                        var V = {}
                        var css_cs1 =
                            '<span class="shot_change_issue">';
                        var css_cs2 = '</span>';
                        var oldTcf = frames2tcf(
                            framesE)
                        var scTcf = frames2tcf(sc)

                        if(isBetween(distance, 1,
                                10)) {
                            var moveTo = 0 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move in-cue left ' +
                                moveTo +
                                ' to snap it to shot change<br><font style="color: #7FFFD4; font-family: monospace">[IN-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(isBetween(distance, 11,
                                11)) {
                            var moveTo = 1
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move in-cue right ' +
                                moveTo +
                                ' to put 12 frames after shot change<br><font style="color: #7FFFD4; font-family: monospace">[IN-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(isBetween(distance, 10,
                                10)) {
                            var moveTo = 2
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move in-cue right ' +
                                moveTo +
                                ' to +12 frames after shot change<br><font style="color: #7FFFD4; font-family: monospace">[IN-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(isBetween(distance, -
                                11, -5)) {
                            var moveTo = -12 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move in-cue left ' +
                                moveTo +
                                ' to -12 frames before shot change<br><font style="color: #7FFFD4; font-family: monospace">[IN-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(isBetween(distance, -4,
                                -1)) {
                            var moveTo = 0 -
                                distance
                            var newFramesE =
                                framesE +
                                moveTo
                            var newTcf =
                                frames2tcf(
                                    newFramesE)
                            var intTo = (moveTo >
                                    0) ?
                                "+" + moveTo :
                                moveTo;
                            moveTo = moveToSigned(
                                moveTo)
                            violation =
                                '🎞 Move in-cue right ' +
                                moveTo +
                                ' to snap it to shot change<br><font style="color: #7FFFD4; font-family: monospace">[IN-CUE: ' +
                                oldTcf + ' ' +
                                intTo +
                                ' = ' + newTcf +
                                ']</font>'
                        }

                        if(violation) {
                            scTotal++
                            afTotal++
                            V = {
                                violation: css_cs1 +
                                    violation +
                                    css_cs2,
                                start: frames2timecode(
                                    newFramesE
                                ),
                                end: undefined
                            }
                            return V
                        }
                        return false

                    }

                    function getNextShotchange(
                        frame) {
                        if(!shotChanges) {
                            return false
                        }
                        else {
                            var smallestDist =
                                Number
                                .POSITIVE_INFINITY

                            var bestCandidate = 0
                            for(let shotChange of
                                    shotChanges) {
                                var distance =
                                    shotChange -
                                    frame
                                if(distance <
                                    smallestDist &&
                                    shotChange >=
                                    frame) {
                                    smallestDist =
                                        distance
                                    bestCandidate
                                        =
                                        shotChange *
                                        1
                                }
                            }

                            return bestCandidate
                        }
                    }

                    //returns distance in frames from a given frame to the nearest shot change
                    function getNearestShotchange(
                        frame) {
                        if(!shotChanges) {
                            return false
                        }
                        else {
                            var smallestDist =
                                Number
                                .POSITIVE_INFINITY

                            var bestCandidate = 0
                            for(let shotChange of
                                    shotChanges) {
                                var distance =
                                    Math.abs(
                                        frame -
                                        shotChange
                                    )
                                if(distance <
                                    smallestDist
                                ) {
                                    smallestDist =
                                        distance
                                    bestCandidate
                                        =
                                        shotChange *
                                        1
                                }
                            }

                            return bestCandidate
                        }
                    }

                    function leftFillNum(num,
                        targetLength) {
                        return num.toString()
                            .padStart(
                                targetLength, 0);
                    }

                    if(src && !outOfTheBox) {
                        console.log(
                            "DEBUG: In Originator, working with json_src"
                        )
                        var SRT = array2srt(src)
                        SRT = parseSRT(SRT)
                    }
                    else if(typeof our_clq !==
                        "object" && outOfTheBox) {
                        console.log(
                            "DEBUG: In AutoQC, working with encoded fixed"
                        )
                        var SRT =
                            decodeURIComponent(
                                document
                                .getElementById(
                                    "FixedTaskSRT"
                                ).href)
                            .replace(
                                "data:text/plain;charset=utf-8,",
                                "")
                        SRT = parseSRT(SRT)
                    }
                    else if(typeof our_clq ==
                        "object") {
                        console.log(
                            "DEBUG: In SRT file, working with document body"
                        )
                        var SRT = our_clq.join(
                            "\n").trim()
                        SRT = parseSRT(SRT)
                    }

                    var fSRT = SRT
                    var issues = []
                    var events_detected = 0

                    for(var i = 0; i < SRT
                        .length; i++) {
                        var end_current = SRT[i][
                            "end"
                        ]
                        if(typeof (SRT[i + 1]) !==
                            "undefined") {
                            var start_next = SRT[
                                i + 1][
                                "start"
                            ]
                        }
                        else {
                            var start_next =
                                23976023976
                        }
                        var distance = Math.round(
                            (
                                start_next -
                                end_current) *
                            fps)
                        SRT[i]["frames_to_next"] =
                            distance
                    }
                    for(event of SRT) {
                        var start_time = event[
                            "start"]
                        var end_time = event[
                            "end"]
                        var delta = Math.round((
                                end_time -
                                start_time) *
                            1000) / 1000
                        var delta_fps = Math
                            .floor(delta) + ":" +
                            Math.round((delta -
                                    Math.floor(
                                        delta)) *
                                fps)
                        var start_frames = Math
                            .round(
                                start_time *
                                fps)
                        var end_frames = Math
                            .round(
                                end_time * fps)
                        var start_tcf =
                            frames2tcf(
                                start_frames)
                        var end_tcf = frames2tcf(
                            end_frames)
                        var id = event["id"]
                        var srtId = id - 1;
                        var distanceNextEvent =
                            event[
                                "frames_to_next"]
                        var _id = leftFillNum(id,
                            4)
                        var eventIssue = []
                        var eventTxt = event[
                            "text"]
                        var bareTxt = eventTxt
                            .replace(/\n/g, "‣")
                            .replace(
                                /<(|\/)(i|b)>/g,
                                "").replace(
                                /\{.an.\}/g, "")
                        var totalLength = bareTxt
                            .length - 1
                        var cps = (Math.round((
                                totalLength /
                                delta) *
                            1000)) / 1000
                        var duration_for_normal_cps =
                            (Math.round((
                                totalLength /
                                normal_cps
                            ) * 1000)) / 1000
                        var framesToFixCPS = Math
                            .floor(((((duration_for_normal_cps -
                                            delta
                                        ) *
                                        1000
                                    ) *
                                    fps) /
                                1000) + 1)
                        var round_int_cps = Math
                            .floor(cps + 1);
                        var html_cps = ''

                        var eventFixedTxt = event[
                            "text"]
                        var eventOriginalTxt =
                            event[
                                "text"]
                        var eventIsFn = (eventTxt
                            .indexOf(
                                "<b></b>") !==
                            -1)
                        var eventIsFnInCaps =
                            eventIsFn && (LANG !==
                                'CN') && (eventTxt
                                .toUpperCase()
                                .trim() ===
                                eventTxt.trim())

                        var scS =
                            getNearestShotchange(
                                start_frames)

                        var scE =
                            getNearestShotchange(
                                end_frames)

                        var scN =
                            getNextShotchange(
                                end_frames)

                        var scND = scN -
                            end_frames

                        var scSD = start_frames -
                            scS
                        var scED = end_frames -
                            scE
                        var cpsFixable = false
                        var cpsAttemptable = false
                        var bestWorstCPS = false

                        if(cps > normal_cps &&
                            cps < max_cps &&
                            scND -
                            framesToFixCPS > 11 &&
                            distanceNextEvent -
                            framesToFixCPS > 11 &&
                            framesToFixCPS < 12 &&
                            !eventIsFnInCaps) {
                            cpsFixable = true
                            //var log = "EVENT: "+id+"\nCPS: "+cps+"\tDuration: "+delta_fps+"\nTAR: //"+normal_cps+".00\tWant_dur: "+duration_for_normal_cps+
                            //"\nEnd_frame: "+end_frames+"\nNex_ev in: "+distanceNextEvent+"\nNex_sc in: "
                            //+scND+"\nADD_FRAM: "+framesToFixCPS+"\nTotal length: "
                            //+totalLength+"\nEND_TIMECODE_1: "+frames2tcf(end_frames+framesToFixCPS)+"\nEND_TIMECODE_2: "+
                            //frames2tcf(Math.round((start_time + duration_for_normal_cps)*fps))
                        }

                        if(cps >= max_cps &&
                            scND - 12 > 11 &&
                            distanceNextEvent -
                            12 > 11 && !
                            eventIsFnInCaps) {
                            cpsAttemptable = true
                            framesToFixCPS = 12
                            var plusDelta = 12 /
                                fps
                            bestWorstCPS = Math
                                .round((totalLength /
                                    (delta +
                                        plusDelta
                                    ) *
                                    1000)) / 1000
                        }

                        var scStcf = frames2tcf(
                            scS)
                        var scEtcf = frames2tcf(
                            scE)
                        var violS = validateScS(
                            scSD,
                            start_frames, scS)
                        var violE = validateScE(
                            scED,
                            end_frames, scE,
                            distanceNextEvent,
                            cps)

                        if(violS) {
                            eventIssue.push(violS[
                                "violation"
                            ])
                            fSRT[srtId]["start"] =
                                violS[
                                    "start"];
                        }
                        else {
                            fSRT[srtId]["start"] =
                                frames2timecode(
                                    Math
                                    .round(fSRT[
                                            srtId]
                                        [
                                            "start"
                                        ] * fps))
                        }

                        if(violE) {
                            eventIssue.push(violE[
                                "violation"
                            ])
                            fSRT[srtId]["end"] =
                                violE[
                                    "end"];
                        }
                        else {
                            fSRT[srtId]["end"] =
                                frames2timecode(
                                    Math
                                    .round(fSRT[
                                            srtId]
                                        [
                                            "end"
                                        ] * fps))
                        }

                        if(eventTxt.indexOf(
                                "<b></b>") !==
                            -1) {
                            eventIsFn = true;

                            _id +=
                                '<span class="outline" style="color: purple; position: relative; top: 0px; left: 137px;">🅵🅽</span>'
                        }
                        eventTxt = eventTxt
                            .replace(
                                /(<([^>]+)>)/ig,
                                "");
                        eventTxt = eventTxt
                            .replace(
                                /{.an.}/ig, "");
                        if(eventTxt.indexOf(
                                "\n") !== -
                            1 &&
                            eventTxt.indexOf(
                                "\n-") == -
                            1 &&
                            eventTxt.replace("\n",
                                " ")
                            .length <=
                            line_limit && !
                            eventIsFnInCaps && !
                            hasSafeBox) {
                            eventIssue.push(
                                "<span class=\"major_issue\">🚫 Can fit on one line (" +
                                line_limit +
                                " for " +
                                LANG + ")")
                            majTotal++
                            eventFixedTxt =
                                eventFixedTxt
                                .replace(/\n/g,
                                    " ")
                            eventFixedTxt =
                                eventFixedTxt
                                .replace(/ /gi,
                                    " ").replace(
                                    /[ ][ ]/g, ' '
                                );
                            afTotal++
                        }

                        if(eventTxt.indexOf(
                                "...") !== -
                            1) {
                            eventIssue.push(
                                "<span class=\"minor_issue\">⚠️ Legacy ellipsis detected, replace with U+2026: …"
                            );
                            minTotal++
                            eventFixedTxt =
                                eventFixedTxt
                                .replace(
                                    /\.\.\./g, "…"
                                )
                            afTotal++
                        }

                        if(eventTxt.indexOf(
                                "'") !== -1 ||
                            eventTxt.indexOf(
                                '"') !== -1) {
                            switch (LANG) {
                            case "EN":
                                eventIssue.push(
                                    "<span class=\"minor_issue\">⚠️ Smart quotes recommended for EN: <b>“   ”   ’</b>"
                                );
                                minTotal++
                                eventFixedTxt =
                                    eventFixedTxt
                                    .replace(
                                        /"( |\n|$)/g,
                                        "”$1")
                                eventFixedTxt =
                                    eventFixedTxt
                                    .replace(/"/g,
                                        "“")
                                eventFixedTxt =
                                    eventFixedTxt
                                    .replace(/'/g,
                                        "’")
                                afTotal++
                                break;

                            case "RU":
                                eventIssue.push(
                                    "<span class=\"minor_issue\">⚠️ Proper Russian uses chevrons: <b>« »</b>"
                                );
                                minTotal++
                                eventFixedTxt =
                                    eventFixedTxt
                                    .replace(
                                        /"( |\n|$)/g,
                                        "»$1")
                                eventFixedTxt =
                                    eventFixedTxt
                                    .replace(/"/g,
                                        "«")
                                afTotal++
                                break;
                            }

                        }

                        if(eventTxt.indexOf(
                                "!?") !== -
                            1) {

                            eventIssue.push(
                                "<span class=\"minor_issue\">⚠️ Unconventional punctuation detected. Did you mean to use '?!'"
                            )
                            minTotal++
                            eventFixedTxt =
                                eventFixedTxt
                                .replace(
                                    /[!][?]/g,
                                    "?!")
                            afTotal++
                        }

                        if(eventTxt.replace(
                                /\.\.\./g, "…")
                            .search(
                                /(([,.:])(!?([^\d\s\.])))/
                            ) !== -1) {
                            eventIssue.push(
                                "<span class=\"minor_issue\">⚠️ No space after a punctuation mark. Is this deliberate?"
                            )
                            minTotal++
                            eventFixedTxt =
                                eventFixedTxt
                                .replace(
                                    /(([,.:])(!?([^\d\s\.])))/gi,
                                    "$2 $4")
                                .replace(
                                    /\. \./gi,
                                    "..")
                            afTotal++
                        }

                        if(eventTxt.indexOf(
                                " - ") !== -
                            1) {

                            eventIssue.push(
                                "<span class=\"minor_issue\">⚠️ Instead of hyphen, consider en or em dash: – or —"
                            )
                            minTotal++
                        }

                        var eventSpecial = false

                        var hasSpace = /\s$|^\s/;
                        var eventTxt_lines =
                            eventTxt
                            .split("\n");
                        var nPos = eventTxt
                            .lastIndexOf(
                                "\n");
                        var hasSpaceIssue =
                            nPos && (
                                typeof eventTxt[
                                    nPos + 1] ==
                                "undefined")
                        var overLineLimit = false

                        var hasDoubleSpace =
                            eventTxt
                            .replace("\n",
                                "")
                            .split(/\s\s/)
                            .length - 1
                        var hasThreeLines =
                            typeof eventTxt_lines[
                                2] !== "undefined"

                        for(var line of
                                eventTxt_lines) {
                            hasSpaceIssue = (
                                hasSpace
                                .test(line) ||
                                hasSpaceIssue)
                            if(line.length >
                                line_limit) {
                                eventSpecial =
                                    line
                                overLineLimit =
                                    true
                            }
                        }

                        if(hasDoubleSpace) {
                            eventIssue.push(
                                "<span class=\"minor_issue>\"<span class=\"minor_issue\">⚠️ Double spaces detected, replace with single space</span>"
                            );
                            minTotal++
                        }

                        if(hasThreeLines) {
                            eventIssue.push(
                                "<span class=\"major_issue\">🚫 Three lines detected in this event"
                            );
                            majTotal++
                        }

                        if(hasSpaceIssue) {
                            if(eventTxt.length >
                                1) {
                                eventIssue.push(
                                    "<span class=\"minor_issue\">⚠️ One of the lines begins or ends with whitespace"
                                );
                                try {

                                    eventFixedTxt
                                        =
                                        eventFixedTxt
                                        .replace(
                                            /( |)\n( |)/,
                                            "‣")
                                        .replace(
                                            /[ ]{2,}/gi,
                                            " ")
                                        .trim()
                                        .replace(
                                            "‣",
                                            "\n")
                                    eventFixedTxt
                                        =
                                        eventFixedTxt
                                        .replace(
                                            ' <b></b>',
                                            '<b></b>'
                                        )
                                    eventFixedTxt
                                        =
                                        eventFixedTxt
                                        .replace(
                                            /( )(<(|\/)i>)(\n)/g,
                                            "$2$4"
                                        )
                                    eventFixedTxt
                                        =
                                        eventFixedTxt
                                        .replace(
                                            '<i></i>',
                                            '')
                                    afTotal++
                                }
                                catch (e) {
                                    eventFixedTxt
                                        =
                                        eventFixedTxt
                                        .replace(
                                            /( |)\n( |)/,
                                            "×")
                                        .replace(
                                            / \s+/gi,
                                            " ")
                                        .trim()
                                        .replace(
                                            "×",
                                            "\n")
                                    afTotal++
                                }
                            }
                            else {
                                eventIssue.push(
                                    "<span class=\"major_issue\">🚫 Empty event detected!"
                                );
                                majTotal++
                                eventSpecial =
                                    "<span style='color:red;'>&lt;text cannot be empty&gt;</span>"
                            }

                        }

                        if(overLineLimit) {
                            eventIssue.push(
                                "<span class=\"major_issue\">🚫 Line over max limit of " +
                                line_limit +
                                " for " + LANG
                            )
                            majTotal++
                            eventSpecial = [
                                eventSpecial
                                .slice(0,
                                    line_limit
                                ),
                                "<span style='color: red; text-overflow: fade;'>",
                                eventSpecial
                                .slice(
                                    line_limit
                                )
                            ].join('')
                        }

                        if(delta * delta > 49) {
                            eventIssue.push(
                                "<span class=\"major_issue\">🚫 Maximum duration exceeded for current FPS!"
                            );
                            majTotal++
                        }

                        // var halfLength = totalLength - Contrary to official statement,
                        // ( eventTxt.replace(/[ ]/g, '') Originator does not count
                        // .replace(/[^a-z0-9]/gi Western punctuation and spaces
                        // , '').length); as 0.5 characters for CPS.*/
                        //
                        // totalLength += (halfLength/(-2))

                        if(cps > normal_cps &&
                            cps <
                            max_cps) {
                            html_cps =
                                '<div><span style="color: gold;">&nbsp;&nbsp;&emsp;' +
                                round_int_cps +
                                ' c/s</span></div>'
                        }
                        else if(cps > (max_cps)) {
                            eventIssue.push(
                                "<span class=\"major_issue\">🚫 Reading speed above maximum! Either truncate text or extend timings!"
                            )
                            majTotal++
                            html_cps =
                                '<div><span style="color:red;">&nbsp;&nbsp;&emsp;' +
                                round_int_cps +
                                ' c/s</span></div>'
                        }
                        else {
                            html_cps =
                                '<div><span style="color:silver;">&nbsp;&nbsp;&emsp;' +
                                round_int_cps +
                                ' c/s</span></div>'
                        }

                        var dur_tcf = frames2tcf(
                                delta *
                                fps)
                            .substr(6)

                        var eventLines = eventTxt
                            .trim().split(
                                "\n")
                        if(typeof eventIssue !==
                            "undefined" &&
                            eventIssue.length > 0
                        ) {
                            events_detected++;
                            var log_event = (
                                    start_tcf +
                                    " " +
                                    eventTxt_lines[
                                        0]
                                    .slice(0,
                                        line_limit
                                    )
                                    .padEnd(
                                        line_limit +
                                        4, " ") +
                                    _id
                                )
                                .padEnd(
                                    line_limit +
                                    10,
                                    " ")
                            if(typeof eventTxt_lines[
                                    1] !==
                                "undefined") {
                                log_event +=
                                    "\n" +
                                    end_tcf +
                                    " " +
                                    eventTxt_lines[
                                        1]
                                    .padEnd(
                                        line_limit +
                                        8, " ")
                            }
                            else {
                                log_event +=
                                    "\n" +
                                    end_tcf +
                                    " " + " "
                                    .padEnd(
                                        line_limit +
                                        6,
                                        " ")
                            }
                            console.log('%c' +
                                log_event,
                                'background: #12343b; color: #66ff00'
                            )
                            console.log((+_id +
                                    "\n" +
                                    start_tcf +
                                    "\n" +
                                    end_tcf +
                                    "\n" +
                                    eventTxt)
                                .padEnd(50),
                                'background: #222; color: #bada55'
                            );
                            console.log(('%c' +
                                    eventIssue
                                    .join(
                                        "\n"))
                                .padEnd(50),
                                'background: #FFF; color: #FF0000; font-style: italic; border:solid 1px #000;'
                            )
                            console.log("┉"
                                .repeat(63))

                            var issue = {
                                id: _id,
                                issues: eventIssue,
                                content: eventTxt,
                                contentO: eventOriginalTxt,
                                start_tcf: start_tcf,
                                end_tcf: end_tcf,
                                start_frames: start_frames,
                                end_frames: end_frames,
                                start_time: start_time,
                                end_time: end_time,
                                duration: delta,
                                cps: cps,
                                html_cps: html_cps,
                                dur_tcf: dur_tcf,
                                special: eventSpecial
                            }

                            htmlize(issue)
                            if(eventFixedTxt !==
                                eventOriginalTxt
                            ) {
                                fSRT[srtId][
                                        "text"
                                    ] =
                                    eventFixedTxt
                            }
                        }
                    }
                    if(!events_detected) {
                        console.log('%c' +
                            "No issues detected",
                            'background: #12343b; color: #66ff00'
                        )
                    }

                    function htmlize(issue) {
                        try {
                            var original = issue
                                .contentO
                                .replace(
                                    '<b></b>', '')
                                .replace(
                                    /{.an.}/g, '')
                            var lines = original
                        }
                        catch (e) {
                            var lines = issue
                                .content;
                        }
                        lines = lines.replace(
                            /\n/g, '⏎');
                        lines = lines.replace(
                            /\s/g,
                            "<span class='cSpace'>⎵</span>"
                        );
                        lines = lines.replace(
                            /⏎/g,
                            "<span class='cSpace' style=\"color: #00fa00;\">⏎</span>\n"
                        );
                        lines = lines.split("\n");

                        if(issue.special) {
                            var check_length =
                                lines[0]
                                .length;
                            lines[0] = issue
                                .special
                            if(check_length >
                                line_limit) {
                                var save_l0 =
                                    issue
                                    .special
                                    .substring(
                                        line_limit -
                                        1)
                                lines[0] = issue
                                    .special
                                    .substring(0,
                                        line_limit -
                                        1)
                                    .replace(
                                        /\s/g,
                                        "<span class='cSpace'>⎵</span>"
                                    ) +
                                    save_l0
                            }
                        }
                        var timedTextEvent =
                            '<div class="TimedTextEvent" style="width: 700px; max-width: 100%;">' +
                            '<div class="details">' +
                            '<div class="timing"><span class="TimeCode">' +
                            issue
                            .start_tcf +
                            '</span>' +
                            '<span class="TimeCode">' +
                            issue
                            .end_tcf +
                            '</span></div><div class="content"><div class="header">' +
                            '<span class="index">' +
                            issue
                            .id +
                            '</span>' + issue
                            .html_cps +
                            '<span class="duration"><span class="TimeCode">' +
                            issue.dur_tcf +
                            '</span></span>' +
                            '</div><div class="StyledTextEditor" dir="ltr" style="position:relative; top:-20px;">' +
                            '<pre><span>' + lines[
                                0];
                        if(typeof lines[1] ==
                            "undefined") {
                            lines[1] = ""
                        }

                        timedTextEvent +=
                            '</span><div><span>' +
                            lines[1] +
                            '</span></div>'
                        if(typeof lines[2] !==
                            "undefined") {
                            timedTextEvent +=
                                '<div><span style="color:red;">' +
                                lines[
                                    2] +
                                '</span></div></pre>'
                        }
                        else {
                            timedTextEvent +=
                                "</pre>"
                        }
                        for(var each_issue of
                                issue
                                .issues) {
                            var issueWithImg =
                                '<div style="vertical-align:middle;float:left;">' +
                                "<span class='issue'>" +
                                each_issue +
                                "</span></span></div>"
                            timedTextEvent +=
                                issueWithImg +
                                "<br />"
                        }

                        reportHtml +=
                            timedTextEvent +
                            "</div></div></div></div></div>"
                        evTotal++
                    }

                    var withSC = ''
                    if(shotChanges) {
                        withSC =
                            "_withShotChanges"
                    }
                    var fixesFilename = srtName(
                        "Fixes_" +
                        LANG + "_" + fps_ +
                        withSC)
                    var fixedSrtFull = parsed2srt(
                        fSRT)
                    fixedSrtFull = fixedSrtFull
                        .replace(/ <b><\/b>/g,
                            '<b></b>')
                    var suggestedFixesTxt =
                        '<a id="FixedTaskSRT" download="' +
                        fixesFilename +
                        '" href="data:text/plain;charset=utf-8,' +
                        encodeURIComponent(
                            fixedSrtFull) +
                        '"><button>✎</button></a>'

                    qcMeta.results = {
                        totalEventsAffected: evTotal,
                        majorIssuesFound: majTotal,
                        minorIssuesFound: minTotal,
                        shotChangeViolations_found: scTotal,
                        autoFixesDone: afTotal

                    }

                    function getUnnamed() {
                        function n(n) {
                            for(let e = n.length -
                                    1; e >
                                0; e--) {
                                let i = Math
                                    .floor(Math
                                        .random() *
                                        (e + 1));
                                [n[e], n[i]] = [n[
                                    i], n[e]]
                            }
                        }
                        var e = ["Beaver",
                            "Koala",
                            "Chipmunk",
                            "Goat",
                            "Duckling",
                            "Cheetah",
                            "Platypus",
                            "Eagle",
                            "Mongoose",
                            "Butterfly"
                        ];
                        n(e);
                        var i = ["An Intrepid",
                            "A Meek",
                            "A Feisty",
                            "A Lazy", "A Sly",
                            "An Unperturbed",
                            "An Amused",
                            "A Rabid",
                            "A Very",
                            "A Really"
                        ];
                        n(i);
                        var t = [" Little ",
                            " Humongous ",
                            " Tiny ",
                            " Vain ",
                            " Finicky ",
                            " Cunning ",
                            " Exotic ",
                            " Weary ",
                            " Opinionated ",
                            " Conniving "
                        ];
                        return n(t), i[7] + t[7] +
                            e[7]
                    }

                    localStorage.removeItem(
                        "shotChanges:" +
                        qcMeta.clq)

                    var qcMetaStr = "`" + JSON
                        .stringify(qcMeta, null,
                            2) + "`"

                    if(typeof userName ==
                        "undefined") {
                        userName = getUnnamed()
                    }

                    reportHtml = reportHtml
                        .replace(
                            "DLFIXSRTTOKEN",
                            suggestedFixesTxt)
                        .replace(
                            /WATERMARKPLACEHOLDER/g,
                            userIp).replace(
                            "TITLEINFOTOKEN",
                            titleInfo).replace(
                            "TITLEINFOTOKEN",
                            titleInfo).replace(
                            "LINGUISTNAME",
                            userName).replace(
                            "METADATATOKEN",
                            qcMetaStr)

                    console.log(qcMeta.results)
                    download(srtName(
                            "Auto_QC_Log_" +
                            LANG + '_' +
                            fps_ +
                            withSC, ".html"),
                        reportHtml)

                }

                return runAutoQC
            })));

            (function (global, factory) {
                typeof exports === 'object' &&
                    typeof module !==
                    'undefined' ?
                    module.exports = factory() :
                    typeof define === 'function' && define
                    .amd ?
                    define(
                        factory) :
                    (global.parseSRT = factory());
            }(this, (function () {
                'use strict';

                function toSeconds(time) {
                    var t = time.split(':');

                    try {
                        var s = t[2].split(',');

                        if(s.length === 1) {
                            s = t[2].split('.');
                        }

                        return parseFloat(t[0],
                                10) *
                            3600 +
                            parseFloat(t[1], 10) *
                            60 +
                            parseFloat(s[
                                0], 10) +
                            parseFloat(s[1],
                                10) / 1000;
                    }
                    catch (e) {
                        return 0;
                    }
                }

                function nextNonEmptyLine(
                    linesArray,
                    position) {
                    var idx = position;

                    while(!linesArray[idx]) {
                        idx++;
                    }

                    return idx;
                }

                function lastNonEmptyLine(
                    linesArray) {
                    var idx = linesArray.length -
                        1;

                    while(idx >= 0 && !linesArray[
                            idx]) {
                        idx--;
                    }

                    return idx;
                }

                function parseSRT() {
                    var data = arguments.length >
                        0 &&
                        arguments[
                            0] !== undefined ?
                        arguments[
                            0] : '';

                    var subs = [];
                    var lines = data.split(
                        /(?:\r\n|\r|\n)/gm);
                    var endIdx = lastNonEmptyLine(
                            lines) +
                        1;
                    var idx = 0;
                    var time = void 0;
                    var text = void 0;
                    var sub = void 0;

                    for(var i = 0; i <
                        endIdx; i++) {
                        sub = {};
                        text = [];

                        i = nextNonEmptyLine(
                            lines, i);
                        sub.id = parseInt(lines[
                            i++], 10);

                        time = lines[i++].split(
                            /[\t ]*-->[\t ]*/);

                        sub.start = toSeconds(
                            time[0]);

                        idx = time[1].indexOf(
                            ' ');
                        if(idx !== -1) {
                            time[1] = time[1]
                                .substr(0,
                                    idx);
                        }
                        sub.end = toSeconds(time[
                            1]);

                        while(i < endIdx && lines[
                                i]) {
                            text.push(lines[i++]);
                        }

                        sub.text = text.join(
                                '\\N')
                            .replace(/{.an8}/,
                                'POSToppyTAG')
                            .replace(
                                /\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi,
                                '');

                        sub.text = sub.text
                            .replace(/</g,
                                '&lt;')
                            .replace(/>/g,
                                '&gt;');

                        sub.text = sub.text
                            .replace(
                                /&lt;(\/?(font|b|u|i|s))((\s+(\w|\w[\w\-]*\w)(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)(\/?)&gt;/gi,
                                '<$1$3$7>');
                        sub.text = sub.text
                            .replace(
                                /\\N/gi, "\n");
                        sub.text = sub.text
                            .replace(
                                'POSToppyTAG',
                                '{\\an8}')

                        subs.push(sub);
                    }
                    return subs;
                }

                return parseSRT;

            })));

            setShotChanges()
            defer(runAutoQC)
        })();
