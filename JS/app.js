
let player = videojs("sea-video", {
  userActions: {
    hotkeys: true,
  },
  playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  responsive: false,
  aspectRatio: "16:9",
  html5: {
    vhs: {
      overrideNative: true,
      limitRenditionByPlayerDimensions: false,
      smoothQualityChange: false,
    },
    nativeCaptions: false,
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
  controls: true,
  // plugins: {
  //   vastClient: {
  //     adTagUrl: "./assets/VPAID.xml",
  //     playAdAlways: true,
  //     adCancelTimeout: 5000,
  //     adsEnabled: true,
  //   },
  // }
  //   controlBar: {
  //     volumePanel: {inline: false}
  // },
}
);
player.ready(function() {
  var options = {
    debug: true,
    prerollTimeout: 50000,
    timeout: 50000,
    // adServerUrl: 'http://your.adserver.com/vast'
  };

  this.ads(options);
});







// player.vastClient({adTagUrl: "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator="})
var xml = {};
  

  //utility Function
  function decapitalize(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
  }


  xml.strToXMLDoc = function strToXMLDoc(stringContainingXMLSource){
    //IE 8
    if(typeof window.DOMParser === 'undefined'){
      var xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
      xmlDocument.async = false;
      xmlDocument.loadXML(stringContainingXMLSource);
      return xmlDocument;
    }
  
    return parseString(stringContainingXMLSource);
  
    function parseString(stringContainingXMLSource){
      var parser = new DOMParser();
      var parsedDocument;
  
      //Note: This try catch is to deal with the fact that on IE parser.parseFromString does throw an error but the rest of the browsers don't.
      try {
        parsedDocument = parser.parseFromString(stringContainingXMLSource, "application/xml");
  
        if(isParseError(parsedDocument) || !(typeof stringContainingXMLSource === 'string') || stringContainingXMLSource.length === 0){
          throw new Error();
        }
      }catch(e){
        throw new Error("xml.strToXMLDOC: Error parsing the string: '" + stringContainingXMLSource + "'");
      }
      console.log(parsedDocument)
      return parsedDocument;
    }
  
    function isParseError(parsedDocument) {
      try { // parser and parsererrorNS could be cached on startup for efficiency
        var parser = new DOMParser(),
          erroneousParse = parser.parseFromString('INVALID', 'text/xml'),
          parsererrorNS = erroneousParse.getElementsByTagName("parsererror")[0].namespaceURI;
  
        if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
          // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
          return parsedDocument.getElementsByTagName("parsererror").length > 0;
        }
  
        return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
      } catch (e) {
        //Note on IE parseString throws an error by itself and it will never reach this code. Because it will have failed before
      }
    }
  };
  
  xml.parseText = function parseText (sValue) {
    if (/^\s*$/.test(sValue)) { return null; }
    if (/^(?:true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
    if (isFinite(sValue)) { return parseFloat(sValue); }
    return sValue.trim();
  };
  
  xml.JXONTree = function JXONTree (oXMLParent) {
    var parseText = xml.parseText;
  
    //The document object is an especial object that it may miss some functions or attrs depending on the browser.
    //To prevent this problem with create the JXONTree using the root childNode which is a fully fleshed node on all supported
    //browsers.
    if(oXMLParent.documentElement){
      return new xml.JXONTree(oXMLParent.documentElement);
    }
  
    if (oXMLParent.hasChildNodes()) {
      var sCollectedTxt = "";
      for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
        oNode = oXMLParent.childNodes.item(nItem);
        /*jshint bitwise: false*/
        if ((oNode.nodeType - 1 | 1) === 3) { sCollectedTxt += oNode.nodeType === 3 ? oNode.nodeValue.trim() : oNode.nodeValue; }
        else if (oNode.nodeType === 1 && !oNode.prefix) {
          sProp = decapitalize(oNode.nodeName);
          vContent = new xml.JXONTree(oNode);
          if (this.hasOwnProperty(sProp)) {
            if (this[sProp].constructor !== Array) { this[sProp] = [this[sProp]]; }
            this[sProp].push(vContent);
          } else { this[sProp] = vContent; }
        }
      }
      if (sCollectedTxt) { this.keyValue = parseText(sCollectedTxt); }
    }
  
    //IE8 Stupid fix
    var hasAttr = typeof oXMLParent.hasAttributes === 'undefined'? oXMLParent.attributes.length > 0: oXMLParent.hasAttributes();
    if (hasAttr) {
      var oAttrib;
      for (var nAttrib = 0; nAttrib < oXMLParent.attributes.length; nAttrib++) {
        oAttrib = oXMLParent.attributes.item(nAttrib);
        this["@" + decapitalize(oAttrib.name)] = parseText(oAttrib.value.trim());
      }
    }
  };
  
  xml.JXONTree.prototype.attr = function(attr) {
    return this['@' + decapitalize(attr)];
  };
  
  xml.toJXONTree = function toJXONTree(xmlString){
    var xmlDoc = xml.strToXMLDoc(xmlString);
    return new xml.JXONTree(xmlDoc);
  };
  
  /**
   * Helper function to extract the keyvalue of a JXONTree obj
   *
   * @param xmlObj {JXONTree}
   * return the key value or undefined;
   */
  xml.keyValue = function getKeyValue(xmlObj) {
    if(xmlObj){
      return xmlObj.keyValue;
    }
    return undefined;
  };
  
  xml.attr = function getAttrValue(xmlObj, attr) {
    if(xmlObj) {
      return xmlObj['@' + decapitalize(attr)];
    }
    return undefined;
  };
  

const parseXML = (url) => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      let response = xml.toJXONTree(xhttp.response)
      console.log("xml.toJXONTree(xhttp.response)", "JSON.stringify(response)");
      if(!!response.ad &&!!response.ad.wrapper && (!!response.ad.wrapper.vASTAdTagURI || !!response.ad.wrapper.VASTAdTagURI)){
        parseXML(response.ad.wrapper.vASTAdTagURI.keyValue)
      }else {
        if(url.includes("doubleclick")){
          player.ima({adTagUrl: url})
        }else {
          player.vastClient({adTagUrl: url})
        }
        return response
      }
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
  // const response = xml.toJXONTree(url)
}

