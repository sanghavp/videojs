let player = videojs("sea-video", {
  userActions: {
    hotkeys: true,
  },
  playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  responsive: true,
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
//   controlBar: {
//     volumePanel: {inline: false}
// },
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

// Add setting button
let btnSetting = player.controlBar.addChild("button");
let btnSettingDom = btnSetting.el();
btnSettingDom.classList.add("btn-setting")
btnSettingDom.innerHTML = `
  <i class="fas fa-cog btn-setting-icon"></i>
  <div class="toggle-fill">
    <div class="fill-item play-options">
      <i class="far fa-play-circle" style="font-size=14px; margin-right: 3px"></i>
      <span>Play back speed</span>
      <i class="fas fa-angle-right" style="position: absolute; right: 8px"></i>
    </div>
    <div class="fill-item quality-options">
      <i class="far fa-play-circle" style="font-size=14px; margin-right: 3px"></i>
      <span>Quality</span>
      <i class="fas fa-angle-right" style="position: absolute; right: 8px"></i>
    </div>
  </div>
  <div class="playback-list vjs-playback-rate list"></div>
  <div class="quality-list list"></div>
  `;
let toggleFillElm = document.querySelector(".toggle-fill");
let listElms = document.querySelectorAll(".list");
const playbackRateElm = document.querySelector(".vjs-playback-rate");
const playbackOptions = document.querySelector(".play-options");
const qualityOptions = document.querySelector(".quality-options");
let btnSettingIcon = document.querySelector(".btn-setting-icon");
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
    btnSettingIcon.style.rotate = "30deg";
    btnSettingIcon.style.transition = "0.25s";
    playBackList.style.visibility = "hidden";
    qualityList.style.visibility = "hidden";
  } else {
    toggleFillElm.style.visibility = "hidden";
    btnSettingIcon.style.rotate = "0deg";
    // btnSettingIcon.style.transition = "0.25s"
  }
}
//call to func on time update
player.on("timeupdate", function () {
  let currentTime = document.querySelector(".vjs-remaining-time");
  let pictureInPicture = document.querySelector(
    ".vjs-picture-in-picture-control"
  );
  pictureInPicture.setAttribute("title", "Xem dưới dạng thu nhỏ");

  currentTime.innerHTML = `${convertTime(player.currentTime())}/${convertTime(
    this.duration()
  )}`;
});

// play back rate settings
// const playbackMenu = player.controlBar.addChild("PlaybackRateMenuButton");
const playBackList = document.querySelector(".playback-list");
const playbackLevels = document.querySelectorAll(
  ".vjs-playback-rate .vjs-menu-content  .vjs-menu-item"
);
var plblHTML = "";
let playbackRatetList = [];
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
    // playbackLevel.setAttribute("role", "menuitemcheckbox");

    if (playbackLevel.innerText.split(",").length == 2) {
      // playBackList.style.background = "#ccc";
      document.getElementById(`${key}`).checked = true;
      document.querySelector(`.a${key}a`).style.background = "#ccc";
    }
  });
}
getPlayBackRate();

// On change value of playback rate
var rad = document.list1.playbackValue;
var prev = null;
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
    // console.log(this.value)
  });
}

// quality settings

const qualityList = document.querySelector(".quality-list");
let qualityLevels = player.qualityLevels();
console.log("qualityLevels.length", qualityLevels.length);
// Listen to change events for when the player selects a new quality level

let counter = 0;
qualityLevels.on("change", function () {
  console.log("Quality Level changed!", qualityLevels.selectedIndex);
  // console.log("New level:", qualityLevels[qualityLevels.selectedIndex]);
  qlHTML = "";

  if(counter === 0) {
    counter++;
    showEnabledLevels();
  }
});

// show what levels are enabled
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
// showEnabledLevels();
// Onchange quality
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

player.on("loadedmetadata", function () {
  // settime
  let currentTime = document.querySelector(".vjs-remaining-time");
  let pictureInPicture = document.querySelector(
    ".vjs-picture-in-picture-control"
  );

  pictureInPicture.setAttribute("title", "Xem dưới dạng thu nhỏ");
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
      enableQualityLevel(parseInt(this.value))
      qualityList.style.visibility = "hidden";
      qlHTML = "";

    });
  }
  currentTime.innerHTML = `${convertTime(player.currentTime())}/${convertTime(
    this.duration()
  )}`;

  // // enable buttons
  // document.getElementById("setMinLevel").disabled = false;
  // document.getElementById("setMaxLevel").disabled = false;

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
