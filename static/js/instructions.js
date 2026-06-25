var textSize_instruction = 20;
var textSize_instructionTitle = 40;

function makeInstructionStyleParagraphs(paragraphArray, firstParagraphTopMargin) {
  firstParagraphTopMargin = firstParagraphTopMargin === undefined ? 100 : firstParagraphTopMargin;
  return paragraphArray
    .map(function (p, index) {
      return (
        '<p class="experiment-prose-text" style="font-size:' +
        textSize_instruction +
        "px; " +
        (index === 0 ? "margin-top: " + firstParagraphTopMargin + "px;" : "margin-top: 10px;") +
        '">' +
        p +
        "</p>"
      );
    })
    .join("");
}

function wrapExperimentProsePage(innerHtml, firstParagraphTopMargin) {
  return (
    '<div class="experiment-prose-page"' +
    (firstParagraphTopMargin === 0 ? ' data-compact-top="true"' : "") +
    ">" +
    innerHtml +
    "</div>"
  );
}

function makeExperimentProseStimulus(paragraphArray, firstParagraphTopMargin) {
  return wrapExperimentProsePage(
    makeInstructionStyleParagraphs(paragraphArray, firstParagraphTopMargin)
  );
}

function withExperimentProsePageStyle(trial) {
  var userOnLoad = trial.on_load;
  var userOnFinish = trial.on_finish;
  trial.on_load = function () {
    document.documentElement.classList.add("experiment-prose-page-mode");
    if (typeof userOnLoad === "function") {
      userOnLoad.apply(this, arguments);
    }
  };
  trial.on_finish = function () {
    if (typeof userOnFinish === "function") {
      userOnFinish.apply(this, arguments);
    }
    document.documentElement.classList.remove("experiment-prose-page-mode");
  };
  return trial;
}

function getComprehensionQuestionsNotificationParagraphs(questionNum) {
  return [
    "Now we will ask you " + String(questionNum) + " questions based on these instructions.",
    "<b>If you answer all questions correctly, you can proceed to the task. If you get any wrong, you can either:</b>",
    "1) Repeat the questions you got wrong until all are correct.",
    "2) Repeat the instructions and the questions you got wrong until all are correct.",
    "Please proceed to the qeustions or return to the instructions to review again."
  ];
}

function makeComprehensionQuestionsNotificationTrial(questionNum, taskStage, options) {
  options = options || {};
  return withExperimentProsePageStyle({
    type: jsPsychHtmlButtonResponse,
    stimulus: makeExperimentProseStimulus(getComprehensionQuestionsNotificationParagraphs(questionNum)),
    choices: ["Proceed to questions", "Return to instructions"],
    data: {
      taskStage: taskStage,
      choiceTrials: 0,
    },
    on_finish: function (data) {
      if (typeof options.onChoice === "function") {
        options.onChoice(data.response);
      }
    },
  });
}

function wrapInstructionsTrialForReview(baseTrial, isReviewPass) {
  var wrapped = {
    type: baseTrial.type,
    pages: baseTrial.pages,
    button_label_next: baseTrial.button_label_next,
    button_label_previous: baseTrial.button_label_previous,
    show_clickable_nav: baseTrial.show_clickable_nav,
    show_page_number: baseTrial.show_page_number,
    allow_backward: baseTrial.allow_backward,
    allow_keys: baseTrial.allow_keys,
    data: baseTrial.data,
    on_start: function (trial) {
      trial.pages = baseTrial.pages.map(function (page) {
        return {
          content: page.content,
          minTime: isReviewPass() ? 0 : page.minTime,
        };
      });
      if (typeof baseTrial.on_start === "function") {
        baseTrial.on_start.call(this, trial);
      }
    },
    on_finish: function (data) {
      if (typeof baseTrial.on_finish === "function") {
        baseTrial.on_finish.call(this, data);
      }
    },
    on_load: baseTrial.on_load,
  };
  return wrapped;
}

function createComprehensionInstructionsEntryLoop(instructionsTimeline, questionNum, taskStagePrefix) {
  var returnToInstructions = false;
  var instructionPassCount = 0;

  var reviewAwareInstructions = wrapInstructionsTrialForReview(
    instructionsTimeline,
    function () {
      return instructionPassCount > 0;
    }
  );
  var baseOnFinish = reviewAwareInstructions.on_finish;
  reviewAwareInstructions.on_finish = function (data) {
    instructionPassCount += 1;
    if (typeof baseOnFinish === "function") {
      baseOnFinish.call(this, data);
    }
  };

  var notificationTrial = makeComprehensionQuestionsNotificationTrial(
    questionNum,
    taskStagePrefix + "Notification",
    {
      onChoice: function (responseIndex) {
        returnToInstructions = responseIndex === 1;
      },
    }
  );

  return {
    timeline: [reviewAwareInstructions, notificationTrial],
    loop_function: function () {
      return returnToInstructions;
    },
    on_timeline_start: function () {
      returnToInstructions = false;
    },
    data: {
      taskStage: taskStagePrefix + "InstructionsEntryLoop",
      choiceTrials: 0,
    },
  };
}

function getBdmPhaseStartNotificationParagraphs(p) {
  return [
    "Thanks for completing the first part of the task! You will now start the second part of the task (<b>" + String(p.bdmBlockCount) + " blocks</b> with bidding).",
    "You will visit all three rooms with different cues for you to bid for. We will let you know the room you are in and the cues you can bid for in each block.",
    "Press any key to start.",
  ];
}

