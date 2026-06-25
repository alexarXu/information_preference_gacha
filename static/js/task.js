// create psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var checkpointInterval = 1; // Save data every 1 trial

var jsPsych = initJsPsych({
  on_data_update: (data) => {
    // Correct context for `this` to access `psiTurk`
    psiTurk.recordTrialData(data);

    // If you want to savwe data every 10 trials
    // Save data intermittently
    // if (jsPsych.data.get().count() % checkpointInterval === 0) {
    //   psiTurk.saveData();
    // }

    // // If you want to save data at any time there is a change in the data
    // psiTurk.saveData();
  },
  on_finish: (data) => {
    disableFullscreenExitReminder();
    psiTurk.saveData();
  },
  // Add any additional configuration options for jsPsych here
});

var fullscreenExitReminderActive = false;

function isDocumentFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function enterDocumentFullscreen() {
  var el = document.documentElement;
  var request =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (!request) {
    return Promise.resolve(false);
  }
  return Promise.resolve(request.call(el)).then(function () {
    return true;
  }).catch(function () {
    return false;
  });
}

function ensureFullscreenExitReminderElement() {
  var overlay = document.getElementById("fullscreen-exit-reminder");
  if (overlay) {
    return overlay;
  }
  overlay = document.createElement("div");
  overlay.id = "fullscreen-exit-reminder";
  overlay.innerHTML =
    '<div class="fullscreen-exit-reminder-panel" role="dialog" aria-modal="true" aria-labelledby="fullscreen-exit-reminder-title">' +
    '<p id="fullscreen-exit-reminder-title" class="fullscreen-exit-reminder-title">Please return to full screen</p>' +
    '<p class="fullscreen-exit-reminder-text">This experiment should be completed in full screen mode. Please click the button below to continue.</p>' +
    '<button type="button" id="fullscreen-reenter-btn" class="jspsych-btn fullscreen-reenter-btn">Return to full screen</button>' +
    "</div>";
  document.body.appendChild(overlay);
  overlay.querySelector("#fullscreen-reenter-btn").addEventListener("click", function () {
    enterDocumentFullscreen();
  });
  return overlay;
}

function showFullscreenExitReminder() {
  if (!fullscreenExitReminderActive || isDocumentFullscreen()) {
    return;
  }
  ensureFullscreenExitReminderElement().classList.add("visible");
}

function hideFullscreenExitReminder() {
  var overlay = document.getElementById("fullscreen-exit-reminder");
  if (overlay) {
    overlay.classList.remove("visible");
  }
}

function handleFullscreenChange() {
  if (!fullscreenExitReminderActive) {
    return;
  }
  if (isDocumentFullscreen()) {
    hideFullscreenExitReminder();
  } else {
    showFullscreenExitReminder();
  }
}

function setupFullscreenExitReminder() {
  if (window._fullscreenExitReminderSetup) {
    return;
  }
  window._fullscreenExitReminderSetup = true;
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
}

function enableFullscreenExitReminder() {
  fullscreenExitReminderActive = true;
  setupFullscreenExitReminder();
  if (!isDocumentFullscreen()) {
    showFullscreenExitReminder();
  }
}

function disableFullscreenExitReminder() {
  fullscreenExitReminderActive = false;
  hideFullscreenExitReminder();
}

setupFullscreenExitReminder();

//////////////////////////// THE BASIC PARAMETERS OF THE EXPERIMENT, CHANGE AS YOU WISH ///////////////

///// Define which phase of the experiment is running ///////////////////////////

/// DEFINE THE RUN MODE OF THE TASK ////
var platform = "Prolific"; // MTurk or Prolific
if (platform == "Prolific") {
  var PROLIFIC_CODE = "C94XWQP4";
}
var runMode = "real";
var useEnvironmentBlocks = true;
// New parameters for blocks
// Ball rewards are integers in [minCoinNum, maxCoinNum] (currently 1–9).
// Gaussian means/SDs below are on that same scale.
var minCoinNum = 1;
var maxCoinNum = 9;
var coinToCentRate = 1; // 1 coin = 1 cent
var coinToDollarRate = 0.02; // 1 coin = $0.02

var meanHigh = 7;
var meanMediumMedium = 6;
var meanMediumLow = 4;
var meanLow = 3;
var sdLow = 1;
var sdHigh = 2;
var armSdIndicators = ["Low Variance", "High Variance"];
var armIndicatorsCombinations = [];
for (var i = 0; i < armSdIndicators.length; i++) {
  for (var j = 0; j < armSdIndicators.length; j++) {
    armIndicatorsCombinations.push([armSdIndicators[i], armSdIndicators[j]]);
  }
}

// plot the distribution of the rewards: for the Basic room and Time Budget room

// Define means arrays
const means_lowEr_mediumDiff = [
  [7, 3], [7, 3], [7, 3], [7, 3]
];

const means_mediumEr_mediumDiff = [
  [7, 4], [7, 4], [7, 4], [7, 4]
];

const means_highEr_mediumDiff = [
  [7, 5], [7, 5], [7, 5], [7, 5]
];

// Define practice environment blocks (built after createEnvironmentBlock is defined below).
function buildPracticeEnvironmentBlockDesign() {
  var blocks = [];
  var blockId = 1;
  var practiceMeans = means_mediumEr_mediumDiff[0];
  BLOCK_ENVIRONMENTS.forEach(function (env) {
    BLOCK_INFO_TYPES.forEach(function (infoType) {
      blocks.push(createEnvironmentBlock(
        env,
        infoType,
        practiceMeans[0] + 1,
        practiceMeans[1] + 1,
        sdHigh,
        sdLow,
        blockId++
      ));
    });
  });
  return blocks;
}

// Block creation function
function createBlock(mean1, mean2, sd1, sd2, blockSdCaseInd, blockSdInd, blockId, blockErId, blockSdId, blockDiffId, forcedInfo = { enabled: false, timing: "" }, armColorsSame = false, this_block_color = "", this_block_color_ind = null) {
  return {
    blockId: blockId,
    blockErId: blockErId,
    blockSdId: blockSdId,
    blockDiffId: blockDiffId, // this was typed wrong in the launch of 9/13/2024
    armColorsSame: armColorsSame,
    armMeansSame: mean1 === mean2,
    armSdSame: sd1 === sd2,
    mean1,
    mean2,
    sd1,
    sd2,
    blockSdCase: armIndicatorsCombinations[blockSdInd],
    blockSdCaseInd,
    blockSdInd,
    forcedInfo,
    ...(this_block_color && { this_block_color }),
    ...(this_block_color_ind !== null && { this_block_color_ind })
  };
}