// parseXML("http://127.0.0.1:5500/assets/VPAID.xml")
parseXML("https://pubads.g.doubleclick.net/gampad/ads?iu=%2F21766723698%2Ftvc%2Ftvc640x360&description_url=http%3A%2F%2Fvideo.kenh14.vn%2F&tfcd=0&npa=0&sz=640x360&cust_params=brand%3DDisney%20Antman3&gdfp_req=1&output=xml_vast4&unviewed_position_start=1&env=vp&vpos=preroll&vpmute=0&vpa=click&type=js&vad_type=linear&channel=vastadp%2Bvpaidadp_html5&sdkv=h.3.556.1%2Fvpaid_adapter&osd=2&frm=2&vis=1&sdr=1&hl=vi&afvsz=200x200%2C250x250%2C300x250%2C336x280%2C450x50%2C468x60%2C480x70&is_amp=0&uach=WyJXaW5kb3dzIiwiMTUuMC4wIiwieDg2IiwiIiwiMTEwLjAuNTQ4MS43NyIsW10sZmFsc2UsbnVsbCwiNjQiLFtbIkNocm9taXVtIiwiMTEwLjAuNTQ4MS43NyJdLFsiTm90IEEoQnJhbmQiLCIyNC4wLjAuMCJdLFsiR29vZ2xlIENocm9tZSIsIjExMC4wLjU0ODEuNzciXV0sZmFsc2Vd&u_so=l&ctv=0&adsid=ChAIgP-snwYQnZi-l4vsibxEEjkAZytoyDeWmgcJBNH14NCPO0RajDXbH3q1_AUzFQJMSbnCi7cC0569OHieSU398FW2arwfjEaC6H8&jar=2023-02-14-08&sdki=445&ptt=20&adk=2695912222&sdk_apis=2%2C7%2C8&omid_p=Google1%2Fh.3.556.1&sid=05125E91-2411-487C-B9BF-5B1F1E51ADC6&nel=0&eid=44748969%2C44765701%2C44777649&ref=https%3A%2F%2Fimasdk.googleapis.com%2F&url=https%3A%2F%2Fvideo.kenh14.vn&dt=1676365951259&correlator=1099342028612051&scor=1200344605013566&ged=ve4_td0_tt0_pd0_la0_er0.0.154.300_vi0.0.394.700_vp100_eb24427")

//callto func on time update
player.on("timeupdate", function () {
  let currentTime = document.querySelector(".vjs-remaining-time");
  let pictureInPicture = document.querySelector(
    ".vjs-picture-in-picture-control"
  );
  pictureInPicture.setAttribute("title", "Xem dưới dạng thu nhỏ");
  pictureInPicture.style.marginLeft = pictureInPicture.offsetWidth
  pictureInPicture.style.marginRight = pictureInPicture.offsetWidth
  currentTime.innerHTML = `${convertTime(player.currentTime())}/${convertTime(
    this.duration()
  )}`;
});

