var jsPsychGachaBDMTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "jsPsychGachaBDMTask",
    parameters: {
      taskStage: { type: jspsych.ParameterType.STRING, default: "" },
      trialNum: { type: jspsych.ParameterType.INT, default: 0 },
      blockNum: { type: jspsych.ParameterType.INT, default: 0 },
      blockLength: { type: jspsych.ParameterType.INT, default: 0 },
      practiceblockLength: { type: jspsych.ParameterType.INT, default: 0 },
      ifPractice: { type: jspsych.ParameterType.INT, default: 0 },
      fixation_duration: { type: jspsych.ParameterType.INT, default: 3000 },
      fixation_blankpageDuration: { type: jspsych.ParameterType.INT, default: 500 },
      stage_action_timeout: { type: jspsych.ParameterType.INT, default: 5000 },
      stage_refresh_delay: { type: jspsych.ParameterType.INT, default: 200 },
      choice_duration: { type: jspsych.ParameterType.INT, default: 5000 },
      choice_blankpageDuration: { type: jspsych.ParameterType.INT, default: 3000 },
      infobidchoiceduration: { type: jspsych.ParameterType.INT, default: 5000 },
      infobidchoice_blankpageDuration: { type: jspsych.ParameterType.INT, default: 3000 },
      bidDisplayTime: { type: jspsych.ParameterType.INT, default: 2000 },
      payMessageDisplayTime: { type: jspsych.ParameterType.INT, default: 3000 },
      ballDropDuration: { type: jspsych.ParameterType.INT, default: 1400 },
      infoRevealDuration: { type: jspsych.ParameterType.INT, default: 3000 },
      rewardRevealDuration: { type: jspsych.ParameterType.INT, default: 3000 },
      rewardWaitDuration: { type: jspsych.ParameterType.INT, default: 8000 },
      exitStayDecisionDuration: { type: jspsych.ParameterType.INT, default: 3000 },
      ITIduration: { type: jspsych.ParameterType.INT, default: 1000 },
      numberofOffers: { type: jspsych.ParameterType.INT, default: 1 },
      armIndex: { type: jspsych.ParameterType.INT, default: 0 },
      armColor: { type: jspsych.ParameterType.STRING, default: "red" },
      armMean: { type: jspsych.ParameterType.FLOAT, default: 5 },
      armSd: { type: jspsych.ParameterType.FLOAT, default: 1 },
      outcome: { type: jspsych.ParameterType.INT, default: 5 },
      // Legacy array params kept for compatibility with trial generators
      armIndices: { type: jspsych.ParameterType.ARRAY, default: [] },
      armColors: { type: jspsych.ParameterType.ARRAY, default: [] },
      armMeans: { type: jspsych.ParameterType.ARRAY, default: [] },
      armSds: { type: jspsych.ParameterType.ARRAY, default: [] },
      outcomes: { type: jspsych.ParameterType.ARRAY, default: [] },
      armMeanings: { type: jspsych.ParameterType.ARRAY, default: [] },
      armSdCaseInds: { type: jspsych.ParameterType.ARRAY, default: [] },
      arm_means_same: { type: jspsych.ParameterType.BOOL, default: false },
      arm_sds_same: { type: jspsych.ParameterType.BOOL, default: false },
      arm_colors_same: { type: jspsych.ParameterType.BOOL, default: false },
      this_block_color: { type: jspsych.ParameterType.STRING, default: "" },
      distributionCase: { type: jspsych.ParameterType.INT, default: 0 },
      distributionType: { type: jspsych.ParameterType.STRING, default: "gaussian" },
      blockSdInd: { type: jspsych.ParameterType.INT, default: 0 },
      blockSdCaseInd: { type: jspsych.ParameterType.ARRAY, default: [0, 0] },
      blockId: { type: jspsych.ParameterType.INT, default: 0 },
      blockErId: { type: jspsych.ParameterType.INT, default: 0 },
      blockSdId: { type: jspsych.ParameterType.INT, default: 0 },
      blockDiffId: { type: jspsych.ParameterType.INT, default: 0 },
      infoType: { type: jspsych.ParameterType.STRING, default: "A" },
      sampleDraws: { type: jspsych.ParameterType.OBJECT, default: { arm0: [], arm1: [] } },
      sampleDrawCount: { type: jspsych.ParameterType.INT, default: 3 },
      sliderMax: { type: jspsych.ParameterType.FLOAT, default: 1.25 },
      gachaMaxBid: { type: jspsych.ParameterType.FLOAT, default: 1 },
      gachaMaxBidLabel: { type: jspsych.ParameterType.FLOAT, default: 1 },
      sliderStep: { type: jspsych.ParameterType.FLOAT, default: 0.01 },
      sliderRandomStart: { type: jspsych.ParameterType.INT, default: 4 },
      showTimer: { type: jspsych.ParameterType.BOOL, default: true },
      exitButtonImage: { type: jspsych.ParameterType.STRING, default: "" },
      environmentType: { type: jspsych.ParameterType.STRING, default: "" },
      showExitOption: { type: jspsych.ParameterType.BOOL, default: true },
      timerScope: { type: jspsych.ParameterType.STRING, default: "global" },
      skipBidding: { type: jspsych.ParameterType.BOOL, default: false },
      predeterminedInfoObtained: { type: jspsych.ParameterType.BOOL, default: undefined },
      infoTypeColors: { type: jspsych.ParameterType.OBJECT, default: {} },
    },
  };

  var ENVIRONMENT_DEFAULTS = {
    NI: { numberofOffers: 1, showExitOption: false, showTimer: false, timerScope: "none" },
    TA: { numberofOffers: 1, showExitOption: true, showTimer: true, timerScope: "exit_decision_only" },
    CA: { numberofOffers: 2, showExitOption: false, showTimer: false, timerScope: "none" },
  };

  class jsPsychGachaBDMTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      var _self = this;
      var trial_data = {};
      var trialStartTime = performance.now();
      var fixationCount = 0;
      var bidCount = 0;
      var bidchoice_made = false;
      var timerRafId = null;
      var lastTimerDisplaySec = null;
      var inExitDecisionPhase = false;
      var exitPhaseStartTime = null;
      var selectedMachineSide = "left";

      function resolveEnvironmentConfig() {
        var env = (trial.environmentType || "").toUpperCase();
        var defaults = ENVIRONMENT_DEFAULTS[env] || {};
        return {
          environmentType: env,
          numberofOffers: trial.numberofOffers !== undefined ? trial.numberofOffers : (defaults.numberofOffers || 1),
          showExitOption: trial.showExitOption !== undefined ? trial.showExitOption : (defaults.showExitOption !== undefined ? defaults.showExitOption : true),
          showTimer: trial.showTimer !== undefined ? trial.showTimer : (defaults.showTimer !== undefined ? defaults.showTimer : true),
          timerScope: trial.timerScope || defaults.timerScope || "global",
        };
      }

      var envConfig = resolveEnvironmentConfig();

      var onExitDecisionTimeout = null;

      function recordMachineRole(armIdx) {
        var goodIdx = null;
        if (trial.goodArmIndex === 0 || trial.goodArmIndex === 1) {
          goodIdx = trial.goodArmIndex;
        } else if (trial.armSds && trial.armSds.length >= 2) {
          goodIdx = trial.armSds[0] <= trial.armSds[1] ? 0 : 1;
        }
        if (goodIdx !== null) {
          trial_data.arm_choosenRole = armIdx === goodIdx ? "good" : "bad";
          trial_data.goodArmIndex = goodIdx;
          trial_data.badArmIndex = 1 - goodIdx;
        }
      }

      function coinToCents(coins) {
        return coins * (typeof coinToCentRate !== "undefined" ? coinToCentRate : 1);
      }

      function coinToDollars(coins) {
        return coins * (typeof coinToDollarRate !== "undefined" ? coinToDollarRate : 0.01);
      }

      function resolveArmParams(armIdx) {
        var outcomeVal = 0;
        if (Array.isArray(trial.outcomes) && trial.outcomes.length > armIdx && typeof trial.outcomes[armIdx] === "number") {
          outcomeVal = trial.outcomes[armIdx];
        } else if (trial.outcome !== undefined && trial.outcome !== null) {
          outcomeVal = trial.outcome;
        }
        return {
          armIndex: armIdx,
          color: trial.armColors.length > armIdx ? trial.armColors[armIdx] : (trial.armColor || "red"),
          mean: trial.armMeans.length > armIdx ? trial.armMeans[armIdx] : (trial.armMean || 5),
          sd: trial.armSds.length > armIdx ? trial.armSds[armIdx] : (trial.armSd || 1),
          outcome: outcomeVal,
        };
      }

      // Resolve single-machine params from either new scalar or legacy array form
      var initialArmIdx = (trial.armIndex !== undefined && trial.armIndex !== null && trial.armIndex <= 1)
        ? trial.armIndex
        : 0;
      var initialArm = resolveArmParams(initialArmIdx);
      var theArmIndex = initialArm.armIndex;
      var theColor = initialArm.color;
      var theMean = initialArm.mean;
      var theSd = initialArm.sd;
      var theOutcome = initialArm.outcome;

      function getSelectedMachineEl() {
        return display_element.querySelector("#machine-" + selectedMachineSide);
      }

      var INFO_TYPE_LABELS = {
        A: "the exact reward inside the ball",
        B: "whether the reward is GOOD or BAD",
        C: "the rewards inside " + trial.sampleDrawCount + " other balls"
      };

      var INFO_TYPE_COLORS = (function () {
        if (trial.infoTypeColors && trial.infoTypeColors.A) {
          return trial.infoTypeColors;
        }
        if (typeof window.participantInfoTypeColors !== "undefined" && window.participantInfoTypeColors.A) {
          return window.participantInfoTypeColors;
        }
        return {
          A: "#F1C40F",
          B: "#00BCD4",
          C: "#1B5E20",
          D: "#9B59B6",
        };
      })();

      var SLIDER_VISUAL_MIN = -10;
      var SLIDER_VISUAL_MAX = 10;
      var SLIDER_BID_MAX = trial.gachaMaxBid !== undefined ? trial.gachaMaxBid : 1;
      var SLIDER_BID_MIN = -SLIDER_BID_MAX;
      var SLIDER_BID_LIMIT_LABEL = trial.gachaMaxBidLabel !== undefined ? trial.gachaMaxBidLabel : 1;
      var COMPUTER_PRICE_MAX = trial.sliderMax !== undefined ? trial.sliderMax : 1.25;
      var COIN_DECIMALS = (function () {
        var stepStr = String(trial.sliderStep !== undefined ? trial.sliderStep : 0.01);
        var dot = stepStr.indexOf(".");
        return dot === -1 ? 0 : stepStr.length - dot - 1;
      })();

      function formatCoinAmount(value) {
        return parseFloat(value).toFixed(COIN_DECIMALS);
      }
      var NOINFO_CUE_COLOR = INFO_TYPE_COLORS.D || "#9B59B6";

      var CUE_TYPE_NAMES = {
        A: "Exact Cue",
        B: "Rating Cue",
        C: "Machine Cue"
      };

      function getInfoTypeColor(infoType) {
        if (infoType === "D") {
          return NOINFO_CUE_COLOR;
        }
        return INFO_TYPE_COLORS[infoType] || INFO_TYPE_COLORS.A;
      }

      function getNoInfoCueColor() {
        return NOINFO_CUE_COLOR;
      }

      function coloredCueSpan(label, color) {
        return '<span class="cue-name" style="color:' + color + ';">' + label + '</span>';
      }

      function emphasisSpan(text) {
        return '<span class="cue-amount">' + text + '</span>';
      }

      function buildBidQuestionCue() {
        var label = INFO_TYPE_LABELS[trial.infoType];
        var color = getInfoTypeColor(trial.infoType);
        return "How much would you bid to learn " + coloredCueSpan(label, color) + "?";
      }

      function buildPayMessageText(paidAmount, bidDirection, bidWon) {
        var amount = formatCoinAmount(paidAmount);
        var infoName = CUE_TYPE_NAMES[trial.infoType] || "Informative Cue";
        var infoColor = getInfoTypeColor(trial.infoType);
        var noInfoSpan = coloredCueSpan("Non-Informative Cue", getNoInfoCueColor());
        var infoSpan = coloredCueSpan(infoName, infoColor);

        if (bidWon) {
          if (bidDirection === "info") {
            return "You pay " + emphasisSpan(amount) + " coins for the " + infoSpan + ".";
          }
          return "You pay " + emphasisSpan(amount) + " coins for the " + noInfoSpan + ".";
        }
        if (bidDirection === "info") {
          return "You pay nothing. You will get the " + noInfoSpan + " instead.";
        }
        return "You pay nothing. You will get the " + infoSpan + " instead.";
      }

      function bidValueToPct(bidValue) {
        if (SLIDER_BID_MAX === SLIDER_BID_MIN) return 50;
        return 10 + ((bidValue - SLIDER_BID_MIN) / (SLIDER_BID_MAX - SLIDER_BID_MIN)) * 80;
      }

      function priceToPct(signedPrice) {
        var visual = signedPrice * (SLIDER_VISUAL_MAX / COMPUTER_PRICE_MAX);
        return ((visual - SLIDER_VISUAL_MIN) / (SLIDER_VISUAL_MAX - SLIDER_VISUAL_MIN)) * 100;
      }

      // ===================== TIMER =====================
      function getTimeRemaining() {
        if (!envConfig.showTimer || envConfig.timerScope === "none") return null;

        if (envConfig.timerScope === "exit_decision_only") {
          if (typeof window.experimentTotalTime === "undefined" || window.experimentTotalTime === null) return null;
          var used = window.taDecisionTimeUsed || 0;
          var current = 0;
          if (inExitDecisionPhase && exitPhaseStartTime !== null) {
            current = performance.now() - exitPhaseStartTime;
          }
          return Math.max(0, window.experimentTotalTime - used - current);
        }

        if (typeof window.experimentStartTime === "undefined" || window.experimentStartTime === null) {
          return null;
        }
        var elapsed = performance.now() - window.experimentStartTime;
        return Math.max(0, window.experimentTotalTime - elapsed);
      }

      function formatTime(ms) {
        var totalSec = Math.ceil(ms / 1000);
        var min = Math.floor(totalSec / 60);
        var sec = totalSec % 60;
        return min + ":" + (sec < 10 ? "0" : "") + sec;
      }

      function stopTimerLoop() {
        if (timerRafId !== null) {
          cancelAnimationFrame(timerRafId);
          timerRafId = null;
        }
      }

      function startTimerLoop() {
        if (timerRafId !== null) return;
        function tick() {
          updateTimerUI();
          timerRafId = requestAnimationFrame(tick);
        }
        timerRafId = requestAnimationFrame(tick);
      }

      function removeTimerElement() {
        stopTimerLoop();
        lastTimerDisplaySec = null;
        var existing = document.getElementById("experiment-timer");
        if (existing) existing.remove();
      }

      function isTimerPaused() {
        return envConfig.timerScope === "exit_decision_only" && !inExitDecisionPhase;
      }

      function updateTimerUI() {
        if (!envConfig.showTimer) return;
        var remaining = getTimeRemaining();
        if (remaining === null) return;

        var totalTime = window.experimentTotalTime;
        if (!totalTime || totalTime <= 0) return;

        var pct = Math.max(0, Math.min(100, (remaining / totalTime) * 100));
        var barEl = document.getElementById("timer-bar-progress");
        var handleEl = document.getElementById("timer-handle");
        var textEl = document.getElementById("timer-text");
        var pauseEl = document.getElementById("timer-pause-label");
        var paused = isTimerPaused();
        var pctStr = pct.toFixed(2) + "%";
        var displaySec = Math.max(0, Math.ceil(remaining / 1000));

        if (barEl && barEl.style.width !== pctStr) {
          barEl.style.width = pctStr;
        }
        if (handleEl) {
          if (handleEl.style.left !== pctStr) {
            handleEl.style.left = pctStr;
          }
          if (paused) handleEl.classList.add("timer-paused");
          else handleEl.classList.remove("timer-paused");
        }
        if (textEl && displaySec !== lastTimerDisplaySec) {
          lastTimerDisplaySec = displaySec;
          textEl.textContent = formatTime(remaining);
        }
        if (pauseEl) {
          if (paused) {
            pauseEl.textContent = "TIME PAUSE";
            pauseEl.classList.add("visible");
          } else {
            pauseEl.textContent = "";
            pauseEl.classList.remove("visible");
          }
        }

        if (remaining <= 0 && inExitDecisionPhase && typeof onExitDecisionTimeout === "function") {
          stopTimerLoop();
          onExitDecisionTimeout();
        }
      }

      function ensureTimerElement() {
        if (!envConfig.showTimer) return;
        var remaining = getTimeRemaining();
        if (remaining === null) return;

        var timerEl = document.getElementById("experiment-timer");
        if (!timerEl) {
          timerEl = document.createElement("div");
          timerEl.id = "experiment-timer";
          timerEl.className = "experiment-timer";
          timerEl.innerHTML =
            '<div class="timer-bar-track">' +
              '<div class="timer-bar-progress" id="timer-bar-progress"></div>' +
              '<div class="timer-handle" id="timer-handle">' +
                '<div class="timer-clock" id="timer-text"></div>' +
                '<div class="timer-remaining-caption" id="timer-remaining-caption">Time Remaining</div>' +
                '<div class="timer-pause-label" id="timer-pause-label"></div>' +
              '</div>' +
            '</div>';
          document.body.appendChild(timerEl);
          lastTimerDisplaySec = null;
        }
        if (envConfig.environmentType === "TA") {
          timerEl.classList.add("ta-timer");
        } else {
          timerEl.classList.remove("ta-timer");
        }
        if (!document.getElementById("timer-remaining-caption")) {
          var handleNode = document.getElementById("timer-handle");
          if (handleNode) {
            var captionEl = document.createElement("div");
            captionEl.id = "timer-remaining-caption";
            captionEl.className = "timer-remaining-caption";
            captionEl.textContent = "Time Remaining";
            var pauseEl = document.getElementById("timer-pause-label");
            if (pauseEl) handleNode.insertBefore(captionEl, pauseEl);
            else handleNode.appendChild(captionEl);
          }
        }

        startTimerLoop();
        updateTimerUI();
      }

      function startExitDecisionTimer() {
        inExitDecisionPhase = true;
        exitPhaseStartTime = performance.now();
        ensureTimerElement();
      }

      function endExitDecisionTimer() {
        if (inExitDecisionPhase && exitPhaseStartTime !== null) {
          window.taDecisionTimeUsed = (window.taDecisionTimeUsed || 0) + (performance.now() - exitPhaseStartTime);
        }
        inExitDecisionPhase = false;
        exitPhaseStartTime = null;
        if (envConfig.showTimer && envConfig.timerScope !== "none") {
          updateTimerUI();
        }
      }

      function isTimeUp() {
        if (!envConfig.showTimer || envConfig.timerScope === "none") return false;
        if (envConfig.timerScope === "exit_decision_only") {
          if (!inExitDecisionPhase) return false;
        }
        var remaining = getTimeRemaining();
        return remaining !== null && remaining <= 0;
      }

      // Show the timer bar at the top for the whole trial whenever the
      // environment uses a timer (TA shows it always, not just during the
      // exit/stay decision). Clear any stray bar left over from a previous
      // block when the current environment has no timer.
      if (envConfig.showTimer && envConfig.timerScope !== "none") {
        ensureTimerElement();
      } else {
        removeTimerElement();
      }

      function scheduleStageRepeat(cleanupFn, repeatFn, blankDuration, options) {
        var delay = blankDuration !== undefined ? blankDuration : trial.stage_refresh_delay;
        var fullClear = !options || options.fullClear !== false;
        var isActive = (options && options.isActive) ? options.isActive : function () { return true; };
        var repeatTimeoutId = null;
        var cancelled = false;

        var outerTimeoutId = setTimeout(function () {
          if (cancelled || !isActive()) return;
          if (cleanupFn) cleanupFn();
          if (fullClear) {
            display_element.innerHTML = "";
          }
          repeatTimeoutId = setTimeout(function () {
            if (cancelled || !isActive()) return;
            repeatFn();
          }, delay);
        }, trial.stage_action_timeout);

        return function cancelStageRepeat() {
          cancelled = true;
          clearTimeout(outerTimeoutId);
          if (repeatTimeoutId !== null) clearTimeout(repeatTimeoutId);
        };
      }

      function cancelStageRepeat(handle) {
        if (typeof handle === "function") handle();
        else if (handle != null) clearTimeout(handle);
      }

      function formatFixationTrialInfo() {
        var trialType = trial.ifPractice === 0 ? "Trial" : "Practice trial";
        var n = trial.trialNum;
        if (envConfig.environmentType === "TA") {
          return trialType + " " + n;
        }
        var total = trial.ifPractice ? trial.practiceblockLength : trial.blockLength;
        if (total > 0) {
          return trialType + " " + n + " of " + total;
        }
        return trialType + " " + n;
      }

      function updateFixationTimeRemaining() {
        var fixationTimeEl = display_element.querySelector("#fixationTimeRemaining");
        if (!fixationTimeEl) return;
        if (envConfig.environmentType === "TA" && envConfig.showTimer && envConfig.timerScope !== "none") {
          var remaining = getTimeRemaining();
          fixationTimeEl.textContent = "Time Remaining: " + (remaining !== null ? formatTime(remaining) : "--:--");
          fixationTimeEl.classList.remove("hidden");
        } else {
          fixationTimeEl.textContent = "";
          fixationTimeEl.classList.add("hidden");
        }
      }

      // ===================== FIXATION =====================
      function showFixation() {
        if (isTimeUp()) { endTrial(); return; }

        var fixationContent = psiTurk.getPage("trialStages/fixation.html");
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = fixationContent;

        fixationCount++;
        var startTime = performance.now();

        var trialInfoEl = tempDiv.querySelector("#trialInfo");
        trialInfoEl.textContent = formatFixationTrialInfo();

        display_element.innerHTML = tempDiv.innerHTML;
        updateFixationTimeRemaining();

        var fixationElement = display_element.querySelector("#fixation");

        function fixationClickCallback() {
          trial_data.fixation_rt = performance.now() - startTime;
          trial_data.fixation_count = fixationCount;
          cancelStageRepeat(fixationTimeout);
          fixationElement.removeEventListener("click", fixationClickCallback);
          showMachineChoice();
        }

        fixationElement.addEventListener("click", fixationClickCallback);

        var fixationTimeout = scheduleStageRepeat(
          function () {
            fixationElement.removeEventListener("click", fixationClickCallback);
          },
          showFixation,
          trial.fixation_blankpageDuration
        );
      }

      function styleMachine(machineEl, armIdx) {
        var arm = resolveArmParams(armIdx);
        var color = arm.color;
        var dark = colorToDark(color);
        var dome = machineEl.querySelector(".gacha-dome");
        dome.style.background = colorToRGBA(color, 1);
        dome.style.borderColor = dark;
        machineEl.querySelector(".gacha-body").style.backgroundColor = color;
        machineEl.querySelector(".gacha-body").style.borderColor = dark;
        machineEl.querySelector(".gacha-neck").style.backgroundColor = dark;
        machineEl.querySelector(".gacha-neck").style.borderColor = dark;
        machineEl.querySelector(".gacha-base").style.backgroundColor = dark;
        var knob = machineEl.querySelector(".gacha-knob");
        if (knob) {
          knob.style.backgroundColor = dark;
          knob.style.borderColor = dark;
        }
        dome.querySelectorAll(".dome-ball").forEach(function (b) { b.remove(); });
        populateDomeBalls(dome, color, arm.mean, arm.sd);
        machineEl.querySelector(".gacha-ball").style.backgroundColor = color;
      }

      function sampleDomeCoin(mean, sd) {
        if (typeof sampleDiscreteGaussian === "function") {
          return sampleDiscreteGaussian(mean, sd);
        }
        var lo = typeof minCoinNum !== "undefined" ? minCoinNum : 1;
        var hi = typeof maxCoinNum !== "undefined" ? maxCoinNum : 9;
        return Math.max(lo, Math.min(hi, Math.round(mean)));
      }

      function clampCoinDisplay(value) {
        if (typeof clipCoinValue === "function") {
          return clipCoinValue(value);
        }
        var lo = typeof minCoinNum !== "undefined" ? minCoinNum : 1;
        var hi = typeof maxCoinNum !== "undefined" ? maxCoinNum : 9;
        return Math.max(lo, Math.min(hi, Math.round(value)));
      }

      function prepareInitialMachineStage(options) {
        options = options || {};
        var gachaEpoch = display_element.querySelector("#gachaChoice");
        if (!gachaEpoch) return null;

        pinMachineStage();

        if (options.singleCentered) {
          var wrapper = gachaEpoch.querySelector(".gacha-wrapper");
          var machineEl = options.machineEl || (wrapper ? wrapper.querySelector(".machine-container") : null);
          if (wrapper && machineEl) {
            machineEl.classList.add("machine-centered");
            wrapper.classList.add("single-machine-focus");
            gachaEpoch.classList.add("single-machine-focus");
          }
        }

        return gachaEpoch;
      }

      function focusSelectedMachine(selectedMachineEl) {
        var gachaEpoch = display_element.querySelector("#gachaChoice");
        var wrapper = gachaEpoch ? gachaEpoch.querySelector(".gacha-wrapper") : null;
        if (!wrapper || !selectedMachineEl) return;

        wrapper.querySelectorAll(".machine-container").forEach(function (mc) {
          if (mc !== selectedMachineEl) {
            mc.remove();
          }
        });

        selectedMachineEl.classList.add("machine-centered");
        wrapper.classList.add("single-machine-focus");
        if (gachaEpoch) {
          gachaEpoch.classList.add("single-machine-focus");
          gachaEpoch.classList.remove("ca-choice-phase");
        }

        pinMachineStage();
      }

      function pinMachineStage() {
        var gachaEpoch = display_element.querySelector("#gachaChoice");
        if (gachaEpoch) gachaEpoch.classList.add("machine-stage-fixed");
      }

      function setDefaultBallDisplay(ballEl) {
        if (!ballEl) return;
        var ballContent = ballEl.querySelector(".ball-content");
        if (ballContent) {
          ballContent.textContent = "";
          ballContent.style.fontSize = "";
        }
        ballEl.classList.remove("ball-face-large");
      }

      var TYPE_C_BALL_SIZE_PCT = 24;
      var TYPE_C_BALL_MIN_GAP_PCT = 6;

      function getDomeBallPosition(ball) {
        return {
          left: parseFloat(ball.style.left) || 50,
          top: parseFloat(ball.style.top) || 50
        };
      }

      function domeBallPositionsOverlap(posA, posB, minDist) {
        var dx = posA.left - posB.left;
        var dy = posA.top - posB.top;
        return Math.sqrt(dx * dx + dy * dy) < minDist;
      }

      function pickNonOverlappingDomeBallIndices(domeBalls, count) {
        var minDist = TYPE_C_BALL_SIZE_PCT + TYPE_C_BALL_MIN_GAP_PCT;
        var order = domeBalls.map(function (_, i) { return i; });
        for (var s = order.length - 1; s > 0; s--) {
          var j = Math.floor(Math.random() * (s + 1));
          var tmp = order[s];
          order[s] = order[j];
          order[j] = tmp;
        }

        var picked = [];
        for (var o = 0; o < order.length && picked.length < count; o++) {
          var idx = order[o];
          var pos = getDomeBallPosition(domeBalls[idx]);
          var ok = true;
          for (var p = 0; p < picked.length; p++) {
            if (domeBallPositionsOverlap(pos, getDomeBallPosition(domeBalls[picked[p]]), minDist)) {
              ok = false;
              break;
            }
          }
          if (ok) picked.push(idx);
        }
        return picked;
      }

      function revealTypeCExampleBalls(domeBalls, sampleDraws, color) {
        var ballIndices = pickNonOverlappingDomeBallIndices(domeBalls, sampleDraws.length);

        for (var i = 0; i < sampleDraws.length; i++) {
          var ball = domeBalls[ballIndices[i]];
          if (!ball) continue;
          ball.style.backgroundColor = colorToDark(color);
          ball.style.opacity = "1";
          ball.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          ball.style.transform = "translate(-50%, -50%) scale(1.05)";
          ball.textContent = String(clampCoinDisplay(sampleDraws[i]));
          ball.classList.add("ball-visible", "dome-ball-example");
        }
      }

      function appendOverlay(el) {
        document.body.appendChild(el);
      }

      function removeOverlay(selector) {
        document.querySelectorAll(selector).forEach(function (el) { el.remove(); });
      }

      function startRewardWaitAnimation(machineEl) {
        if (!machineEl) return;
        var ballEl = machineEl.querySelector(".gacha-ball");
        if (ballEl) ballEl.classList.add("ball-pendulum");
      }

      function stopRewardWaitAnimation(machineEl) {
        if (!machineEl) return;
        var ballEl = machineEl.querySelector(".gacha-ball");
        if (ballEl) ballEl.classList.remove("ball-pendulum", "ball-wobbling");
      }

      // Single fixed text-cue slot on document.body — avoids position:fixed breaking
      // inside #gachaChoice.machine-stage-fixed (transform creates a new containing block).
      var textCueEl = null;

      function ensureTextCue() {
        if (!textCueEl) {
          textCueEl = document.createElement("div");
          textCueEl.id = "gachaTextCue";
          textCueEl.className = "gacha-text-cue hidden";
          textCueEl.setAttribute("aria-live", "polite");
          document.body.appendChild(textCueEl);
        } else if (!textCueEl.parentNode) {
          document.body.appendChild(textCueEl);
        }
        return textCueEl;
      }

      function setTextCue(content, useHtml, centered) {
        var el = ensureTextCue();
        if (useHtml) el.innerHTML = content;
        else el.textContent = content;
        el.classList.toggle("gacha-text-cue-center", !!centered);
        el.classList.remove("hidden");
      }

      function hideTextCue() {
        if (textCueEl) {
          textCueEl.classList.add("hidden");
          textCueEl.classList.remove("gacha-text-cue-center");
          textCueEl.innerHTML = "";
        }
      }

      function removeTextCue() {
        hideTextCue();
        if (textCueEl && textCueEl.parentNode) {
          textCueEl.parentNode.removeChild(textCueEl);
        }
        textCueEl = null;
      }

      function showMachineChoice() {
        if (envConfig.numberofOffers >= 2) {
          showTwoMachines();
        } else {
          showSingleMachine();
        }
      }

      function showTwoMachines() {
        var gachaContent = psiTurk.getPage("trialStages/gachaChoice.html");
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = gachaContent;
        display_element.innerHTML = tempDiv.innerHTML;

        var gachaEpoch = display_element.querySelector("#gachaChoice");
        if (gachaEpoch) gachaEpoch.classList.add("ca-choice-phase");

        var leftMachine = display_element.querySelector("#machine-left");
        var rightMachine = display_element.querySelector("#machine-right");
        styleMachine(leftMachine, 0);
        styleMachine(rightMachine, 1);
        prepareInitialMachineStage();

        setTextCue("Click a machine to play!");

        var clickStartTime = performance.now();

        function onMachinePick(side, armIdx) {
          leftMachine.removeEventListener("click", onLeftClick);
          rightMachine.removeEventListener("click", onRightClick);
          cancelStageRepeat(clickTimeout);

          selectedMachineSide = side;
          var arm = resolveArmParams(armIdx);
          theArmIndex = arm.armIndex;
          theColor = arm.color;
          theMean = arm.mean;
          theSd = arm.sd;
          theOutcome = arm.outcome;

          trial_data.arm_choosenIndex = theArmIndex;
          trial_data.arm_choosenColor = theColor;
          trial_data.arm_rewardAmount = theOutcome;
          trial_data.arm_choosenMean = theMean;
          trial_data.arm_choosenSd = theSd;
          trial_data.arm_choiceRT = performance.now() - clickStartTime;
          recordMachineRole(theArmIndex);

          hideTextCue();
          var selectedMachine = side === "left" ? leftMachine : rightMachine;
          selectedMachine.style.pointerEvents = "none";
          selectedMachine.classList.add("machine-disabled");
          focusSelectedMachine(selectedMachine);

          showBallDrop();
        }

        function onLeftClick() { onMachinePick("left", 0); }
        function onRightClick() { onMachinePick("right", 1); }

        leftMachine.addEventListener("click", onLeftClick);
        rightMachine.addEventListener("click", onRightClick);

        var clickTimeout = scheduleStageRepeat(
          function () {
            leftMachine.removeEventListener("click", onLeftClick);
            rightMachine.removeEventListener("click", onRightClick);
          },
          showTwoMachines,
          trial.choice_blankpageDuration
        );
      }

      // ===================== SINGLE GACHA MACHINE (NI / TA) =====================
      function showSingleMachine() {
        var gachaContent = psiTurk.getPage("trialStages/gachaChoice.html");
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = gachaContent;

        // Remove the right machine entirely
        var rightMachine = tempDiv.querySelector("#machine-right");
        if (rightMachine) rightMachine.remove();

        display_element.innerHTML = tempDiv.innerHTML;

        selectedMachineSide = "left";
        var machineEl = display_element.querySelector("#machine-left");
        styleMachine(machineEl, theArmIndex);

        // Record arm data
        trial_data.arm_choosenIndex = theArmIndex;
        trial_data.arm_choosenColor = theColor;
        trial_data.arm_rewardAmount = theOutcome;
        trial_data.arm_choosenMean = theMean;
        trial_data.arm_choosenSd = theSd;
        prepareInitialMachineStage({ singleCentered: true, machineEl: machineEl });

        setTextCue("Click the machine to play!");

        var clickStartTime = performance.now();

        function onMachineClick() {
          machineEl.removeEventListener("click", onMachineClick);
          cancelStageRepeat(clickTimeout);
          trial_data.arm_choiceRT = performance.now() - clickStartTime;
          recordMachineRole(theArmIndex);
          hideTextCue();
          machineEl.style.pointerEvents = "none";
          machineEl.classList.add("machine-disabled");
          focusSelectedMachine(machineEl);
          showBallDrop();
        }

        machineEl.addEventListener("click", onMachineClick);

        var clickTimeout = scheduleStageRepeat(
          function () {
            machineEl.removeEventListener("click", onMachineClick);
          },
          showSingleMachine,
          trial.choice_blankpageDuration
        );
      }

      function populateDomeBalls(domeEl, color, mean, sd) {
        var COUNT = 26;
        var GOLDEN_ANGLE = 137.508 * Math.PI / 180;
        var MAX_R = 40;
        var ballMean = mean !== undefined ? mean : theMean;
        var ballSd = sd !== undefined ? sd : theSd;
        var dark = colorToDark(color);
        for (var i = 0; i < COUNT; i++) {
          var angle = i * GOLDEN_ANGLE;
          var r = MAX_R * Math.sqrt((i + 0.5) / COUNT);
          var x = 50 + r * Math.cos(angle);
          var y = 50 + r * Math.sin(angle);
          var ball = document.createElement("div");
          ball.className = "dome-ball";
          ball.style.left = x + "%";
          ball.style.top = y + "%";
          ball.style.backgroundColor = dark;
          ball.dataset.coinValue = String(sampleDomeCoin(ballMean, ballSd));
          ball.textContent = "";
          domeEl.appendChild(ball);
        }
      }

      function runDomePreDropShuffle(machineEl, onComplete) {
        var dome = machineEl.querySelector(".gacha-dome");
        var gachaMachineEl = machineEl.querySelector(".gacha-machine");
        var domeBalls = dome ? Array.from(dome.querySelectorAll(".dome-ball")) : [];
        if (!domeBalls.length) {
          if (typeof onComplete === "function") onComplete();
          return;
        }

        var MAX_R = 40;
        domeBalls.forEach(function (ball) {
          ball.style.backgroundColor = colorToDark(theColor);
          ball.textContent = "";
          ball.style.opacity = "1";
          ball.style.transition = "left 0.11s ease, top 0.11s ease, opacity 0.15s ease";
          ball.style.transform = "translate(-50%, -50%) scale(1)";
        });
        gachaMachineEl.classList.add("shaking");

        var shuffleInterval = setInterval(function () {
          domeBalls.forEach(function (ball) {
            var angle = Math.random() * 2 * Math.PI;
            var r = MAX_R * Math.sqrt(Math.random());
            ball.style.left = (50 + r * Math.cos(angle)) + "%";
            ball.style.top = (50 + r * Math.sin(angle)) + "%";
          });
        }, 110);

        setTimeout(function () {
          clearInterval(shuffleInterval);
          gachaMachineEl.classList.remove("shaking");
          domeBalls.forEach(function (ball) {
            ball.style.transition = "opacity 0.45s ease";
            ball.style.opacity = "0";
          });
          setTimeout(function () {
            domeBalls.forEach(function (ball) {
              ball.style.transition = "";
              ball.style.opacity = "0";
            });
            if (typeof onComplete === "function") onComplete();
          }, 450);
        }, 900);
      }

      function proceedBallDrop(machineEl) {
        pinMachineStage();
        var gachaMachineEl = machineEl.querySelector(".gacha-machine");
        var ballEl = machineEl.querySelector(".gacha-ball");

        gachaMachineEl.classList.add("shaking");

        gachaMachineEl.addEventListener("animationend", function onShakeEnd() {
          gachaMachineEl.removeEventListener("animationend", onShakeEnd);
          gachaMachineEl.classList.remove("shaking");

          ballEl.classList.remove("hidden");
          setDefaultBallDisplay(ballEl);
          ballEl.classList.add("ball-dropping");

          ballEl.addEventListener("animationend", function onDrop() {
            ballEl.removeEventListener("animationend", onDrop);
            setTimeout(function () {
              if (trial.skipBidding) {
                trial_data.info_bidSkipped = true;
                trial_data.info_obtained = trial.predeterminedInfoObtained;
                trial_data.info_paymentForInfo = 0;
                trial_data.info_bidAmount = 0;
                showAutomaticCueAnnouncement(function () {
                  revealInfoAndShowExit(trial.predeterminedInfoObtained);
                });
              } else {
                showInfoBid();
              }
            }, 500);
          }, { once: true });
        }, { once: true });
      }

      // ===================== BALL DROP =====================
      function showBallDrop() {
        var machineEl = getSelectedMachineEl();
        if (trial.infoType !== "C") {
          runDomePreDropShuffle(machineEl, function () {
            proceedBallDrop(machineEl);
          });
        } else {
          proceedBallDrop(machineEl);
        }
      }

      // ===================== INFO BID (BDM) =====================
      function showInfoBid() {
        if (isTimeUp()) { endTrial(); return; }

        pinMachineStage();
        bidCount++;
        bidchoice_made = false;

        setTextCue(buildBidQuestionCue(), true);

        var sliderHTML = buildSliderHTML();
        var sliderDiv = document.createElement("div");
        sliderDiv.innerHTML = sliderHTML;
        var sliderContainer = sliderDiv.firstElementChild;
        display_element.appendChild(sliderContainer);

        var slider = sliderContainer.querySelector("#gachaSlider");
        slider.addEventListener("click", function (e) { e.preventDefault(); });

        var randomStart = parseFloat(((Math.random() * 6 - 3) * (SLIDER_BID_MAX / 8)).toFixed(COIN_DECIMALS));
        slider.value = randomStart;
        var sliderStartValue = randomStart;

        var bidStartTime = performance.now();
        var bidTimeout = null;
        var isSliderDragging = false;

        function detachSliderPointerListeners() {
          slider.removeEventListener("pointerdown", onSliderPointerDown);
          slider.removeEventListener("pointerup", onSliderPointerUp);
          slider.removeEventListener("pointercancel", onSliderPointerUp);
          window.removeEventListener("pointerup", onSliderPointerUp);
        }

        function onSliderPointerDown() {
          isSliderDragging = true;
          cancelStageRepeat(bidTimeout);
        }

        function onSliderPointerUp() {
          if (!isSliderDragging) return;
          isSliderDragging = false;
          if (!bidchoice_made) armBidIdleTimeout();
        }

        slider.addEventListener("pointerdown", onSliderPointerDown);
        slider.addEventListener("pointerup", onSliderPointerUp);
        slider.addEventListener("pointercancel", onSliderPointerUp);
        window.addEventListener("pointerup", onSliderPointerUp);

        function armBidIdleTimeout() {
          if (bidchoice_made || isSliderDragging) return;
          cancelStageRepeat(bidTimeout);
          bidTimeout = scheduleStageRepeat(
            function () {
              detachSliderPointerListeners();
              if (!bidchoice_made) {
                var sliderEl = display_element.querySelector(".gacha-slider-container");
                if (sliderEl) sliderEl.remove();
              }
            },
            function () {
              if (!bidchoice_made) showInfoBid();
            },
            trial.infobidchoice_blankpageDuration,
            {
              fullClear: false,
              isActive: function () { return !bidchoice_made && !isSliderDragging; }
            }
          );
        }

        slider.addEventListener("input", function () {
          slider.setAttribute("aria-valuetext", "");
          slider.removeAttribute("title");
          if (!bidchoice_made && !isSliderDragging) armBidIdleTimeout();
        });

        slider.addEventListener("change", function () {
          detachSliderPointerListeners();
          handleBidInput(sliderStartValue, slider.value, bidStartTime, bidTimeout, sliderContainer);
        });

        armBidIdleTimeout();
      }

      function buildBidLimitLabelHTML(amount) {
        return '<span class="gacha-slider-label-line">' + amount + '</span>' +
          '<span class="gacha-slider-label-line gacha-slider-label-unit">coin</span>';
      }

      function buildZeroNoBidLabelHTML() {
        return '<span class="gacha-slider-label-line">0</span>' +
          '<span class="gacha-slider-label-line gacha-slider-label-desc">No Bid</span>';
      }

      function buildSliderEndLabelHTML(cueName, sideClass) {
        return '<div class="gacha-slider-end-label ' + sideClass + '">' +
          '<span class="gacha-slider-end-label-line">Bid for</span>' +
          '<span class="gacha-slider-end-label-line">' + cueName + '</span>' +
          '</div>';
      }

      function getAutoBlockCueName() {
        if (trial.predeterminedInfoObtained === false) {
          return "Blank Cue";
        }
        return CUE_TYPE_NAMES[trial.infoType] || "Informative Cue";
      }

      function showAutomaticCueAnnouncement(onComplete) {
        pinMachineStage();
        var cueName = getAutoBlockCueName();
        var cueColor = trial.predeterminedInfoObtained ? getInfoTypeColor(trial.infoType) : getNoInfoCueColor();
        setTextCue("You will get a" + coloredCueSpan(cueName, cueColor) + ".", true);
        setTimeout(function () {
          if (typeof onComplete === "function") onComplete();
        }, trial.payMessageDisplayTime);
      }

      function buildSliderHTML() {
        var infoColor = getInfoTypeColor(trial.infoType);
        var infoCueName = CUE_TYPE_NAMES[trial.infoType] || "Informative Cue";
        return '<div class="gacha-slider-container info-type-' + trial.infoType + '" style="' +
          '--info-cue-color:' + infoColor + ';--noinfo-cue-color:' + getNoInfoCueColor() + ';">' +
          buildSliderEndLabelHTML("Non-Informative Cue", "gacha-slider-end-label-left") +
          '<div class="gacha-slider-track-wrapper">' +
            '<div class="gacha-slider-visual-track">' +
              '<div class="gacha-slider-bid-zone"></div>' +
              '<div class="gacha-slider-limit gacha-slider-limit-left"></div>' +
              '<div class="gacha-slider-limit gacha-slider-limit-right"></div>' +
              '<div class="gacha-slider-zero-line"></div>' +
              '<span class="gacha-slider-limit-label gacha-slider-limit-label-left">' + buildBidLimitLabelHTML(SLIDER_BID_LIMIT_LABEL) + '</span>' +
              '<span class="gacha-slider-limit-label gacha-slider-limit-label-right">' + buildBidLimitLabelHTML(SLIDER_BID_LIMIT_LABEL) + '</span>' +
            '</div>' +
            '<span class="gacha-slider-limit-label gacha-slider-zero-label">' + buildZeroNoBidLabelHTML() + '</span>' +
            '<div class="gacha-slider-input-zone">' +
              '<input type="range" id="gachaSlider" min="' + SLIDER_BID_MIN + '" max="' + SLIDER_BID_MAX +
              '" step="' + trial.sliderStep + '" value="0" class="gacha-slider" title="" aria-valuetext="">' +
            '</div>' +
            '<div class="gacha-user-label hidden"></div>' +
            '<div class="gacha-computer-label hidden"></div>' +
            '<div class="gacha-computer-thumb hidden"></div>' +
          '</div>' +
          buildSliderEndLabelHTML(infoCueName, "gacha-slider-end-label-right") +
          '<div class="gacha-bid-result hidden"></div>' +
          '</div>';
      }

      function hideBidCheckpointLabels(sliderContainer) {
        sliderContainer.querySelectorAll(".gacha-slider-limit-label").forEach(function (el) {
          el.classList.add("hidden");
        });
      }

      // ===================== HANDLE BID =====================
      function handleBidInput(sliderStartValue, sliderValue, bidStartTime, bidTimeout, sliderContainer) {
        if (bidchoice_made) return;
        bidchoice_made = true;
        cancelStageRepeat(bidTimeout);
        pinMachineStage();

        var bidRT = performance.now() - bidStartTime;
        var bidValue = parseFloat(sliderValue);

        // Bid amount is always positive regardless of direction.
        // Negative slider position = bidding for No Information; positive = bidding for Preferred Info.
        var bidAmount = Math.abs(bidValue);
        var bidDirection = bidValue < 0 ? "noinfo" : "info";

        // Computer price drawn from [0, sliderMax] — wider than participant bid max on either side,
        // so participants sometimes cannot win the bid they want.
        var computerPrice = parseFloat((Math.random() * COMPUTER_PRICE_MAX).toFixed(COIN_DECIMALS));
        var bidWon = bidAmount >= computerPrice;
        // If the bid was won, the participant gets what they asked for.
        // If lost, they get the opposite (e.g. bid for no-info but lost → info obtained).
        var effectiveInfoObtained = (bidDirection === "info") ? bidWon : !bidWon;
        var paidAmount = bidWon ? computerPrice : 0;

        trial_data.info_type = trial.infoType;
        trial_data.info_bidCount = bidCount;
        trial_data.info_slider_start = sliderStartValue;
        trial_data.info_bidReactionTime = bidRT;
        trial_data.info_bidValue = bidValue;
        trial_data.info_bidAmount = bidAmount;
        trial_data.info_bidDirection = bidDirection;
        trial_data.info_computerPrice = computerPrice;
        trial_data.info_obtained = effectiveInfoObtained;
        trial_data.info_bidWon = bidWon;
        trial_data.info_paymentForInfo = paidAmount;

        var slider = sliderContainer.querySelector("#gachaSlider");
        slider.disabled = true;

        var userPct = bidValueToPct(bidValue);
        // Computer price is always positive; mirror it onto the same side as the user's bid
        // so both indicators appear on the same half of the track.
        var bidSign = bidValue < 0 ? -1 : 1;
        var compPct = priceToPct(bidSign * computerPrice);

        hideBidCheckpointLabels(sliderContainer);

        var userLabel = sliderContainer.querySelector(".gacha-user-label");
        userLabel.innerHTML = "Your Bid: " + formatCoinAmount(bidAmount);
        userLabel.style.left = userPct + "%";
        userLabel.classList.remove("hidden");

        var compLabel = sliderContainer.querySelector(".gacha-computer-label");
        compLabel.innerHTML = "Price: " + formatCoinAmount(computerPrice);
        compLabel.style.left = compPct + "%";
        compLabel.classList.remove("hidden");

        var compThumb = sliderContainer.querySelector(".gacha-computer-thumb");
        compThumb.style.left = compPct + "%";
        compThumb.classList.remove("hidden");

        setTimeout(function () {
          pinMachineStage();
          setTextCue(buildPayMessageText(paidAmount, bidDirection, bidWon), true);

          setTimeout(function () {
            var sliderEl = display_element.querySelector(".gacha-slider-container");
            if (sliderEl) sliderEl.remove();
            pinMachineStage();
            revealInfoAndShowExit(effectiveInfoObtained);
          }, trial.payMessageDisplayTime);
        }, trial.bidDisplayTime);
      }

      // ===================== REVEAL INFO + EXIT WINDOW =====================
      // Info cue and EXIT button appear at the same time.
      // EXIT remains available for the whole window: decision period + waiting period.
      function revealInfoAndShowExit(infoObtained) {
        trial_data.environmentType = envConfig.environmentType;
        trial_data.numberofOffers = envConfig.numberofOffers;
        trial_data.showExitOption = envConfig.showExitOption;
        trial_data.timerScope = envConfig.timerScope;

        if (envConfig.timerScope === "exit_decision_only") {
          if ((window.taDecisionTimeUsed || 0) >= window.experimentTotalTime) {
            trial_data.exitOrStay = "timeout";
            trial_data.exitStay_RT = null;
            finalizeEarnings("exit");
            endTrial();
            return;
          }
        } else if (isTimeUp()) {
          trial_data.exitOrStay = "timeout";
          trial_data.exitStay_RT = null;
          finalizeEarnings("exit");
          endTrial();
          return;
        }

        var machineEl = getSelectedMachineEl();
        if (!machineEl) {
          endTrial();
          return;
        }
        pinMachineStage();

        var ballEl = machineEl.querySelector(".gacha-ball");
        var ballContent = ballEl.querySelector(".ball-content");
        var reward = theOutcome;
        var gachaEpoch = display_element.querySelector("#gachaChoice");
        if (gachaEpoch) gachaEpoch.classList.add("info-exit-phase");

        function prepareForDeposit() {
          hideTextCue();
          stopRewardWaitAnimation(machineEl);
        }

        function hideGachaStageForExit() {
          stopRewardWaitAnimation(machineEl);
          if (gachaEpoch) {
            gachaEpoch.classList.remove("info-exit-phase", "ta-exit-layout", "machine-stage-fixed");
            gachaEpoch.style.visibility = "hidden";
          }
          if (ballEl) {
            ballEl.classList.add("hidden");
            ballEl.classList.remove("ball-dropping", "ball-reveal", "ball-depositing", "ball-pendulum", "ball-wobbling", "ball-face-large");
            if (ballContent) {
              ballContent.textContent = "";
              ballContent.style.fontSize = "";
            }
          }
        }

        function finishStayPath(decisionStartTime) {
          trial_data.exitOrStay = "stay";
          if (decisionStartTime !== null) {
            trial_data.exitStay_RT = performance.now() - decisionStartTime;
          }
          prepareForDeposit();
          endExitDecisionTimer();
          finalizeEarnings("stay");
          showDepositAnimation();
        }

        // --- Show info on ball and info text ---
        if (!infoObtained) {
          ballContent.textContent = "?";
          setTextCue('<span class="gacha-info-line gacha-info-muted">No information available for this trial.</span>', true);
        } else if (trial.infoType === "A") {
          ballContent.textContent = reward;
          trial_data.info_revealed_value = reward;
          setTextCue("You will earn " + emphasisSpan(String(reward)) + " coins from this trial.", true);
        } else if (trial.infoType === "B") {
          var isGood = reward > theMean;
          ballEl.classList.add("ball-face-large");
          ballContent.textContent = isGood ? "\u{1F44D}" : "\u{1F44E}";
          trial_data.info_revealed_valence = isGood ? "good" : "bad";
          var valenceWord = isGood ? "GOOD" : "BAD";
          setTextCue('<span class="gacha-info-line">The reward in this ball is <b>' + valenceWord + "</b>.</span>", true);
        } else if (trial.infoType === "C") {
          var sampleDraws = trial.sampleDraws["arm" + theArmIndex];
          trial_data.info_revealed_samples = sampleDraws;
          var dome = machineEl.querySelector(".gacha-dome");
          var domeBalls = Array.from(dome.querySelectorAll(".dome-ball"));
          revealTypeCExampleBalls(domeBalls, sampleDraws, theColor);

          setTextCue(
            '<span class="gacha-info-line">Here are <b> ' + sampleDraws.length + ' </b> example rewards from other balls in this machine.</span>',
            true
          );
        }

        startRewardWaitAnimation(machineEl);

        if (!envConfig.showExitOption) {
          trial_data.exitOrStay = "stay";
          setTimeout(function () {
            prepareForDeposit();
            finalizeEarnings("stay");
            showDepositAnimation();
          }, trial.rewardWaitDuration);
          return;
        }

        if (envConfig.timerScope === "exit_decision_only") {
          startExitDecisionTimer();
        }

        // --- Show EXIT button at the same time ---
        var decisionStartTime = performance.now();
        var exited = false;

        var exitContainer = document.createElement("div");
        exitContainer.className = "exit-stay-container";

        var promptText = document.createElement("div");
        promptText.className = "exit-stay-prompt";
        promptText.innerHTML = "Press " + emphasisSpan("EXIT") + " to leave now, or stay to wait for this trial's reward.";

        var exitBtn = document.createElement("button");
        exitBtn.type = "button";
        if (trial.exitButtonImage && trial.exitButtonImage.trim() !== "") {
          exitBtn.className = "exit-stay-btn exit-btn-with-image";
          exitBtn.innerHTML =
            '<img class="exit-btn-image" src="' + trial.exitButtonImage + '" alt="Exit">';
        } else {
          exitBtn.className = "exit-stay-btn exit-btn";
          exitBtn.innerHTML = '<span class="exit-stay-icon">&#x2716;</span> EXIT<br><span class="exit-stay-sub">Skip reward, next trial</span>';
        }

        var isTaLayout = envConfig.environmentType === "TA";
        if (isTaLayout && gachaEpoch) {
          gachaEpoch.classList.add("ta-exit-layout");
          exitContainer.classList.add("exit-stay-side");
          exitContainer.appendChild(exitBtn);
          exitContainer.appendChild(promptText);
          appendOverlay(exitContainer);
        } else {
          exitContainer.appendChild(promptText);
          exitContainer.appendChild(exitBtn);
          appendOverlay(exitContainer);
        }

        function handleExit() {
          if (exited) return;
          exited = true;
          clearTimeout(autoRevealTimeout);

          trial_data.exitOrStay = "exit";
          trial_data.exitStay_RT = performance.now() - decisionStartTime;

          hideTextCue();
          exitContainer.remove();
          endExitDecisionTimer();
          hideGachaStageForExit();
          finalizeEarnings("exit");

          setTextCue("You chose to " + emphasisSpan("EXIT") + ". Moving to next trial...", true, true);
          setTimeout(function () {
            ITI();
          }, 1000);
        }

        onExitDecisionTimeout = function () {
          if (exited) return;
          exited = true;
          clearTimeout(autoRevealTimeout);

          trial_data.exitOrStay = "timeout";
          trial_data.exitStay_RT = null;

          hideTextCue();
          exitContainer.remove();
          endExitDecisionTimer();
          hideGachaStageForExit();
          finalizeEarnings("exit");
          endTrial();
        };

        exitBtn.addEventListener("click", handleExit);

        var autoRevealTimeout = setTimeout(function () {
          if (exited) return;
          exited = true;
          exitContainer.remove();
          if (isTaLayout && promptText.parentNode) promptText.remove();
          finishStayPath(decisionStartTime);
        }, trial.exitStayDecisionDuration + trial.rewardWaitDuration);
      }

      // ===================== FINALIZE EARNINGS =====================
      function finalizeEarnings(decision) {
        var paidAmount = trial_data.info_paymentForInfo || 0;
        if (decision === "stay") {
          var netEarnings = theOutcome - paidAmount;
          trial_data.netEarnings_coins = netEarnings;
          trial_data.netEarnings_cents = coinToCents(netEarnings);
          trial_data.netEarnings_dollars = coinToDollars(netEarnings);
          trial_data.rewardCollected = true;
        } else {
          trial_data.netEarnings_coins = -paidAmount;
          trial_data.netEarnings_cents = coinToCents(-paidAmount);
          trial_data.netEarnings_dollars = coinToDollars(-paidAmount);
          trial_data.rewardCollected = false;
        }
      }

      // ===================== DEPOSIT BALL ANIMATION =====================
      function getBallFillColor(ballEl) {
        if (!ballEl) return theColor || "red";
        var bg = ballEl.style.backgroundColor;
        if (bg && bg !== "transparent") return bg;
        return theColor || "red";
      }

      function copyElementTextStyles(sourceEl, targetEl, fontScale) {
        if (!sourceEl || !targetEl) return;
        fontScale = fontScale || 1;
        var cs = window.getComputedStyle(sourceEl);
        var textProps = [
          "color",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "fontStyle",
          "lineHeight",
          "letterSpacing",
          "textShadow",
          "fontVariant",
          "textTransform",
          "webkitTextStroke",
          "textAlign",
        ];
        textProps.forEach(function (prop) {
          var value = cs[prop];
          if (!value) return;
          if (prop === "fontSize" && fontScale !== 1) {
            var px = parseFloat(value);
            if (!isNaN(px)) value = (px * fontScale) + "px";
          }
          targetEl.style[prop] = value;
        });
      }

      function applyFlyingBallLayout(flyingBall, ballEl, ballRect) {
        var size = Math.max(ballRect.width, ballRect.height, 32);
        flyingBall.style.position = "fixed";
        flyingBall.style.width = size + "px";
        flyingBall.style.height = size + "px";
        flyingBall.style.minWidth = size + "px";
        flyingBall.style.minHeight = size + "px";
        flyingBall.style.maxWidth = size + "px";
        flyingBall.style.maxHeight = size + "px";
        flyingBall.style.borderRadius = "50%";
        flyingBall.style.boxSizing = "border-box";
        flyingBall.style.overflow = "hidden";
        flyingBall.style.display = "flex";
        flyingBall.style.alignItems = "center";
        flyingBall.style.justifyContent = "center";
        flyingBall.style.flexShrink = "0";
        flyingBall.style.transformOrigin = "center center";
        flyingBall.style.transform = "translate(-50%, -50%)";
      }

      function createFlyingBallClone(ballEl, ballContent, ballRect) {
        var clone = document.createElement("div");
        clone.className = "gacha-ball gacha-flying-ball";
        if (ballEl.classList.contains("ball-face-large")) {
          clone.classList.add("ball-face-large");
        }
        clone.style.backgroundColor = getBallFillColor(ballEl);
        if (ballContent && ballContent.textContent) {
          var inner = document.createElement("span");
          inner.className = "ball-content";
          inner.textContent = ballContent.textContent;
          clone.appendChild(inner);
          var layoutWidth = ballEl.offsetWidth || ballRect.width;
          var fontScale = layoutWidth > 0 ? ballRect.width / layoutWidth : 1;
          copyElementTextStyles(ballContent, inner, fontScale);
        }
        return clone;
      }

      function resetTrialVisualsAfterDeposit(machineEl) {
        if (!machineEl) return;
        var gb = machineEl.querySelector(".gacha-ball");
        if (gb) {
          gb.style.visibility = "";
          setDefaultBallDisplay(gb);
          gb.classList.add("hidden");
          gb.classList.remove("ball-dropping", "ball-reveal", "ball-depositing", "ball-pendulum", "ball-wobbling", "ball-face-large");
        }
        var dome = machineEl.querySelector(".gacha-dome");
        var domeBalls = dome ? Array.from(dome.querySelectorAll(".dome-ball")) : [];
        domeBalls.forEach(function (b) {
          b.classList.remove("ball-visible", "dome-ball-example");
          b.style.backgroundColor = "";
          b.style.opacity = "";
          b.style.transition = "";
          b.style.transform = "";
          b.textContent = "";
        });
      }

      function showDepositAnimation() {
        var machineEl = getSelectedMachineEl();
        if (!machineEl) {
          ITI();
          return;
        }
        pinMachineStage();
        stopRewardWaitAnimation(machineEl);

        var ballEl = machineEl.querySelector(".gacha-ball");
        var ballContent = ballEl ? ballEl.querySelector(".ball-content") : null;
        var rewardDisplay = display_element.querySelector(".gacha-reward-display");
        if (rewardDisplay) {
          rewardDisplay.classList.add("hidden");
          rewardDisplay.innerHTML = "";
        }

        if (ballEl) {
          ballEl.classList.remove("ball-dropping", "ball-reveal", "ball-depositing", "ball-pendulum", "ball-wobbling");
          ballEl.classList.remove("hidden");
          ballEl.style.visibility = "visible";
        }

        setTextCue("Deposit the ball into your wallet.");

        var wallet = document.createElement("div");
        wallet.className = "participant-wallet";
        wallet.innerHTML =
          '<div class="wallet-icon" aria-hidden="true"></div>' +
          '<span class="wallet-label">Your wallet</span>';

        appendOverlay(wallet);

        if (!ballEl) {
          setTimeout(function () {
            hideTextCue();
            wallet.remove();
            ITI();
          }, 1200);
          return;
        }

        var ballRect = ballEl.getBoundingClientRect();
        var flyingBall = createFlyingBallClone(ballEl, ballContent, ballRect);
        applyFlyingBallLayout(flyingBall, ballEl, ballRect);
        var startX = ballRect.left + ballRect.width / 2;
        var startY = ballRect.top + ballRect.height / 2;
        flyingBall.style.left = startX + "px";
        flyingBall.style.top = startY + "px";
        flyingBall.style.zIndex = "26";
        document.body.appendChild(flyingBall);
        ballEl.style.visibility = "hidden";

        var finished = false;
        function finishDeposit() {
          if (finished) return;
          finished = true;
          if (flyingBall.parentNode) flyingBall.remove();
          hideTextCue();
          wallet.remove();
          resetTrialVisualsAfterDeposit(machineEl);
          ITI();
        }

        requestAnimationFrame(function () {
          var walletRect = wallet.querySelector(".wallet-icon").getBoundingClientRect();
          var endX = walletRect.left + walletRect.width / 2;
          var endY = walletRect.top + walletRect.height / 2;
          var dx = endX - startX;
          var dy = endY - startY;
          wallet.classList.add("wallet-receiving");

          if (typeof flyingBall.animate === "function") {
            var depositAnim = flyingBall.animate(
              [
                {
                  transform: "translate(-50%, -50%) translate(0px, 0px) scale(1)",
                  opacity: 1,
                },
                {
                  transform: "translate(-50%, -50%) translate(" + dx + "px, " + dy + "px) scale(0.55)",
                  opacity: 0.95,
                },
              ],
              {
                duration: 2000,
                easing: "cubic-bezier(0.33, 0, 0.2, 1)",
                fill: "forwards",
              }
            );
            depositAnim.onfinish = finishDeposit;
          } else {
            flyingBall.style.setProperty("--fly-dx", dx + "px");
            flyingBall.style.setProperty("--fly-dy", dy + "px");
            flyingBall.classList.add("ball-flying-to-wallet");
            flyingBall.addEventListener("animationend", function onBallLand(ev) {
              if (ev.target !== flyingBall) return;
              flyingBall.removeEventListener("animationend", onBallLand);
              finishDeposit();
            });
          }
        });

        setTimeout(finishDeposit, 2600);
      }

      // ===================== ITI =====================
      function ITI() {
        removeTextCue();
        display_element.innerHTML = "";
        setTimeout(function () {
          endTrial();
        }, trial.ITIduration);
      }

      var endTrial = () => {
        endExitDecisionTimer();
        if (!(envConfig.showTimer && envConfig.timerScope === "exit_decision_only")) {
          removeTimerElement();
        }
        onExitDecisionTimeout = null;
        _self.jsPsych.pluginAPI.clearAllTimeouts();
        removeTextCue();
        display_element.innerHTML = "";

        trial_data.trialDuration = performance.now() - trialStartTime;
        trial_data.environmentType = envConfig.environmentType;
        trial_data.numberofOffers = envConfig.numberofOffers;
        trial_data.showExitOption = envConfig.showExitOption;
        trial_data.timerScope = envConfig.timerScope;
        trial_data.participant_info_type_colors = INFO_TYPE_COLORS;

        var remaining = getTimeRemaining();
        if (remaining !== null) {
          trial_data.timeRemaining = remaining;
          if (envConfig.timerScope === "exit_decision_only") {
            trial_data.timeElapsed = window.taDecisionTimeUsed || 0;
          } else {
            trial_data.timeElapsed = window.experimentTotalTime - remaining;
          }
        }

        _self.jsPsych.finishTrial(trial_data);
      };

      // ===================== COLOR HELPERS =====================
      function colorToRGBA(color, alpha) {
        var map = {
          red: "rgba(220, 53, 69, " + alpha + ")",
          blue: "rgba(0, 123, 255, " + alpha + ")",
          green: "rgba(40, 167, 69, " + alpha + ")",
          purple: "rgba(111, 66, 193, " + alpha + ")",
          orange: "rgba(253, 126, 20, " + alpha + ")",
        };
        return map[color] || "rgba(128, 128, 128, " + alpha + ")";
      }

      function colorToDark(color) {
        var map = {
          red: "#a71d2a",
          blue: "#004085",
          green: "#155724",
          purple: "#4a1a8a",
          orange: "#c45e00",
        };
        return map[color] || "#444";
      }

      function colorToLight(color) {
        var map = {
          red: "rgba(220, 53, 69, 0.25)",
          blue: "rgba(0, 123, 255, 0.25)",
          green: "rgba(40, 167, 69, 0.25)",
          purple: "rgba(111, 66, 193, 0.25)",
          orange: "rgba(253, 126, 20, 0.25)",
        };
        return map[color] || "rgba(128, 128, 128, 0.25)";
      }

      // ===================== START =====================
      showFixation();
    }
  }

  jsPsychGachaBDMTaskPlugin.info = info;
  return jsPsychGachaBDMTaskPlugin;
})(jsPsychModule);
