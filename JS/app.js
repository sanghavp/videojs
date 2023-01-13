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
  plugins: {
    vastClient: {
      adTagUrl: "http://127.0.0.1:5500/assets/vastXml.xml",
      playAdAlways: true,
      adCancelTimeout: 5000,
      adsEnabled: true,
    },
  }
  //   controlBar: {
  //     volumePanel: {inline: false}
  // },
});
console.log(player)

//call to func on time update
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

// On change value of playback rate
let rad = document.list1.playbackValue;
let prev = null;
for (var i = 0; i < rad.length; i++) {
  rad[i].addEventListener("change", function () {
    prev
      ? (document.querySelector(`.a${prev.value}a`).style.background =
          "transparent")
      : null;
    if (this !== prev) {
      prev = this;
    }
    document.querySelector(`.a${this.value}a`).style.background = "#ccc";
    playBackList.style.visibility = "hidden";
    playbackLevels.forEach((playbackLevel, key) => {
      if (key == this.value) {
        player.ready(function () {
          this.playbackRate(playbackRatetList[key]);
        });
      } else {
        playbackLevel.classList.remove("vjs-selected");
        playbackLevel.setAttribute("aria-checked", false);
      }
    });
  });
}

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

// // set min quality level
// document.getElementById("setMinLevel").addEventListener("click", () => {
//   console.log("Set Min quality level");
//   enableQualityLevel(0);
//   console.log("qualityLevels.selectedIndex: ", qualityLevels.selectedIndex);
//   qlHTML = "";
//   // showEnabledLevels();
// });

// // set max quality level
// document.getElementById("setMaxLevel").addEventListener("click", () => {
//   console.log("Set Max quality level");
//   enableQualityLevel(qualityLevels.length - 1);
//   console.log("qualityLevels.selectedIndex: ", qualityLevels.selectedIndex);
//   qlHTML = "";
//   // showEnabledLevels();
// });

player.on("timeupdate", function () {
  console.log("Playing now: ", player.videoHeight());
});

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