var BLOCK_INFO_CUE_NAMES = {
  A: "Exact Cue",
  B: "Rating Cue",
  C: "Machine Cue",
  D: "Blank Cue",
};

var BLOCK_ROOM_NAMES = {
  NI: "Basic Room",
  TA: "Time Budget Room",
  CA: "Learning Room",
};

var BLOCK_ROOM_SHORT_DESCRIPTIONS = {
  NI: "a room with one machine where you always wait for the ball to be delivered",
  TA: "a room with a limited time budget where you can skip waiting for a ball",
  CA: "a room where you choose between two machines and learn which one gives more coins",
};

var BLOCK_CUE_SHORT_DESCRIPTIONS = {
  A: "know exactly how many coins are in your ball",
  B: "know whether the number of coins is better or worse than average",
  C: "know how many coins the machine typically produces",
  D: "learn anything about the coins in your ball",
};

// Fixed room order per participant: Basic → Time Budget → Learning.
var BLOCK_ENVIRONMENTS = ["NI", "TA", "CA"];
var BLOCK_INFO_TYPES = ["A", "B", "C", "D"];
var BLOCK_BDM_INFO_TYPES = ["A", "B", "C"];
var REAL_BLOCK_TRIALS_FIXED = 10;
var TA_BLOCK_TIME_BUDGET_MS = 90 * 1000;
var TA_BLOCK_TIME_BUDGET_LABEL = "1:30";
var TA_BLOCK_MAX_TRIALS = 60;

function createEnvironmentBlock(environmentType, blockInfoType, mean1, mean2, sd1, sd2, blockId, blockOptions) {
  blockOptions = blockOptions || {};
  var blockColorInd = blockOptions.blockColorInd !== undefined
    ? blockOptions.blockColorInd
    : (Math.random() < 0.5 ? 0 : 1);
  var blockColorName = blockColorInd === 0 ? "red" : "blue";
  var base = createBlock(
    mean1,
    mean2,
    sd1,
    sd2,
    [0, 1],
    1,
    blockId,
    0,
    1,
    0,
    { enabled: false, timing: "" },
    true,
    blockColorName,
    blockColorInd
  );
  var envSettings = {
    NI: { numberofOffers: 1, showExitOption: false, showTimer: false, timerScope: "none" },
    TA: { numberofOffers: 1, showExitOption: true, showTimer: true, timerScope: "exit_decision_only" },
    CA: { numberofOffers: 2, showExitOption: false, showTimer: false, timerScope: "none" },
  }[environmentType];
  var skipBidding = !!blockOptions.skipBidding;
  var isBlankBlock = blockInfoType === "D";
  var blockLength = environmentType === "TA" ? TA_BLOCK_MAX_TRIALS : REAL_BLOCK_TRIALS_FIXED;
  var blockFields = {
    environmentType: environmentType,
    blockInfoType: blockInfoType,
    skipBidding: skipBidding,
    predeterminedInfoObtained: skipBidding ? !isBlankBlock : undefined,
    blockLength: blockLength,
    blockPhase: blockOptions.blockPhase || "",
  };
  if (environmentType === "TA") {
    blockFields.timeBudgetMs = TA_BLOCK_TIME_BUDGET_MS;
  }
  return Object.assign({}, base, blockFields, envSettings);
}

function buildAutoCueBlockDesign() {
  var blocks = [];
  var blockId = 101;
  var defaultMeans = means_lowEr_mediumDiff[0];
  BLOCK_ENVIRONMENTS.forEach(function (env) {
    var infoOrder = jsPsych.randomization.shuffle(BLOCK_INFO_TYPES.slice());
    infoOrder.forEach(function (infoType) {
      blocks.push(createEnvironmentBlock(
        env,
        infoType,
        defaultMeans[0],
        defaultMeans[1],
        sdLow,
        sdHigh,
        blockId++,
        { skipBidding: true, blockPhase: "autoCue" }
      ));
    });
  });
  return blocks;
}

function buildBdmBlockDesign() {
  var blocks = [];
  var blockId = 201;
  var defaultMeans = means_lowEr_mediumDiff[0];
  BLOCK_ENVIRONMENTS.forEach(function (env) {
    var infoOrder = jsPsych.randomization.shuffle(BLOCK_BDM_INFO_TYPES.slice());
    infoOrder.forEach(function (infoType) {
      blocks.push(createEnvironmentBlock(
        env,
        infoType,
        defaultMeans[0],
        defaultMeans[1],
        sdLow,
        sdHigh,
        blockId++,
        { skipBidding: false, blockPhase: "bdm" }
      ));
    });
  });
  return blocks;
}

function buildEnvironmentBlockDesign() {
  return buildAutoCueBlockDesign().concat(buildBdmBlockDesign());
}

var fullAutoCueBlockDesign = buildAutoCueBlockDesign();
var fullBdmBlockDesign = buildBdmBlockDesign();
var AUTO_CUE_BLOCK_COUNT = fullAutoCueBlockDesign.length;
var BDM_BLOCK_COUNT = fullBdmBlockDesign.length;
var environmentBlockDistributions = fullAutoCueBlockDesign.concat(fullBdmBlockDesign);

// Welcome-page procedure summary: true = Part 1 / BDM instructions / Part 2 steps; false = one-line main task step
var detailedInstruction = true;

var blockDistributions_practice = buildPracticeEnvironmentBlockDesign();
var blockDistributions = environmentBlockDistributions;
var experimentconfig = setupExperimentConfiguration(runMode);
if (useEnvironmentBlocks) {
  experimentconfig.showPractice = false;
}
// Fast local dev: shorter blocks, skip practice/debrief. Auto-off on Heroku/production hosts.
var LOCAL_DEV_FAST_REAL_BLOCKS = typeof isLocalDevHost !== "undefined" && isLocalDevHost;
var LOCAL_DEV_PART1_BLOCK_COUNT = 2;
var LOCAL_DEV_PART2_BLOCK_COUNT = 2;
if (LOCAL_DEV_FAST_REAL_BLOCKS) {
  environmentBlockDistributions = fullAutoCueBlockDesign.slice(0, LOCAL_DEV_PART1_BLOCK_COUNT).concat(
    fullBdmBlockDesign.slice(0, LOCAL_DEV_PART2_BLOCK_COUNT)
  );
  blockDistributions = environmentBlockDistributions;
  AUTO_CUE_BLOCK_COUNT = LOCAL_DEV_PART1_BLOCK_COUNT;
  BDM_BLOCK_COUNT = LOCAL_DEV_PART2_BLOCK_COUNT;
  experimentconfig.showPractice = false;
  experimentconfig.showFutureStudy = false;
  experimentconfig.showFinishExperiment = false;
}