function makeBdmPhaseStartNotificationTrial(p) {
  return withExperimentProsePageStyle({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: makeExperimentProseStimulus(getBdmPhaseStartNotificationParagraphs(p)),
    data: {
      taskStage: "bdmPhaseStartNotification",
      choiceTrials: 0,
    },
  });
}

function makeInstructionTitles() {
  return [
    "Introduction",
    "Basic Information",
    "Task Overview",
    "Cues Overview",
    "Cue 1: Exact Cue",
    "Cue 2: Rating Cue",
    "Cue 3: Machine Cue",
    "Cue 4: Blank Cue",
    "Trial Flow",
    "Stage 1: Start the Trial",
    "Stage 2: Select a Machine",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 3: Bid for Cues",
    "Stage 4: Get the Cues and Wait for your Ball",
    "Stage 5: Receive your Ball and its Coins",
    "Rooms",
    "Room 1: Basic Room",
    "Room 2: Time Budget Room",
    "Room 3: Learning Room",
    "Questions Notification",
  ];
}

// Gacha instruction media paths:
//   static/images/instructions/{category}/{name}.png  OR  static/images/instructions/{name}.png|.gif (flat cue images)
//   static/videos/instructions/{category}/{name}.mp4
var FLAT_INSTRUCTION_IMAGES = {
  "informativeCue/exactCue": true,
  "informativeCue/ratingCue": true,
  "informativeCue/machineCue": true,
  "nonInformativeCue/blankCue": true,
  "trialStage/startTrial": true,
  "trialStage/selectMachineRed": true,
  "trialStage/selectMachineBlue": true,
  "trialStage/selectMachineTwo": true,
  "trialStage/bidSampleBidBar": true,
  "trialStage/bidProbabilityChart": true,
  "trialStage/bidOutOfRange": true,
  "trialStage/bidResult": true,
};

function instructionMediaTag(type, category, name, maxHeight, maxWidth, id, extension) {
  maxHeight = maxHeight || "48vh";
  maxWidth = maxWidth || "75vw";
  id = id || "";
  extension = extension || "png";
  var styleString = 'style="max-height: ' + maxHeight + "; max-width: " + maxWidth + '; object-fit: contain;"';
  var idString = id ? 'id="' + id + '" ' : "";
  var mediaKey = category + "/" + name;
  var relativePath = FLAT_INSTRUCTION_IMAGES[mediaKey] ? name : mediaKey;

  if (type === "image") {
    return '<img src="static/images/instructions/' + relativePath + "." + extension + '" ' + styleString + ">";
  }
  if (type === "video") {
    return (
      '<div class="instruction-video-wrap">' +
      "<video class=\"instruction-video\" " +
      idString +
      'muted playsinline preload="metadata" ' +
      styleString +
      ' src="static/videos/instructions/' +
      relativePath +
      '.mp4"></video>' +
      '<div class="instruction-video-play-hint" aria-hidden="true">Click to play</div>' +
      "</div>"
    );
  }
  console.error("Unsupported media type: " + type);
  return "";
}

function instructionFlatImageRowWithOr(filenames, height, withBorder) {
  height = height || "28vh";
  var borderStyle = withBorder ? " border:1px solid #000; box-sizing:border-box;" : "";
  var html = '<div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:nowrap;">';
  filenames.forEach(function (name, i) {
    if (i > 0) {
      html += '<span style="font-size:' + textSize_instruction + 'px; font-weight:bold;">or</span>';
    }
    html += '<img src="static/images/instructions/' + name + '.png" style="height:' + height + '; width:auto; max-width:30vw; object-fit:contain;' + borderStyle + '">';
  });
  html += "</div>";
  return html;
}

function instructionStage4SyncVideoGrid() {
  var files = [
    "cueExactWaiting",
    "cueRatingWaiting",
    "cueMachineWaiting",
    "cueNonInformativeWaiting",
  ];
  var html =
    '<div class="instruction-stage4-video-grid" data-instruction-video-sync="true" ' +
    'style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;' +
    "width:min(96vw,1080px);height:54vh;margin:0 auto;\">";
  files.forEach(function (file) {
    html +=
      '<div class="instruction-stage4-video-cell" style="min-height:0;display:flex;align-items:center;' +
      'justify-content:center;background:#f8f8f8;border-radius:6px;overflow:hidden;">' +
      '<div class="instruction-video-wrap instruction-video-wrap-fill">' +
      '<video class="instruction-sync-video instruction-video" muted playsinline preload="metadata" ' +
      'style="width:100%;height:100%;object-fit:contain;" ' +
      'src="static/videos/instructions/stage4/' +
      file +
      '.mp4"></video>' +
      '<div class="instruction-video-play-hint" aria-hidden="true">Click to play</div></div></div>';
  });
  html += "</div>";
  return html;
}