// Add setting button
let btnSetting = player.controlBar.addChild("button");
let btnSettingDom = btnSetting.el();
btnSettingDom.classList.add("btn-setting");
btnSettingDom.innerHTML = `
  <i class="fas fa-cog btn-setting-icon"></i>
  <div class="toggle-fill">
    <div class="fill-item play-options">
      <i class="far fa-play-circle" style="font-size=14px; margin-right: 5px;"></i>
      <span>Playback speed</span>
      <i class="fas fa-angle-right" style="position: absolute; right: 8px"></i>
    </div>
    <div class="fill-item quality-options">
      <i class="fas fa-sliders-h" style="font-size=14px; margin-right: 5px;"></i>
      <span>Quality</span>
      <i class="fas fa-angle-right" style="position: absolute; right: 8px"></i>
    </div>
  </div>
  <div class="playback-list vjs-playback-rate list"></div>
  <div class="quality-list list"></div>
  `;

// Show hide setting options
const toggleFillElm = document.querySelector(".toggle-fill");
const listElms = document.querySelectorAll(".list");
const playbackRateElm = document.querySelector(".vjs-playback-rate");
const playbackOptions = document.querySelector(".play-options");
const qualityOptions = document.querySelector(".quality-options");
const btnSettingIcon = document.querySelector(".btn-setting-icon");
toggleFillElm.style.visibility = "hidden";
// Show playback list
playbackOptions.addEventListener("click", () => {
  toggleFill();
  playBackList.style.visibility = "visible";
});
// show quality list
qualityOptions.addEventListener("click", () => {
  toggleFill();
  qualityList.style.visibility = "visible";
});
btnSettingIcon.addEventListener("click", toggleFill);
function toggleFill() {
  if (toggleFillElm.style.visibility == "hidden") {
    toggleFillElm.style.visibility = "visible";
    btnSettingIcon.style.rotate = "40deg";
    btnSettingIcon.style.transition = "0.25s";
    playBackList.style.visibility = "hidden";
    qualityList.style.visibility = "hidden";
  } else {
    toggleFillElm.style.visibility = "hidden";
    btnSettingIcon.style.rotate = "0deg";
    // btnSettingIcon.style.transition = "0.25s"
  }
}

// play back rate settings
// const playbackMenu = player.controlBar.addChild("PlaybackRateMenuButton");
const playBackList = document.querySelector(".playback-list");
const playbackLevels = document.querySelectorAll(
  ".vjs-playback-rate .vjs-menu-content  .vjs-menu-item"
);
var plblHTML = "";
let playbackRatetList = [];
// generate playbackrate menu options
function getPlayBackRate() {
  playbackLevels.forEach((playbackLevel, key) => {
    const text = playbackLevel.innerText.split(",")[0];
    playbackRatetList.push(Number(text.split("x")[0]));
    plblHTML += `<div class="fill-item a${key}a">
    <label for="${key}" style="display: block; width: 100%; height: 100%; text-align: left" >${text}</label>
    <input type="radio" hidden id="${key}" name="playbackValue"  value="${key}"/>
  </div>`;
    document.querySelector(".playback-list").innerHTML = `<form name="list1">
      ${plblHTML}
    </form>`;
    if (playbackLevel.innerText.split(",").length == 2) {
      // playBackList.style.background = "#ccc";
      document.querySelector(`.a${key}a`).style.background = "#ccc";
    }
  });
}
getPlayBackRate();


// quality menu options inside setting button
const qualityList = document.querySelector(".quality-list");
let qualityLevels = player.qualityLevels();
console.log("qualityLevels.length", qualityLevels.length);
// generate first change
let counter = 0;
// Listen to change events for when the player selects a new quality level
qualityLevels.on("change", function () {
  console.log("Quality Level changed!", qualityLevels.selectedIndex);
  // console.log("New level:", qualityLevels[qualityLevels.selectedIndex]);
  qlHTML = "";
  if (counter === 0) {
    counter++;
    showEnabledLevels();
  }
});