//////////////////////// Trial Epochs  //////////////////////////

var maxImageHeight = "40%";
var maxImageWidth = "60%";
var maxVideoHeight = "48vh";
var maxVideoWidth = "92vw";

//////////////////// Time of each epoch //////////////////////////

// Fixation
var fixation_duration = 5000;
var fixation_duration_estimation_min = 500;
var fixation_duration_estimation_max = 3000;
var fixation_blankpageDuration = 3000;

// Choice
var choice_duration = 5000;
var choice_duration_estimation_min = 500;
var choice_duration_estimation_max = 3000;
var choice_blankpageDuration = 3000;

// Choice movement animation
var choiceMovementAnimation_duration = 250;
// Info Bid
var infobidchoiceduration = 5000;
var infobidchoiceduration_estimation_min = 500;
var infobidchoiceduration_estimation_max = 3000;
var infobidchoice_blankpageDuration = 3000;
var bidDisplayTime = 2000;
var payMessageDisplayTime = 2000;
var infoBid_clearDuration = 3000;

// Info Animation (legacy timing estimate only)

// Outcome Animation
var outcomeDuration = 5000;

// ITI
var ITIduration = 1000;

// Used in total-time estimates below and in trial plugin params
var rewardWaitDuration = 10000;
var exitStayDecisionDuration = 3000;

// Total trial time, min and max
var totalTrialTime_min = fixation_duration_estimation_min + choice_duration_estimation_min + choiceMovementAnimation_duration + infobidchoiceduration_estimation_min + rewardWaitDuration + ITIduration;
var totalTrialTime_max = fixation_duration_estimation_max + choice_duration_estimation_max + choiceMovementAnimation_duration + infobidchoiceduration_estimation_max + rewardWaitDuration + exitStayDecisionDuration + ITIduration;

/////////////// Basic parameters  /////////////////////////////////////
// lengths for real block
var blockLength_real = REAL_BLOCK_TRIALS_FIXED; // fixed trials per non-TA real block
var blockCount_real = blockDistributions.length; // number of blocks in the real task (21)
var blockBreakDurationMinutes = 5; // mandatory break countdown when participant chooses "Take a break"
var blockBreakDurationMs = blockBreakDurationMinutes * 60 * 1000;
var blockBreakReadyButtonLabel = "I am ready for next block!";
// Used for balancing the higher-reward color across blocks with different arms
var blockCounts_real_diffArms = blockCount_real;
// lengths for practice block
var blockLength_practice = useEnvironmentBlocks ? 1 : 10; // one trial per env×info combo in environment design
var practiceTrialCount = useEnvironmentBlocks
  ? BLOCK_ENVIRONMENTS.length * BLOCK_INFO_TYPES.length
  : blockLength_practice;
var blockCount_practice = practiceTrialCount;
var practiceTrials_coinNum = 6;
var participantInfoTypeColors = randomizeParticipantInfoTypeColors();
window.participantInfoTypeColors = participantInfoTypeColors;
var instructionQuestionPayment = 5; // pay 5 dollars for instructions + questions
var finishExperimentPayment = 5; // pay 5 dollars for finishing the experiment 
var questionNum = comprehensionQuestionCount(useEnvironmentBlocks, { includeBiddingQuestions: false });
var bdmQuestionNum = comprehensionQuestionCount(useEnvironmentBlocks, { biddingQuestionsOnly: true });
var instructions_bidExamples = 5;
var instructions_bidExamples_lowprize = 3;
var instructions_bidExamples_highprize = 7;

// ==================== Gacha instruction parameters ====================
// Single source of truth for numbers referenced in instructions.js templates.
// Plugin trial params (gachaMaxBid, sliderMax) should stay aligned with these.
// Bid range ±gachaMaxBid (was ±8, now ±1). Limit labels show gachaMaxBidLabel.
// Computer price drawn from [0, gachaSliderMax] with gachaSliderMax = 1.25 (±1.25 on visual scale).
var gachaMaxBid = 1;
var gachaMaxBidLabel = 1;
var gachaSliderMax = gachaMaxBid * (10 / 8); // 1.25
var gachaSliderStep = 0.01;
var gachaSliderRandomStart = 4 * (gachaMaxBid / 8);
var distributionType = "gaussian";
var initialInformativeCueProbabilityPercent = 50;
var automaticForcedBidAmount = gachaSliderMax;
var learningRoomTrials = blockLength_real;
var totalSessionTimeBudget = TA_BLOCK_TIME_BUDGET_MS;
var totalSessionMinutes = TA_BLOCK_TIME_BUDGET_LABEL;

var instructionPages_times_sec = getInstructionPageMinTimesSec(useEnvironmentBlocks);
var instructionPages_times = instructionPages_times_sec.map(function (x) { return x * 1000; });
var totalInstructionTimeMin = instructionPages_times.reduce(function (a, b) { return a + b; }, 0);
var totalInstructionTimeExpected = 40 * 60 * 1000; // 40 minutes for instructions and questions and anythine else
var totalLength = blockCount_real * blockLength_real;

var totalMinPayment_mainTask = meanLow * totalLength;
totalMinPayment_mainTask = Math.round(totalMinPayment_mainTask * coinToDollarRate);
var totalMinPayment = totalMinPayment_mainTask + instructionQuestionPayment;

var totalMaxPayment_mainTask = meanHigh * totalLength;
totalMaxPayment_mainTask = Math.round(totalMaxPayment_mainTask * coinToDollarRate);
var totalMaxPayment = totalMaxPayment_mainTask + instructionQuestionPayment;
var totalAveragePayment = (totalMinPayment + totalMaxPayment) / 2;

let earnings_maintask = calculateEarnings(blockDistributions, blockLength_real);
let earnings_total = {
  maxEarnings: earnings_maintask.maxEarnings + instructionQuestionPayment + finishExperimentPayment,
  minEarnings: earnings_maintask.minEarnings + instructionQuestionPayment + finishExperimentPayment,
  avgEarnings: earnings_maintask.avgEarnings + instructionQuestionPayment + finishExperimentPayment,
};