function setupInstructionVideos(rootEl) {
  if (!rootEl) return;

  rootEl.querySelectorAll(".instruction-video-wrap").forEach(function (wrap) {
    if (wrap._instructionVideoSetup) return;
    wrap._instructionVideoSetup = true;

    var video = wrap.querySelector("video");
    if (!video) return;

    function syncPlayHint() {
      wrap.classList.toggle("is-playing", !video.paused && !video.ended);
      wrap.classList.toggle("is-ended", video.ended);
    }

    wrap.addEventListener("click", function () {
      if (video.ended) {
        video.currentTime = 0;
      }
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", syncPlayHint);
    video.addEventListener("pause", syncPlayHint);
    video.addEventListener("ended", syncPlayHint);
    syncPlayHint();
  });
}

function setupInstructionSyncedVideoGrid(rootEl, onGroupComplete) {
  var grid = rootEl.querySelector("[data-instruction-video-sync]");
  if (!grid) return;

  var videos = Array.from(grid.querySelectorAll("video"));
  if (videos.length < 2) return;

  var syncing = false;
  var groupFinished = false;
  var sessionActive = false;
  var sessionTimer = null;
  var syncDuration = null;

  function getVideoWrap(video) {
    return video ? video.closest(".instruction-video-wrap") : null;
  }

  function getSyncDuration() {
    if (syncDuration !== null) {
      return syncDuration;
    }
    var durations = videos
      .map(function (v) {
        return isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
      })
      .filter(function (d) {
        return d > 0;
      });
    if (durations.length === 0) {
      return null;
    }
    syncDuration = Math.max.apply(null, durations);
    return syncDuration;
  }

  function capTimeForVideo(video, time) {
    if (!isFinite(video.duration) || video.duration <= 0) {
      return time;
    }
    return Math.min(time, Math.max(0, video.duration - 0.05));
  }

  function holdVideoOnLastFrame(video) {
    if (!isFinite(video.duration) || video.duration <= 0) {
      return;
    }
    video._syncInternal = true;
    video.currentTime = Math.max(0, video.duration - 0.05);
    video.pause();
    video._syncInternal = false;
  }

  function clearSessionTimer() {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      sessionTimer = null;
    }
  }

  function updateWrapStates() {
    videos.forEach(function (video) {
      var wrap = getVideoWrap(video);
      if (!wrap) return;
      if (sessionActive && !groupFinished) {
        wrap.classList.add("is-playing");
        wrap.classList.remove("is-ended");
      } else if (groupFinished) {
        wrap.classList.remove("is-playing");
        wrap.classList.add("is-ended");
      }
    });
  }

  function markGroupComplete() {
    if (groupFinished) return;
    groupFinished = true;
    sessionActive = false;
    clearSessionTimer();
    grid.removeAttribute("data-sync-session-active");
    videos.forEach(function (v) {
      v.pause();
    });
    updateWrapStates();
    if (typeof onGroupComplete === "function") {
      onGroupComplete();
    }
    grid.dispatchEvent(new CustomEvent("instruction-sync-videos-complete", { bubbles: true }));
  }

  function startSessionTimer(startMediaTime) {
    clearSessionTimer();
    var duration = getSyncDuration();
    if (!duration) {
      return;
    }
    var startWall = performance.now();
    var startMedia = startMediaTime || 0;

    sessionTimer = setInterval(function () {
      if (!sessionActive || groupFinished) {
        clearSessionTimer();
        return;
      }

      var elapsed = (performance.now() - startWall) / 1000;
      var targetTime = Math.min(startMedia + elapsed, duration);

      videos.forEach(function (v) {
        var capped = capTimeForVideo(v, targetTime);
        if (isFinite(v.duration) && v.duration > 0 && capped >= v.duration - 0.06) {
          holdVideoOnLastFrame(v);
          return;
        }
        if (Math.abs(v.currentTime - capped) > 0.12) {
          v._syncInternal = true;
          v.currentTime = capped;
          v._syncInternal = false;
        }
        if (v.paused) {
          v.play().catch(function () {});
        }
      });

      if (targetTime >= duration - 0.05) {
        markGroupComplete();
      }
    }, 80);
  }

  function whenAllMetadataReady(callback) {
    var waiting = videos.some(function (v) {
      return !(isFinite(v.duration) && v.duration > 0);
    });
    if (!waiting) {
      callback();
      return;
    }
    videos.forEach(function (v) {
      if (isFinite(v.duration) && v.duration > 0) {
        return;
      }
      v.addEventListener(
        "loadedmetadata",
        function onMeta() {
          v.removeEventListener("loadedmetadata", onMeta);
          syncDuration = null;
          whenAllMetadataReady(callback);
        }
      );
    });
  }

  function startSyncedPlayback(leader) {
    if (syncing) return;
    syncing = true;

    whenAllMetadataReady(function () {
      var restart =
        groupFinished ||
        leader.ended ||
        (isFinite(leader.duration) && leader.currentTime >= Math.max(0, leader.duration - 0.05));
      var t = restart ? 0 : leader.currentTime;

      groupFinished = false;
      sessionActive = true;
      grid.setAttribute("data-sync-session-active", "true");
      updateWrapStates();

      videos.forEach(function (v) {
        v._syncInternal = true;
        v.currentTime = capTimeForVideo(v, t);
      });

      Promise.all(
        videos.map(function (v) {
          return v.play().catch(function () {});
        })
      ).finally(function () {
        videos.forEach(function (v) {
          v._syncInternal = false;
        });
        syncing = false;
        startSessionTimer(t);
      });
    });
  }

  videos.forEach(function (video) {
    video.addEventListener("loadedmetadata", function () {
      syncDuration = null;
    });

    video.addEventListener("play", function () {
      if (video._syncInternal) return;
      startSyncedPlayback(video);
    });

    video.addEventListener("seeking", function () {
      if (video._syncInternal || syncing || groupFinished || !sessionActive) return;
      var t = video.currentTime;
      videos.forEach(function (v) {
        if (v !== video) {
          v._syncInternal = true;
          v.currentTime = capTimeForVideo(v, t);
          v._syncInternal = false;
        }
      });
    });

    video.addEventListener("ended", function () {
      if (groupFinished) return;
      if (sessionActive) {
        holdVideoOnLastFrame(video);
        updateWrapStates();
        return;
      }
      markGroupComplete();
    });
  });
}

function createGachaInstructionTags(maxImageHeight, maxImageWidth, videoHeight, videoWidth) {
  imageTags = {};
  videoTags = {};

  var imageSpec = {
    informativeCue: ["exactCue", "ratingCue", "machineCue"],
    nonInformativeCue: ["blankCue"],
    trialStage: ["startTrial", "selectMachineRed", "selectMachineBlue", "selectMachineTwo", "bidSampleBidBar", "bidProbabilityChart", "bidOutOfRange", "bidResult"],
  };
  var videoSpec = {
    taskOverview: ["machine"],
    stage3: ["bidSampleSlider", "bidForCueHigherThanPrice", "bidForCueLowerThanPrice"],
    stage4: ["cueExactWaiting", "cueRatingWaiting", "cueMachineWaiting", "cueNonInformativeWaiting"],
    stage5: ["outcome"],
    rooms: ["basicRoom", "timeBudgetRoom", "learningRoom"],
  };

  Object.keys(imageSpec).forEach(function (category) {
    imageTags[category] = {};
    imageSpec[category].forEach(function (name) {
      imageTags[category][name] = instructionMediaTag("image", category, name, maxImageHeight, maxImageWidth);
    });
  });

  var selectMachinePreviewHeight = "28vh";
  var selectMachinePreviewWidth = "24vw";
  imageTags.trialStage.selectMachineRed = instructionMediaTag(
    "image", "trialStage", "selectMachineRed", selectMachinePreviewHeight, selectMachinePreviewWidth
  );
  imageTags.trialStage.selectMachineBlue = instructionMediaTag(
    "image", "trialStage", "selectMachineBlue", selectMachinePreviewHeight, selectMachinePreviewWidth
  );
  imageTags.trialStage.selectMachineTwo = instructionMediaTag(
    "image", "trialStage", "selectMachineTwo", selectMachinePreviewHeight, selectMachinePreviewWidth
  );
  imageTags.trialStage.selectMachine = imageTags.trialStage.selectMachineTwo;

  Object.keys(videoSpec).forEach(function (category) {
    videoTags[category] = {};
    videoSpec[category].forEach(function (name) {
      videoTags[category][name] = instructionMediaTag("video", category, name, videoHeight, videoWidth);
    });
  });

  var stage3BidVideoHeight = "58vh";
  var stage3BidVideoWidth = "94vw";
  videoTags.stage3.bidForCueHigherThanPrice = instructionMediaTag(
    "video", "stage3", "bidForCueHigherThanPrice", stage3BidVideoHeight, stage3BidVideoWidth
  );
  videoTags.stage3.bidForCueLowerThanPrice = instructionMediaTag(
    "video", "stage3", "bidForCueLowerThanPrice", stage3BidVideoHeight, stage3BidVideoWidth
  );

  videoTags.stage4.exactCue = videoTags.stage4.cueExactWaiting;
  videoTags.stage4.ratingCue = videoTags.stage4.cueRatingWaiting;
  videoTags.stage4.machineCue = videoTags.stage4.cueMachineWaiting;
  videoTags.stage4.blankCue = videoTags.stage4.cueNonInformativeWaiting;

  var roomVideoHeight = "58vh";
  var roomVideoWidth = "94vw";
  var roomVideoHeightCompact = "44vh";
  var roomVideoWidthCompact = "86vw";
  videoTags.rooms.basicRoom = instructionMediaTag(
    "video", "rooms", "basicRoom", roomVideoHeight, roomVideoWidth
  );
  videoTags.rooms.timeBudgetRoom = instructionMediaTag(
    "video", "rooms", "timeBudgetRoom", roomVideoHeightCompact, roomVideoWidthCompact
  );
  videoTags.rooms.learningRoom = instructionMediaTag(
    "video", "rooms", "learningRoom", roomVideoHeightCompact, roomVideoWidthCompact
  );

  return { imageTags: imageTags, videoTags: videoTags };
}

function makeStage3BdmInstructionPages(instructionTitles, p) {
  return [
    {
      title: instructionTitles[12],
      minTimeSec: 1,
      text: [
        `You will have the opportunity to <b>bid some of your coins</b> to increase your chance of getting the informative cue, or to increase your chance of getting the blank cue (whichever you prefer).`,
        `To do this, you will bid your coins by <b>dragging</b> the <b>triangular marker</b> on the <b>bid slider</b>.`,
        `Please see the images below as possible examples of the bid sliders for each type (Exact Cue, Rating Cue, or Machine Cue vs. Blank Cue).`,
        imageTags.trialStage.bidSampleBidBar,
      ],
    },
    {
      title: instructionTitles[13],
      minTimeSec: 1,
      text: [
        videoTags.stage3.bidSampleSlider,
        `On each trial, the marker will start at a <b>random position</b> on the bid slider. You will click and drag the marker to the location you want to bid. When you release the mouse, your bid will be submitted. You will have <b>${String(p.infobidchoiceduration / 1000)} seconds</b> to make your bid. If you do not bid within <b>${String(p.infobidchoiceduration / 1000)} seconds</b>, you will be asked to repeat the bidding after a short delay.`,
        `By making your bid, you will tell the computer two things:`,
        `1) Whether you prefer to receive the informative cue or the blank cue. We will refer to this as your preferred cue.`,
        `2) How many coins you are willing to pay to get your preferred cue.`,
        `Then, the computer will randomly determine the price of your preferred cue and reveal it to you. Finally, based on your bid and the price, the computer will get you <b>the best possible deal</b>.`,
      ],
    },
    {
      title: instructionTitles[14],
      minTimeSec: 1,
      text: [
        `Specifically, if your bid is <b>higher</b> than the price of your preferred cue, you <b>will pay the price and receive your preferred cue</b>. For example, suppose you bid <b>0.24 coins</b> for the preferred cue and its price on that trial is <b>0.22 coins</b>. Then you will pay <b>0.22 coins</b> and the <b>preferred cue</b> will appear.`,
        `Click on the videos below to see a demonstration of these. You must finish the videos before you can proceed to the next page.`,
        videoTags.stage3.bidForCueHigherThanPrice,
      ],
    },
    {
      title: instructionTitles[15],
      minTimeSec: 1,
      text: [
        `If your bid is <b>lower</b> than the price of your preferred cue, you <b>will not pay any coins and will receive the <i>other</i> type of cue instead</b>. For example, suppose you bid <b>0.24 coins</b> for the preferred cue and its price on that trial is <b>0.50 coins</b>. Then you will pay <b>0 coins</b> and the <b>non-preferred cue</b> will appear.`,
        `Click on the videos above to see a demonstration of these. You must finish the videos before you can proceed to the next page.`,
        videoTags.stage3.bidForCueLowerThanPrice,
      ],
    },
    {
      title: instructionTitles[16],
      minTimeSec: 1,
      text: [
        imageTags.trialStage.bidProbabilityChart,
        `The more coins you bid, the more likely your bid will be successful. The picture above shows exactly how each possible bid will change your chance to get your preferred cue.`,
        `In summary, you can choose to bid in these ways:`,
        `1. You can choose <b>not to bid any coins</b>, by dragging the marker to the center of the bid slider, which is labeled with <b>'no bid'</b> and <b>0</b>. In that case, you will have an equal chance of getting each of the two types of cues.`,
        `2. You can choose <b>to bid coins to receive an informative cue</b>, by dragging the marker to the <b>right half</b> of the bid slider. The more coins you bid, the higher your chance of receiving the informative cue, but on average, the higher the cost you will have to pay if you receive it.`,
        `3. You can choose <b>to bid coins to receive a blank cue</b>, by dragging the marker to the <b>left half</b> of the bid slider. The more coins you bid, the higher your chance of receiving the blank cue, but on average, the higher the cost you will have to pay if you receive it.`,
      ],
    },
    {
      title: instructionTitles[17],
      minTimeSec: 1,
      text: [
        imageTags.trialStage.bidOutOfRange,
        `You can place your bid anywhere <b>between the two vertical limit lines</b> labeled <b>${String(p.gachaMaxBidLabel)}</b> on the left and right of the bid slider. Your bid can be any valuefrom <b>0</b> to <b>${String(p.gachaMaxBid)} coins</b>. And your maximum bid is <b>${String(p.gachaMaxBid)} coins</b>.`,
        `However, the computer's price on each trial can be anywhere from <b>0</b> to <b>${String(p.gachaSliderMax)} coins</b>.`,
        `So even if you make the maximum bid of <b>${String(p.gachaMaxBid)} coins</b>, you will <b>not always get your preferred cue</b>.`,
      ],
    },
    {
      title: instructionTitles[18],
      minTimeSec: 1,
      text: [
        `In short, when bidding, you should:`,
        `1) first decide <b>whether you would like to receive the informative or blank cue</b>. <br>`,
        `2) then, <b>drag the marker to indicate the maximum number of coins you would be willing to pay for your preferred cue</b>. <br>`,
        `Importantly, your <b>total earnings</b> on each trial will be the coins that you won from the option you chose <b>minus</b> any coins you paid as price as the result of your bidding. <br>`,
      ],
    },
  ];
}

function buildInstructionsPlugin(pageContents, taskStage) {
  function createTitle(text, textSize) {
    return '<h1 style="font-size:' + textSize + 'px; font-weight:bold; text-align:center; position: absolute; top: 20px; left: 50%; transform: translateX(-50%);">' + text + "</h1>";
  }

  function createTextParagraphs(paragraphArray, textSize) {
    return makeInstructionStyleParagraphs(paragraphArray);
  }

  var instructions = {
    type: jsPsychInstructionsMyVersion,
    pages: [],
    button_label_next: "Next",
    button_label_previous: "Previous",
    show_clickable_nav: true,
    show_page_number: true,
    data: {
      taskStage: taskStage,
      choiceTrials: 0,
    },
  };

  pageContents.forEach(function (content) {
    instructions.pages.push({
      content: createTitle(content.title, textSize_instructionTitle) + createTextParagraphs(content.text, textSize_instruction),
      minTime: content.minTimeSec * 1000,
    });
  });

  return instructions;
}

function makeBdmInstructions(instructionTitles, p) {
  var pageContents = [
    {
      title: "Part 2: Bidding for Cues",
      minTimeSec: 1,
      text: [
        `You have finished the <b>first part</b> of the main task, where each block gave you one cue automatically.`,
        `In the <b>second part</b>, you will <b>bid for cues</b> on each trial. Each block is still in one room, but now you bid between a <b>Blank Cue</b> and one informative cue (<b>Exact</b>, <b>Rating</b>, or <b>Machine</b>).`,
        `The next pages explain how bidding works. Please read them carefully before continuing.`,
      ],
    },
  ].concat(makeStage3BdmInstructionPages(instructionTitles, p));

  return buildInstructionsPlugin(pageContents, "bdmInstructions");
}

function makeInstructions(instructionTitles, p) {
  var procedureSummary = [
    "Here is a <b>short summary</b> of the experimental procedure:",
    "<b>1)</b> You will read the instructions.",
    `<b>2)</b> You will answer ${p.questionNum} questions about the instructions. You can try as many times as you want until you answer them correctly.`,
  ];
  var stepNum = 3;
  if (p.showPractice) {
    procedureSummary.push(`<b>${stepNum})</b> You will complete ${p.practiceblockLength} practice trials.`);
    stepNum += 1;
  }
  if (p.detailedInstruction && p.useEnvironmentBlocks) {
    procedureSummary.push(`<b>${stepNum})</b> You will complete Part 1 of the main experiment with specific given cues.`);
    stepNum += 1;
    procedureSummary.push(`<b>${stepNum})</b> You will read instructions about bidding for cues.`);
    stepNum += 1;
    procedureSummary.push(`<b>${stepNum})</b> You will answer ${p.bdmQuestionNum} questions about bidding. You can try as many times as you want until you answer them correctly.`);
    stepNum += 1;
    procedureSummary.push(`<b>${stepNum})</b> You will complete Part 2 of the main experiment with bidding for your preferred cues.`);
    stepNum += 1;
  } else {
    procedureSummary.push(`<b>${stepNum})</b> You will complete the main experiment.`);
    stepNum += 1;
  }
  procedureSummary.push(`<b>${stepNum})</b> You will complete the post-experiment questionnaire.`);
  stepNum += 1;
  procedureSummary.push(`<b>${stepNum})</b> Finally, you will submit the task.`);
  procedureSummary.push(
    `We expect the whole procedure to take approximately <b>${p.totalTimeMinutes_min_rounded} to ${p.totalTimeMinutes_max_rounded} minutes</b>, with most of this time being the main experiment.`,
    `We realize that this is a long time, so you will be able to take breaks <b>periodically</b>.`,
    `We will show your total earnings at the end of the experiment and we will pay it within the next few days.`
  );

  var pageContents = [
    {
      title: instructionTitles[0],
      minTimeSec: 1,
      text: [
        "Welcome to our experiment!",
        "Please remain in <b>full screen</b> while doing the experiment.",
        "<i><b>Please take your time reading these instructions.</b></i> Please note that you will have to spend a certain amount of time on each page before you can proceed to the next page.",
      ].concat(procedureSummary),
    },
    {
      title: instructionTitles[1],
      minTimeSec: 1,
      text: [
        `The main experiment consists of ${p.totalLength} trials.`,
        "On each trial you will earn coins based on the choices you make.",
        "For each coin you win, you will earn <b>2 cent ($0.02)</b>.",
        `In the main experiment you can make approximately <b>$${earnings_maintask.minEarnings.toFixed(2)} to $${earnings_maintask.maxEarnings.toFixed(2)}</b> in total.`,
        `For the time you spend on the rest of the experiment (reading instructions, answering questions${p.showPractice ? ", completing practice" : ""}, taking breaks) we will pay you <b>$${instructionQuestionPayment}</b>.`,
        `In addition, we will pay you an additional <b>$${p.finishExperimentPayment}</b> if you finish the entire experiment. Please note that we will only pay you this bonus if you finish the entire experiment.`,
        `So, in total you can make approximately <b>$${earnings_total.minEarnings.toFixed(2)} to $${earnings_total.maxEarnings.toFixed(2)}</b> in this experiment, in other words approximately <b>$${p.averagePayPerHour_min.toFixed(2)} to $${p.averagePayPerHour_max.toFixed(2)} per hour!</b>`,
      ],
    },
    {
      title: instructionTitles[2],
      minTimeSec: 1,
      text: [
        `In this task, you will earn money from machines.`,
        `On each trial you will select a machine. The machine will dispense a ball for you that has <b>1~9 coins inside</b>. You will always receive <b>all of the coins inside your ball</b>.`,
        `However, the balls are <b>opaque</b>. So you will not be able to directly see how many coins you won.`,
        `Please see the video below as an example of the machine dispensing a ball. You must finish the video before you can proceed to the next page.`,
        videoTags.taskOverview.machine,
      ],
    },
    {
      title: instructionTitles[3],
      minTimeSec: 1,
      text: [
        `Although you will not be able to see the coins inside the balls directly, the task will show you <i><b>cues</b></i> about the coins. Some cues are <b>informative</b> and will <b>tell you about the coins inside the balls</b>. Other cues are <b>non-informative</b> and will <b>not tell you about the coins inside the balls</b>.`,
        `In the first part of the main task, the computer will give you one cue type per set of trials automatically. In the second part, you will have the chance to bid for cues.`,
        `There are four types of cues in total:`,
        `<b>Informative cues:</b> the Exact Cue, the Rating Cue, and the Machine Cue.`,
        `<b>Non-informative cue:</b> the Blank Cue.`,
        `In the next pages, we will explain what each type of cue tells you about the coins.`,
      ],
    },
    {
      title: instructionTitles[4],
      minTimeSec: 1,
      text: [
        `First, the <b>Exact Cue</b>: this cue shows you <b>exactly how many coins are in your ball</b>. For example, if the cue shows "5", your ball contains 5 coins.`,
        `Please see the image below as an example of an Exact Cue.`,
        imageTags.informativeCue.exactCue,
      ],
    },
    {
      title: instructionTitles[5],
      minTimeSec: 1,
      text: [
        `Second, the <b>Rating Cue</b>: this cue tells you <b>whether the number of coins is better or worse than average</b>. A thumbs up rating (👍) means 'better than average'; a thumbs down rating (👎) means 'worse than average'.`,
        `Please see the image below as an example of a Rating Cue.`,
        imageTags.informativeCue.ratingCue,
      ],
    },
    {
      title: instructionTitles[6],
      minTimeSec: 1,
      text: [
        `Third, the <b>Machine Cue</b>: this cue shows you <b>the number of coins inside three other balls from the same machine</b>. This gives you a sense of how many coins this machine typically produces.`,
        `Please see the image below as an example of a Machine Cue.`,
        imageTags.informativeCue.machineCue,
      ],
    },
    {
      title: instructionTitles[7],
      minTimeSec: 1,
      text: [
        `Finally, the <b>Blank Cue</b>: this cue <b>does NOT tell you anything about the coins</b>. It shows a question mark (<b>?</b>), which does not indicate the number of coins.`,
        `Please see the image below as an example of a Blank Cue.`,
        imageTags.nonInformativeCue.blankCue,
      ],
    },
    {
      title: instructionTitles[8],
      minTimeSec: 1,
      text: [
        `Now you understand what the task is about and what cues you may receive. Here is what will happen on each trial.`,
        `There are <b>five stages</b> of each trial:`,
        `<b>Stage 1)</b> Start the trial`,
        `<b>Stage 2)</b> Select a machine`,
        `<b>Stage 3)</b> Get your cues`,
        `<b>Stage 4)</b> Cue display and wait for your ball`,
        `<b>Stage 5)</b> Receive your ball and its coins`,
        `The next pages explain each stage in detail.`,
      ],
    },
    {
      title: instructionTitles[9],
      minTimeSec: 1,
      text: [
        `At the beginning of each trial, a target cross will appear on the screen as shown at the top. You will click it to initiate the trial.`,
        `The task is divided into multiple <b>blocks</b>. In most cases, each block contains <b>${String(p.blockLength_real)} trials</b>. During this stage, you will see which trial you are on within the current block.`,
        `If you do not click within <b>${String(p.fixation_duration / 1000)} seconds</b>, the cross will disappear and this stage will be repeated after a short delay.`,
        `Please see the image below as an example of Stage 1.`,
        imageTags.trialStage.startTrial,
      ],
    },
    {
      title: instructionTitles[10],
      minTimeSec: 1,
      text: [
        `In this stage, <b>one</b> or <b>two</b> machines will appear on the screen. You will need to select a machine by clicking on it. The machine you select will move to the center of the screen and a ball with coins inside will come out.`,
        `If you do not select a machine within <b>${String(p.choice_duration / 1000)} seconds</b>, you will be asked to repeat this stage after a short delay.`,
        `Please see the images below as possible examples of Stage 2.`,
        instructionFlatImageRowWithOr(["selectMachineRed", "selectMachineBlue", "selectMachineTwo"], "28vh", true),
      ],
    },
    {
      title: "Stage 3: Get Your Cue",
      minTimeSec: 1,
      text: [
        `In <b>Stage 3</b>, you will get your cue for the trial.`,
        `In this part of the task, the computer will <b>automatically</b> give you a cue on each trial. Each block uses one cue type for all trials in that block.`,
        `You will experience all four cue types: the <b>Exact Cue</b>, the <b>Rating Cue</b>, the <b>Machine Cue</b>, and the <b>Blank Cue</b>.`,
      ],
    },
    {
      title: instructionTitles[19],
      minTimeSec: 10,
      text: [
        `After your cue is shown, you will wait for an animation to play before your ball is delivered and your coins are deposited into your winnings.`,
        `Importantly, the animation takes the same amount of time regardless of which cue you receive. So <b>the amount of time you will have to wait to receive your ball is identical</b>, regardless of whether you get an exact cue, a rating cue, a machine cue, or a blank cue.`,
        `Click on one of the videos below and all of them will play automatically as the demonstration of Stage 4. You must finish the videos before you can proceed to the next page.`,
        instructionStage4SyncVideoGrid(),
      ],
    },
    {
      title: instructionTitles[20],
      minTimeSec: 10,
      text: [
        `At the end of each trial there will be an animation which shows you the ball being deposited into your winnings.`,
        `Remember that you will <b>always receive all of the coins from the ball</b> on every trial. Regardless of whether you got an informative cue that helps you guess the number of coins, or whether you got a blank cue that does not help you guess the number of coins, you will always have all of your ball's coins added to your winnings at the end of each trial.`,
        `Then, the screen will be cleared for ${String(p.itiSeconds)} second and then the next trial will start with the new target cross.`,
        `Click on the video below as an example of Stage 5. You must finish the video before you can proceed to the next page.`,
        videoTags.stage5.outcome,
      ],
    },
  ];
    
  if (p.useEnvironmentBlocks) {
    pageContents.push(
      {
        title: instructionTitles[21],
        minTimeSec: 1,
        text: [
          `There is one final, important part of the task: <b>rooms</b>.`,
          `In different blocks of trials during the task, you will enter <b>three different rooms</b>. `,
          `Each room has its own task format, where <b>special actions may be available during certain stages of each trial</b>. <br>`,
          `On the following pages, we will walk you through each room in detail. We will describe how the stages change from room to room and what to expect in each one.`,
        ],
      },
      {
        title: instructionTitles[22],
        minTimeSec: 1,
        text: [
          `First,the <b>Basic room</b>. In this room, you <b>can not do anything to influence the coins you will gain</b>. On each trial, there is only one machine to select. After you select it, you will always have to wait for it to deliver its ball. So regardless of what type of cues you get, and regardless of whether they are informative or blank cues, there is nothing you can do to change your total number of coins on each trial.`,
          `Click on the video below as an example of the Basic room. You must finish the video before you can proceed to the next page.`,
          videoTags.rooms.basicRoom,
        ],
      },
      {
        title: instructionTitles[23],
        minTimeSec: 1,
        text: [
          `Second, the <b>Time Budget room</b>. In this room, your goal is to <b>maximize the number of coins you get with a limited time budget</b>.`,
          `When you enter the room, your time budget is set to <b>${String(p.taBlockTimeBudgetLabel || p.totalSessionMinutes)}</b> for each block of trials. Your remaining time budget is shown at all times on the <b>top of the screen</b>. Your <b>time budget counts down ONLY during the exit/stay decision</b> (while you decide whether to skip waiting for the ball). Your time budget does not count down during other stages of the task. When the time budget runs out, the block of trials will end and you will leave the room. `,
          `Importantly, after you get your cue, you will <b>have the option to skip the ball</b> to <b>save your time</b>. If you <b>skip a ball</b>, you will <b>end the trial instantly and immediately move on to the next trial</b>. So if you skip a ball, you do NOT wait for the ball to be delivered, and you do NOT receive its coins.`,
          `In summary, in the Time Budget room, you will need to decide which balls are worth waiting for to get their coins, and which balls you should skip to save your time, in order to maximize your total number of coins you collect in your limited time budget.`,
          `Also, in this room, there is not a fixed number of trials. You will complete as many trials as you can within your time budget. At Stage 1 of each trial, you will see which trial you are on and the remaining time budget of the current block.`,
          `Click on the video below as an example of the Time Budget room. You must finish the video before you can proceed to the next page.`,
          videoTags.rooms.timeBudgetRoom,
        ],
      },
      {
        title: instructionTitles[24],
        minTimeSec: 1,
        text: [
          `Third, the <b>Learning room</b>. In this room, your goal is to <b>maximize the coins you get by learning to choose between two machines during a limited number of trials</b>. `,
          `On each trial you will have a choice between two machines: a red machine and a blue machine. You will have <b>${String(p.learningRoomTrials)} trials</b> to choose between these machines. `,
          `One of the machines is a <b>good machine</b> that gives many coins. The other machine is a <b>bad machine</b> that gives few coins. However, we will not tell you which machine is good and which is bad. You will have to learn that for yourself by trial and error experience.`,
          `After you have completed each set of <b>${String(p.learningRoomTrials)} trials</b> and enter the next set, we will show you a message that says: “The good and bad machine colors have been randomized!” This means that the good machine has been randomly re-colored to be red or blue, and the bad machine has been randomly re-colored to be blue or red. So you will <b>no longer know which machine is good and which is bad</b>. You will have to <b>learn by trial and error again</b>.`,
          `In summary, in the Learning room, you will need to quickly learn which machine is good and which machine is bad, in order to choose the good machine as much as possible, to maximize your total number of coins during each <b>${String(p.learningRoomTrials)} trial set</b>.`,
          `Click on the video below as an example of the Learning room. You must finish the video before you can proceed to the next page.`,
          videoTags.rooms.learningRoom,
        ],
      }
    );
  }

  return buildInstructionsPlugin(pageContents, "instructions");
}

// Keep in sync with minTimeSec values inside makeInstructions().
function getInstructionPageMinTimesSec(useEnvironmentBlocks) {
  var times = [5, 3, 5, 2, 4, 4, 4, 4, 8, 8, 15, 10, 10, 10];
  if (useEnvironmentBlocks) {
    times = times.concat([5, 8, 10, 10]);
  }
  return times;
}

function getBdmInstructionPageMinTimesSec() {
  return [5, 10, 12, 10, 10, 5, 5, 10];
}