// generate radio checkbox to select quality levels
qlHTML = "";
function showEnabledLevels() {
  for (let i = 0; i < qualityLevels.length; i++) {
    let qualityLevel = qualityLevels[i];
    qlHTML += `<div class="fill-item b${i}b">
    <label for="b${i}" style="display: block; width: 100%; height: 100%; text-align: left; " >${qualityLevel.height}p</label>
    <input type="radio" hidden id="b${i}" name="qualityValue"  value="${i}"/>
  </div>`;
    document.querySelector(
      ".quality-list"
    ).innerHTML = `<form name="list2" class="list2">
      ${qlHTML}
    </form>`;
  }
}

// enable quality level by index, set other levels to false
const enableQualityLevel = (level) => {
  for (let i = 0; i < qualityLevels.length; i++) {
    let qualityLevel = qualityLevels[i];
    qualityLevel.enabled = i === level ? true : false;
  }
  qualityLevels.selectedIndex_ = level;
  qualityLevels.trigger({ type: "change", selectedIndex: level });
};

//convert time in lib to hour
let convertTime = function (input) {
  let pad = function (input) {
    return input < 10 ? "0" + input : input;
  };
  // fps = typeof fps !== "undefined" ? fps : 24;
  return [
    pad(Math.floor((input % 3600) / 60)),
    pad(Math.floor(input % 60)),
  ].join(":");
};

// Add theater mode button
let btnTheaterMode = player.controlBar.addChild("button");
let btnTheaterModeDom = btnTheaterMode.el();
btnTheaterModeDom.classList.add("btn-theater");
btnTheaterModeDom.setAttribute("title", "Chế độ rạp chiếu phim");
btnTheaterModeDom.setAttribute("theater_mode", false);
btnTheaterModeDom.innerHTML = `
  <div class="rectangle"></div>
  `;
// theater mode handle
const playerDom = document.querySelector(".player");
const rightDom = document.querySelector(".right");
btnTheaterModeDom.addEventListener("click", () => {
  let theaterMode = btnTheaterModeDom.getAttribute("theater_mode");
  console.log(theaterMode);
  if (theaterMode == "false") {
    playerDom.style.width = "100vw";
    playerDom.style.zIndex = 1;
    playerDom.style.position = "absolute";
    playerDom.style.marginLeft = "-5em";
    player.aspectRatio("21:9");
    rightDom.style.marginTop = playerDom.offsetHeight;
    btnTheaterModeDom.setAttribute("theater_mode", true);
    btnTheaterModeDom.setAttribute("title", "Chế độ mặc định");
  } else {
    playerDom.style.width = "70%";
    player.aspectRatio("16:9");
    playerDom.style.position = "relative";
    playerDom.style.marginLeft = "0";
    rightDom.style.marginTop = 0;
    btnTheaterModeDom.setAttribute("theater_mode", false);
    btnTheaterModeDom.setAttribute("title", "Chế độ rạp chiếu phim");
  }
});

// On loaded meta data
player.on("loadedmetadata", function () {
  // set attribute for picture in picture
  let pictureInPicture = document.querySelector(
    ".vjs-picture-in-picture-control"
  );
  pictureInPicture.setAttribute("title", "Xem dưới dạng thu nhỏ");

  // On change select quatity video, replace backgound color
  var rad = document.list2.qualityValue;
  var prev = null;
  for (var i = 0; i < rad.length; i++) {
    rad[i].addEventListener("change", function () {
      prev
        ? (document.querySelector(`.b${prev.value}b`).style.background =
            "transparent")
        : null;
      if (this !== prev) {
        prev = this;
      }
      document.querySelector(`.b${this.value}b`).style.background = "#ccc";
      enableQualityLevel(parseInt(this.value));
      qualityList.style.visibility = "hidden";
      qlHTML = "";
    });
  }

  // settime as yt time format
  let currentTime = document.querySelector(".vjs-remaining-time");
  currentTime.innerHTML = `${convertTime(player.currentTime())}/${convertTime(
    this.duration()
  )}`;

  // track currently rendered segments change
  let tracks = player.textTracks();
  let segmentMetadataTrack;

  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].label === "segment-metadata") {
      segmentMetadataTrack = tracks[i];
    }
  }

  let previousPlaylist;

  if (segmentMetadataTrack) {
    segmentMetadataTrack.on("cuechange", function () {
      let activeCue = segmentMetadataTrack.activeCues[0];
      if (activeCue) {
        if (previousPlaylist !== activeCue.value.playlist) {
          console.log(
            "Switched from rendition " +
              previousPlaylist +
              " to rendition " +
              activeCue.value.playlist,
            activeCue.value.resolution.height
          );
        }
        previousPlaylist = activeCue.value.playlist;
      }
    });
  }

});