// minimum and maximum block times
var blockTimeMs_min = totalTrialTime_min * blockLength_real;
var blockTimeMinutes_min = blockTimeMs_min / (1000 * 60);
var blockTimeMinutes_min_rounded = Math.ceil(blockTimeMinutes_min);
blockTimeMinutes_min_rounded = roundToNearestFive(blockTimeMinutes_min_rounded);
// maximum block time
var blockTimeMs_max = totalTrialTime_max * blockLength_real;
var blockTimeMinutes_max = blockTimeMs_max / (1000 * 60);
var blockTimeMinutes_max_rounded = Math.ceil(blockTimeMinutes_max);
blockTimeMinutes_max_rounded = roundToNearestFive(blockTimeMinutes_max_rounded);
var blockTimeMinutes_average_rounded = (blockTimeMinutes_min_rounded + blockTimeMinutes_max_rounded) / 2;

// minimum and maximum total task times
var totalTimeMs_min = totalTrialTime_min * (blockCount_real * blockLength_real + practiceTrialCount);
totalTimeMs_min = totalTimeMs_min + totalInstructionTimeExpected; // 40 minutes for instructions and questions and anythine else
var totalTimeMinutes_min = totalTimeMs_min / (1000 * 60);
var totalTimeMinutes_min_rounded = Math.ceil(totalTimeMinutes_min);
totalTimeMinutes_min_rounded = roundToNearestFive(totalTimeMinutes_min_rounded);
var totalTimeHours_min = totalTimeMinutes_min / 60;
var totalTimeHours_min_rounded = totalTimeMinutes_min_rounded / 60;

var totalTimeMs_max = totalTrialTime_max * (blockCount_real * blockLength_real + practiceTrialCount);
totalTimeMs_max = totalTimeMs_max + totalInstructionTimeExpected; // 40 minutes for instructions and questions and anythine else
var totalTimeMinutes_max = totalTimeMs_max / (1000 * 60);
var totalTimeMinutes_max_rounded = Math.ceil(totalTimeMinutes_max);
totalTimeMinutes_max_rounded = roundToNearestFive(totalTimeMinutes_max_rounded);
totalTimeMinutes_max_rounded = totalTimeMinutes_max_rounded + 50; // Add 30 minutes for the maximum time
var totalTimeHours_max = totalTimeMinutes_max / 60;
var totalTimeHours_max_rounded = totalTimeMinutes_max_rounded / 60;

var totalTimeHours_average_rounded = (totalTimeHours_min_rounded + totalTimeHours_max_rounded) / 2;

var averagePayPerHour = Math.round(earnings_total.avgEarnings / totalTimeHours_max_rounded);
var averagePayPerHour_max = Math.round(earnings_total.maxEarnings / totalTimeHours_max_rounded);
var averagePayPerHour_min = Math.round(earnings_total.minEarnings / totalTimeHours_max_rounded);

// Here define the session parameters
var optOutOrRepeatCount = 0;
var preQuestionsCount = 0;

/////////////  PRELOAD HTML TEMPLATE PAGE STRUCTURES ///////////////////////
var pages = ["trialStages/fixation.html", "trialStages/gachaChoice.html"];
psiTurk.preloadPages(pages);

////////////////////////////////////////////////////////// TIMELINE STARTS /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////// EXPERIMENT STARTS /////////////////////////////////////////////////////////////////////////
var currentPage = 0;
////////////////////////////////////////////// HERE DEFINE THE INSTRUCTIONS AND PUSH THEM TO TIMELINE ////////////////////////////////////////////////////
var gachaInstructionParams = {
  questionNum: questionNum,
  practiceblockLength: practiceTrialCount,
  totalLength: totalLength,
  totalTimeMinutes_min_rounded: totalTimeMinutes_min_rounded,
  totalTimeMinutes_max_rounded: totalTimeMinutes_max_rounded,
  blockTimeMinutes_average_rounded: blockTimeMinutes_average_rounded,
  blockCount_real: blockCount_real,
  blockLength_real: blockLength_real,
  averagePayPerHour_min: averagePayPerHour_min,
  averagePayPerHour_max: averagePayPerHour_max,
  fixation_duration: fixation_duration,
  choice_duration: choice_duration,
  infobidchoiceduration: infobidchoiceduration,
  ITIduration: ITIduration,
  itiSeconds: ITIduration / 1000,
  finishExperimentPayment: finishExperimentPayment,
  useEnvironmentBlocks: useEnvironmentBlocks,
  showPractice: experimentconfig.showPractice,
  detailedInstruction: detailedInstruction,
  bdmQuestionNum: bdmQuestionNum,
  totalSessionMinutes: totalSessionMinutes,
  gachaSliderMax: gachaSliderMax,
  gachaMaxBid: gachaMaxBid,
  gachaMaxBidLabel: gachaMaxBidLabel,
  learningRoomTrials: learningRoomTrials,
  initialInformativeCueProbabilityPercent: initialInformativeCueProbabilityPercent,
  automaticForcedBidAmount: automaticForcedBidAmount,
  taBlockTimeBudgetLabel: TA_BLOCK_TIME_BUDGET_LABEL,
  coinToCentRate: coinToCentRate,
};

// Instruction media tags (gacha)
var imageTags = {};
var videoTags = {};
createGachaInstructionTags(maxImageHeight, maxImageWidth, maxVideoHeight, maxVideoWidth);

var instructionTitles = makeInstructionTitles();
var instructions = makeInstructions(instructionTitles, gachaInstructionParams);
var bdmInstructions = makeBdmInstructions(instructionTitles, gachaInstructionParams);

////////////////////////////////////////////////////// DEFINE FINISH EXPERIMENT SCREEN /////////////////////////////////////////////////
var endExperimentString = "";
if (platform == "MTurk") {
  endExperimentString = '<p style="font-size:30px;">We will send your earnings within the next few days. Please press any key to finish the experiment.</p>';
} else if (platform == "Prolific") {
  endExperimentString =
    `<p style="font-size:30px;">We will send your earnings within the next few days.</p>
    <p style="font-size:30px;">Your completion code is <b>${PROLIFIC_CODE}</b>. Please click the button below to submit the task.</p>
    <button id="prolific-link" style="font-size:30px;">Submit to Prolific</button>`;
}

var earnings;
var finishExperiment = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size:30px;">Thank you for participating in our experiment! We really appreciate your efforts.</p>',
  choices: [" "],
  on_start: function (trial) {
    var realTrialData = jsPsych.data
      .get()
      .filterCustom(function (trial) {
        return trial.taskStage && trial.taskStage.startsWith("realTrials_block");
      });

    earnings = realTrialData.select("netEarnings_dollars").sum();
    earnings = earnings + instructionQuestionPayment + finishExperimentPayment;

    var totalTrials = realTrialData.count();
    var stayTrials = realTrialData.filterCustom(function(t) { return t.exitOrStay === "stay"; }).count();
    var exitTrials = realTrialData.filterCustom(function(t) { return t.exitOrStay === "exit" || t.exitOrStay === "timeout_exit"; }).count();

    trial.stimulus += '<p style="font-size:30px;">You have earned a total of <b>$ ' + earnings.toFixed(2) + '</b> in this experiment!</p>';
    trial.stimulus += '<p style="font-size:24px;">You completed <b>' + totalTrials + '</b> trials (' + stayTrials + ' stayed, ' + exitTrials + ' exited).</p>';
    trial.stimulus += endExperimentString;
    // Set trial data dynamically
    trial.data = {
      taskStage: "finishNotice",
      totalEarnings: earnings,
      choiceTrials: 0
    };
  },
  on_load: function () {
    document.getElementById("prolific-link").addEventListener("click", function () {
      document.getElementById("prolific-link").disabled = true; // Disable the button
      window.location.href = `https://app.prolific.co/submissions/complete?cc=${PROLIFIC_CODE}`;
      psiTurk.saveData({
        success: function () {
          //console.log("Data saved successfully. Ending experiment.");
          jsPsych.endExperiment('<p style="font-size:30px;">The experiment has ended! Thanks a lot for your participation in our study!</p>');
        },
        error: function () {
          //console.error("Failed to save data. Retrying...");
          psiTurk.saveData({
            success: function () {
              //console.log("Data saved successfully after retry. Ending experiment.");
              jsPsych.endExperiment('<p style="font-size:30px;">The experiment has ended! Thanks a lot for your participation in our study!</p>');
            },
            error: function () {
              //console.error("Final attempt to save data failed.");
              alert("There was an issue saving your data. Please contact the study administrator.");
            },
          });
        },
      });
    });
  },
};
////////////////////////////////////////////// HERE DEFINE THE QUESTIONS AND PUSH THEM TO TIMELINE ////////////////////////////////////////////////////

/////////////////////////////////////// TIMELINE FOR QUESTION CONTROL ////////////////////////////////////////////

var chooseToRepeatQuestions = false;
var chooseToRepeatInstructionsAndQuestions = false;
var chooseToOptOut = false;
var questionsCorrect = false;
var questionLoop = true;
var questionLoopCount = 0; // Counter for the main question loop
var repeatQuestionsCount = 0; // Counter for repeating questions
var repeatInstructionsAndQuestionsCount = 0; // Counter for repeating instructions and questions

var allQuestions = makeQuestions(practiceTrials_coinNum, instructions_bidExamples_lowprize, instructions_bidExamples, {
  useEnvironmentBlocks: useEnvironmentBlocks,
  totalSessionMinutes: totalSessionMinutes,
  taBlockTimeBudgetLabel: TA_BLOCK_TIME_BUDGET_LABEL,
  learningRoomTrials: learningRoomTrials,
  includeBiddingQuestions: false,
});

var bdmAllQuestions = makeQuestions(practiceTrials_coinNum, instructions_bidExamples_lowprize, instructions_bidExamples, {
  useEnvironmentBlocks: useEnvironmentBlocks,
  totalSessionMinutes: totalSessionMinutes,
  taBlockTimeBudgetLabel: TA_BLOCK_TIME_BUDGET_LABEL,
  learningRoomTrials: learningRoomTrials,
  biddingQuestionsOnly: true,
});

var bdmComprehensionLoop = createComprehensionControlLoop({
  questions: bdmAllQuestions,
  repeatInstructionsTimeline: bdmInstructions,
  taskStagePrefix: "bdmQuestions",
  instructionsTimeline: bdmInstructions,
  instructionsQuestionNum: bdmQuestionNum,
});

////// The initial questions timeline
var questionsTimeline = {
  timeline: makeQuestionTimeline(),
  data: {
    taskStage: "questions",
    choiceTrials: 0,
  },
  on_timeline_start: function () {
    incorrectAnswerCount = 0;
    setComprehensionQuestionsLayout(true);
  },
};

// Congrats page
var congratsPage = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "Congrats! You answered all questions correctly!",
  choices: ["Proceed"],
  data: {
    taskStage: "congratsPage",
    choiceTrials: 0,
  },
  on_finish: function () {
    questionLoop = false;
    questionsCorrect = true;
  },
};

// Congrats page, conditionally shown
var congratsPage_conditional = {
  timeline: [congratsPage],
  conditional_function: function () {
    return incorrectAnswerCount == 0;
  },
};

// Options to repeat questions or opt out
var choiceTrial = {
  type: jsPsychHtmlButtonResponse,
  // How to return the value of incorrectAnswerCount here?
  stimulus: "",
  choices: ["Repeat wrong questions", "Repeat instructions and wrong questions"],
  data: {
    taskStage: "chooseToRepeatQuestions",
    choiceTrials: 0,
  },
  on_start: function (trial) {
    // Setting stimulus dynamically just before the trial starts
    trial.stimulus = "You answered " + incorrectAnswerCount + " questions incorrectly. Please choose an option:";
  },
  on_finish: function (data) {
    questionsCorrect = false;
    if (data.response == 0) {
      chooseToRepeatQuestions = true;
      chooseToRepeatInstructionsAndQuestions = false;
      chooseToOptOut = false;
    } else if (data.response == 1) {
      chooseToRepeatInstructionsAndQuestions = true;
      chooseToRepeatQuestions = false;
      chooseToOptOut = false;
    }
  },
};

var choiceTrial_conditional = {
  timeline: [choiceTrial],
  conditional_function: function () {
    return incorrectAnswerCount > 0;
  },
};

var repeatQuestions_conditional = {
  timeline: makeQuestionTimeline(),
  conditional_function: function () {
    return chooseToRepeatQuestions;
  },
  on_timeline_start: function () {
    incorrectAnswerCount = 0;
    repeatQuestionsCount++; // Increment the counter for repeat instructions and questions at the start
  },
  on_finish: function () {
    chooseToRepeatQuestions = false;
    repeatQuestionsCount++; // Increment the counter for repeat questions
  },
  data: {
    taskStage: function() {
      return `repeat_questions_${repeatQuestionsCount}`;
    },
    choiceTrials: 0,
  },
};

var repeatInstructionsAndQuestions_conditional = {
  timeline: makeIQTimeline(),
  conditional_function: function () {
    return chooseToRepeatInstructionsAndQuestions;
  },
  on_timeline_start: function () {
    incorrectAnswerCount = 0;
    repeatInstructionsAndQuestionsCount++; // Increment the counter for repeat instructions and questions at the start
  },
  on_finish: function () {
    chooseToRepeatInstructionsAndQuestions = false;
  },
  data: {
    taskStage: function() {
      return `repeat_instructioncs_and_questions_${repeatInstructionsAndQuestionsCount}`;
    },
    choiceTrials: 0,
  },

};

// Since we don't have the opt-out option for now, we don't need the following
// Just keeping it to avoid errors
var finishExperiment_conditional = {
  timeline: [finishExperiment],
  conditional_function: function () {
    return chooseToOptOut;
  },
  on_finish: function () {
    chooseToOptOut = false;
    questionLoop = false;
  },
};

var answersControlLoopTimeline = {
  timeline: makeIQTimelineFull(),
  loop_function: function (data) {
    return questionLoop;
  },
  on_timeline_start: function () {
    setComprehensionQuestionsLayout(true);
  },
  on_timeline_finish: function () {
    setComprehensionQuestionsLayout(false);
  },
  data: { taskStage: "answersControlLoop", choiceTrials: 0 },
};

////////////////////// HERE DEFINE THE ACTUAL TRIALS /////////////////////////////////////////
/// From now on, do the following : create all trials; ssTrials, etc. Then push them to the timeline bsaed on experiment's configuration.
// Properties of the task that do no typically change across blocks
// Keep production path minimal: always use the gacha task plugin.
var pluginType = jsPsychGachaBDMTask;

// Gacha-specific timing parameters
var ballDropDuration = 1400;
var infoRevealDuration = 5000;
var rewardRevealDuration = 3000;
var sampleDrawCount = 3;

var realStageRefreshBlankDuration = 200;

var baseProperties = {
  type: pluginType,
  blockLength: blockLength_real,
  practiceblockLength: practiceTrialCount,
  fixation_duration: fixation_duration,
  fixation_blankpageDuration: fixation_blankpageDuration,
  choice_duration: choice_duration,
  choice_blankpageDuration: choice_blankpageDuration,
  infobidchoiceduration: infobidchoiceduration,
  infobidchoice_blankpageDuration: infobidchoice_blankpageDuration,
  bidDisplayTime: bidDisplayTime,
  payMessageDisplayTime: payMessageDisplayTime,
  ballDropDuration: ballDropDuration,
  infoRevealDuration: infoRevealDuration,
  rewardRevealDuration: rewardRevealDuration,
  rewardWaitDuration: rewardWaitDuration,
  exitStayDecisionDuration: exitStayDecisionDuration,
  ITIduration: ITIduration,
  numberofOffers: 1,
  distributionType: distributionType,
  sliderMax: gachaSliderMax,
  gachaMaxBid: gachaMaxBid,
  gachaMaxBidLabel: gachaMaxBidLabel,
  sliderStep: gachaSliderStep,
  sliderRandomStart: gachaSliderRandomStart,
  sampleDrawCount: sampleDrawCount,
  showTimer: false,
  infoTypeColors: participantInfoTypeColors,
  // Custom uploaded image used in place of the text EXIT button (TA block).
  exitButtonImage: "static/images/exit.jpg",
};

var basePropertiesReal = Object.assign({}, baseProperties, {
  fixation_blankpageDuration: realStageRefreshBlankDuration,
  choice_blankpageDuration: realStageRefreshBlankDuration,
  infobidchoice_blankpageDuration: realStageRefreshBlankDuration,
  payMessageDisplayTime: payMessageDisplayTime,
});

var isPractice = 0;
var isPractice_Bool = Boolean(isPractice);
// Generate stimuli sequence

var realTrials = [];

////////////////////////////////////////////////////// FUTURE STUDY QUESTION /////////////////////////////////////////////////
var futureStudy = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: '<p style="font-size:30px;">Would you like to be contacted for doing a similar study in the near future?</p>',
      options: ["YES", "NO"],
      name: "futureStudy",
    },
  ],
  data: {
    taskStage: "futureStudy",
    choiceTrials: 0,
  },
  on_finish: function() {
    psiTurk.saveData({
      success: function () {
        //console.log("Data saved successfully at the start of block " + blockNumber);
      },
      error: function () {
        //console.error("Failed to save data at the start of block " + blockNumber + ". Retrying...");
        psiTurk.saveData();
      }
    });
  }
};
/////////////////// PUSH THE SUBSEQUENT TRIALS TO THE TIMELINE ///////////////////////
var mainTimeline = [];
////////////////////////////////////////// MAKE THE SCREEN BIG ///////////////////////////////////
mainTimeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  data: {
    taskStage: "fullscreen",
    choiceTrials: 0,
  },
  on_finish: function () {
    enableFullscreenExitReminder();
  },
});
let sessionParameters;
sessionParameters = saveSessionParameters(sessionParameters);

mainTimeline.push({
  type: jsPsychCallFunction,
  func: function () {
    jsPsych.data.addProperties({
      participantInfoTypeColors: participantInfoTypeColors,
    });
  },
  data: {
    taskStage: "participantInfoTypeColorsAssigned",
    choiceTrials: 0,
  },
});

/////////////////////////// PRESS ANY KEY TO START THE EXPERIMENT ///////////////
mainTimeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size:30px;">Press any key to start the experiment.</p>',
  data: {
    taskStage: "startExperiment",
    choiceTrials: 0,
  },
});

// Now the real experiment parts start
if (experimentconfig.showInstructions) {
  if (experimentconfig.showQuestions) {
    mainTimeline.push(
      createComprehensionInstructionsEntryLoop(instructions, questionNum, "questions")
    );
  } else {
    mainTimeline.push(instructions);
  }
}

if (experimentconfig.showQuestions) {
  mainTimeline.push(questionsTimeline);
  mainTimeline.push(answersControlLoopTimeline);
}

if (experimentconfig.showRealTask && useEnvironmentBlocks) {
  mainTimeline.push(withExperimentProsePageStyle({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: makeExperimentProseStimulus([
      "In this part, you will experience <b>automatic cue blocks</b>.",
      "You will visit all three rooms with different cues. We will let you know the room you are in and the cue you will receive in each block.",
      "Press any key to start.",
    ]),
    data: {
      taskStage: "autoCuePartStartNotification",
      choiceTrials: 0,
    },
  }));
}

if (experimentconfig.showPractice) {
  var practiceTrials = generateTrials_practiceTrials(experimentconfig); // Using the first block configuration as an example
  var practiceTrialsNotification = withExperimentProsePageStyle({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: makeExperimentProseStimulus([
      "Now you will start the <b>practice trials</b>.",
      "You will do " + String(practiceTrialCount) + " practice trials.",
      "These " + String(practiceTrialCount) + " practice trials are only for you to get used to the task. In these " + String(practiceTrialCount) + " practice trials you will not earn any coins from your choices and you will not have to pay any coins based on your bids. You will only earn and pay coins during the real task.",
      "Press any key to start.",
    ]),
    data: {
      taskStage: "practiceTrialsNotification",
      choiceTrials: 0,
    },
  });
  mainTimeline.push(practiceTrialsNotification);
  mainTimeline.push({ timeline: practiceTrials, data: { taskStage: "practiceTrials", choiceTrials: 0 } });
}

if (experimentconfig.showRealTask) {
  var realTrials;
  var realTrialsBlocked;
  var realTrialsStruct = generateTrials_realTrials(experimentconfig);
  realTrials = realTrialsStruct.realTrials;
  realTrialsBlocked = realTrialsStruct.blockTrials;

  if (!useEnvironmentBlocks) {
    // Start the global experiment timer just before the first real trial
    var timerStarter = {
      type: jsPsychCallFunction,
      func: function () {
        window.experimentStartTime = performance.now();
        window.experimentTotalTime = totalSessionTimeBudget;
      },
      data: { taskStage: "timerStart", choiceTrials: 0 },
    };
    mainTimeline.push(timerStarter);
  } else {
    window.experimentStartTime = null;
    window.taDecisionTimeUsed = 0;
  }

  function blockTimeIsRemaining(blockEnvType) {
    if (blockEnvType === "TA") {
      return (window.taDecisionTimeUsed || 0) < window.experimentTotalTime;
    }
    return true;
  }

  function getEnvironmentBlockDescription(envType, blockInfoType, skipBidding) {
    var roomName = BLOCK_ROOM_NAMES[envType] || envType;
    var cueName = BLOCK_INFO_CUE_NAMES[blockInfoType] || "Informative Cue";
    var roomDescription = BLOCK_ROOM_SHORT_DESCRIPTIONS[envType] || "";
    var cueDescription = BLOCK_CUE_SHORT_DESCRIPTIONS[blockInfoType] || "";

    var blockSetupLine;
    if (skipBidding) {
      blockSetupLine =
        "In this block, you are in the <b>" + roomName + "</b>. " +
        "And you will be given the <b>" + cueName + "</b> for the whole block.";
    } else {
      blockSetupLine =
        "In this block, you are in the <b>" + roomName + "</b>. " +
        "You will get a chance to bid for the <b>" + cueName + "</b> and <b>Blank Cue</b>.";
    }

    var recallCueLine;
    if (blockInfoType === "D") {
      recallCueLine =
        "And the <b>" + cueName + "</b> does not help you " + cueDescription + ".";
    } else if (skipBidding) {
      recallCueLine =
        "And the <b>" + cueName + "</b> will help you " + cueDescription + ".";
    } else {
      recallCueLine =
        "And the <b>" + cueName + "</b> will help you " + cueDescription + ". " +
        "And the <b>Blank Cue</b> does not help you " + BLOCK_CUE_SHORT_DESCRIPTIONS.D + ".";
    }

    return makeExperimentProseStimulus([
      "Now you are in a new block.",
      blockSetupLine,
      "As a recall, <b>" + roomName + "</b> is " + roomDescription + ".",
      recallCueLine,
      "Press any key to start.",
    ]);
  }

  function formatBlockBreakCountdown(msRemaining) {
    var totalSec = Math.max(0, Math.ceil(msRemaining / 1000));
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    return min + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function makeBlockBreakCountdownTrial(completedBlockNum) {
    var timerInterval = null;
    return withExperimentProsePageStyle({
      type: jsPsychHtmlButtonResponse,
      stimulus:
        wrapExperimentProsePage(
          makeInstructionStyleParagraphs([
            "Take a break.",
            "The next set will begin automatically in <b>" +
              blockBreakDurationMinutes +
              " minutes</b> when the timer reaches zero.",
            "You may also continue early when you are ready.",
          ]) +
            '<p id="block-break-timer" class="experiment-prose-timer">' +
            formatBlockBreakCountdown(blockBreakDurationMs) +
            "</p>"
        ),
      choices: [blockBreakReadyButtonLabel],
      button_html: ['<button class="jspsych-btn">%choice%</button>'],
      trial_duration: blockBreakDurationMs,
      response_ends_trial: true,
      on_load: function () {
        var el = document.getElementById("block-break-timer");
        var endTime = performance.now() + blockBreakDurationMs;
        function tick() {
          var remaining = endTime - performance.now();
          if (el) el.textContent = formatBlockBreakCountdown(remaining);
        }
        tick();
        timerInterval = setInterval(tick, 250);
      },
      on_finish: function (data) {
        if (timerInterval) clearInterval(timerInterval);
        data.breakEndedEarly = data.response === 0;
        data.breakWaitMs = data.rt != null ? data.rt : blockBreakDurationMs;
      },
      data: {
        taskStage: "blockBreakCountdown_after_block_" + completedBlockNum,
        blockNum: completedBlockNum,
        breakDurationMs: blockBreakDurationMs,
        choiceTrials: 0,
      },
    });
  }

  function makeInterBlockTimeline(completedBlockNum, nextBlockEnvType, options) {
    options = options || {};
    var nextChoiceLabel = options.nextChoiceLabel || "Enter next block";
    var promptText =
      options.promptText ||
      "Current set complete! Now you can take a break or enter next set.";
    var breakChoice = null;
    var timeline = [
        withExperimentProsePageStyle({
          type: jsPsychHtmlButtonResponse,
          stimulus: makeExperimentProseStimulus([promptText]),
          choices: ["Take a break", nextChoiceLabel],
          button_html: [
            '<button class="jspsych-btn">%choice%</button>',
            '<button class="jspsych-btn">%choice%</button>',
          ],
          data: {
            taskStage: "blockCompleteChoice_after_block_" + completedBlockNum,
            blockNum: completedBlockNum,
            choiceTrials: 0,
          },
          on_finish: function (data) {
            breakChoice = data.response === 0 ? "break" : "next";
            data.blockBreakChoice = breakChoice;
          },
        }),
        {
          timeline: [makeBlockBreakCountdownTrial(completedBlockNum)],
          conditional_function: function () {
            return breakChoice === "break";
          },
        },
    ];
    if (nextBlockEnvType === "CA") {
      timeline.push(withExperimentProsePageStyle({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: makeExperimentProseStimulus([
          "You enter a new set! The good and bad machine colors have been randomized!",
          "Press any key to continue.",
        ]),
        data: {
          taskStage: "newSetNotification_before_block_" + (completedBlockNum + 1),
          blockNum: completedBlockNum + 1,
          choiceTrials: 0,
        },
      }));
    }
    return { timeline: timeline };
  }

  // Build the timed trial loop for each block
  for (var i = 0; i < blockCount_real; i++) {
    var thisblockTrials = realTrialsBlocked[i];
    var blockInfo = blockDistributions[i];
    var skipBidding = !!blockInfo.skipBidding;
    var blockEnvType = blockInfo.environmentType || "";
    var blockInfoType = blockInfo.blockInfoType || "";

    if (blockEnvType === "TA") {
      (function(taTimeBudgetMs) {
        mainTimeline.push({
          type: jsPsychCallFunction,
          func: function () {
            window.taDecisionTimeUsed = 0;
            window.experimentTotalTime = taTimeBudgetMs;
            window.experimentStartTime = null;
          },
          data: {
            taskStage: "taTimerStart",
            timeBudgetMs: taTimeBudgetMs,
            choiceTrials: 0,
          },
        });
      })(blockInfo.timeBudgetMs || TA_BLOCK_TIME_BUDGET_MS);
    }

    // Block start notification
    (function(blockIdx, blockSkipBidding, envType, infoCueType) {
      var blockNumber = blockIdx + 1;

      var blockStartPage = withExperimentProsePageStyle({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: getEnvironmentBlockDescription(envType, infoCueType, blockSkipBidding),
        data: { taskStage: 'blockStartNotification_block_' + blockNumber, blockNum: blockNumber, blockInfoType: infoCueType, environmentType: envType, choiceTrials: 0 },
        conditional_function: function () {
          if (!useEnvironmentBlocks) {
            return window.experimentStartTime === null ||
              (performance.now() - window.experimentStartTime) < window.experimentTotalTime;
          }
          return blockTimeIsRemaining(envType);
        },
        on_start: function() {
          psiTurk.saveData({
            success: function () {},
            error: function () { psiTurk.saveData(); }
          });
        }
      });
      mainTimeline.push(blockStartPage);
    })(i, skipBidding, blockEnvType, blockInfoType);

    // Push each trial in this block, wrapped in a conditional that checks time
    (function(blockIdx, blockTrialsList, envType) {
      blockTrialsList.forEach(function(trialObj) {
        mainTimeline.push({
          timeline: [trialObj],
          conditional_function: function () {
            if (!useEnvironmentBlocks) {
              if (window.experimentStartTime === null) return true;
              var elapsed = performance.now() - window.experimentStartTime;
              return elapsed < window.experimentTotalTime;
            }
            return blockTimeIsRemaining(envType);
          },
          data: {
            ...trialObj,
            blockNum: blockIdx + 1,
            taskStage: 'realTrials_block_' + (blockIdx + 1),
            choiceTrials: 1,
          },
        });
      });
    })(i, thisblockTrials, blockEnvType);

    if (useEnvironmentBlocks && i < blockCount_real - 1) {
      if (i === AUTO_CUE_BLOCK_COUNT - 1) {
        mainTimeline.push(makeInterBlockTimeline(i + 1, blockDistributions[i + 1].environmentType, {
          nextChoiceLabel: "Enter next part",
          promptText:
            "The <b>First Part</b> of the Task is complete! You can take a break, or continue to the <b>Second Part</b> when you are ready.",
        }));
        mainTimeline.push(withExperimentProsePageStyle({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: makeExperimentProseStimulus([
            "Thank you for completing the <b>First Part</b> of the Task!",
            "Now you are familiar with each type of the cue. In the <b>Second Part</b>, we will introduce how to bid for your preferred cues in each block.",
            "Press any key to read the instruction for the bidding rules.",
          ]),
          data: { taskStage: "autoCuePhaseComplete", choiceTrials: 0 },
        }));
        if (experimentconfig.showQuestions) {
          mainTimeline.push(bdmComprehensionLoop.instructionsEntryLoop);
          mainTimeline.push(bdmComprehensionLoop.questionsTimeline);
          mainTimeline.push(bdmComprehensionLoop.answersControlLoopTimeline);
        } else {
          mainTimeline.push(bdmInstructions);
        }
        mainTimeline.push(makeBdmPhaseStartNotificationTrial({
          bdmBlockCount: BDM_BLOCK_COUNT,
          blockLength_real: blockLength_real,
          taBlockTimeBudgetLabel: TA_BLOCK_TIME_BUDGET_LABEL,
          totalSessionMinutes: totalSessionMinutes,
        }));
      } else {
        mainTimeline.push(makeInterBlockTimeline(i + 1, blockDistributions[i + 1].environmentType));
      }
    }
  }

  if (!useEnvironmentBlocks) {
    var timesUpNotification = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus:
        '<p style="font-size:40px; color:#e74c3c;"><b>Time\'s Up!</b></p>' +
        '<p style="font-size:30px;">Your time budget has been used up.</p>' +
        '<p style="font-size:30px;">Press any key to continue to the results.</p>',
      data: { taskStage: "timesUpNotification", choiceTrials: 0 },
    };
    mainTimeline.push(timesUpNotification);
  }
}

if (experimentconfig.showFutureStudy) {
  mainTimeline.push(futureStudy);
}

if (experimentconfig.showFinishExperiment) {
  mainTimeline.push(finishExperiment);
}

jsPsych.run(mainTimeline);
