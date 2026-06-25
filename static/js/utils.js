function AssertException(message) {
  this.message = message;
}
AssertException.prototype.toString = function () {
  return "AssertException: " + this.message;
};

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

function roundToNearestFive(num) {
  return Math.round(num / 5) * 5;
}

function roundToNearestTen(num) {
  return Math.round(num / 10) * 10;
}

// Mean of booleans (true==1; false==0)
function boolpercent(arr) {
  var count = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      count++;
    }
  }
  return (100 * count) / arr.length;
}

function createArrayFrom0ToN(n) {
  const result = [];
  for (let i = 0; i <= n; i++) {
    result.push(i);
  }
  return result;
}

function createArrayFrom1ToN(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    result.push(i);
  }
  return result;
}

function setupExperimentConfiguration(runMode) {
  return {
    runMode: runMode,
    showInstructions: runMode === "real",
    showQuestions: runMode === "real",
    showPractice: runMode === "real",
    showRealTask: runMode === "real",
    showFutureStudy: runMode === "real",
    showFinishExperiment: runMode === "real",
  };
}

/////////////////////////////// Reward sampling: Gaussian → discrete PMF ////////////////////////////////

function erf(x) {
  var sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  var t = 1.0 / (1.0 + 0.3275911 * x);
  var y =
    1.0 -
    (((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x));
  return sign * y;
}

function standardNormalCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function getCoinIntegerPoints() {
  var points = [];
  var lo = typeof minCoinNum !== "undefined" ? minCoinNum : 1;
  var hi = typeof maxCoinNum !== "undefined" ? maxCoinNum : 9;
  for (var k = lo; k <= hi; k++) {
    points.push(k);
  }
  return points;
}

// w_k = Φ((k + 0.5 - μ) / σ) - Φ((k - 0.5 - μ) / σ), normalized to sum to 1.
function gaussianToDiscreteDistribution(mean, sd, integerPoints) {
  integerPoints = integerPoints || getCoinIntegerPoints();
  var weights = [];
  var i;

  if (!sd || sd <= 0) {
    var target = Math.round(mean);
    for (i = 0; i < integerPoints.length; i++) {
      weights.push(integerPoints[i] === target ? 1 : 0);
    }
  } else {
    for (i = 0; i < integerPoints.length; i++) {
      var k = integerPoints[i];
      var upper = (k + 0.5 - mean) / sd;
      var lower = (k - 0.5 - mean) / sd;
      weights.push(standardNormalCdf(upper) - standardNormalCdf(lower));
    }
  }

  var sum = 0;
  for (i = 0; i < weights.length; i++) {
    sum += weights[i];
  }

  if (sum <= 0) {
    var nearest = integerPoints[0];
    var bestDist = Math.abs(nearest - mean);
    for (i = 1; i < integerPoints.length; i++) {
      var dist = Math.abs(integerPoints[i] - mean);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = integerPoints[i];
      }
    }
    return integerPoints.map(function (k) {
      return k === nearest ? 1 : 0;
    });
  }

  return weights.map(function (w) {
    return w / sum;
  });
}

function sampleFromDiscreteDistribution(integerPoints, probabilities) {
  var r = Math.random();
  var cumulative = 0;
  for (var i = 0; i < integerPoints.length; i++) {
    cumulative += probabilities[i];
    if (r < cumulative) {
      return integerPoints[i];
    }
  }
  return integerPoints[integerPoints.length - 1];
}

function sampleDiscreteGaussian(mean, sd, integerPoints) {
  integerPoints = integerPoints || getCoinIntegerPoints();
  var probabilities = gaussianToDiscreteDistribution(mean, sd, integerPoints);
  return sampleFromDiscreteDistribution(integerPoints, probabilities);
}

// Clip and round displayed coin values to the experiment's valid ball range.
function clipCoinValue(val) {
  return Math.max(minCoinNum, Math.min(maxCoinNum, Math.round(val)));
}

function assignInfoTypes(count) {
  var types = ["A", "B", "C"];
  var perType = Math.ceil(count / types.length);
  var pool = [];
  types.forEach(function (type) {
    for (var i = 0; i < perType; i++) pool.push(type);
  });
  return jsPsych.randomization.shuffle(pool.slice(0, count));
}

function generateSampleDraws(armMeans, armSds, drawCount) {
  var draws = { arm0: [], arm1: [] };
  for (var arm = 0; arm < 2; arm++) {
    for (var j = 0; j < drawCount; j++) {
      draws["arm" + arm].push(sampleDiscreteGaussian(armMeans[arm], armSds[arm]));
    }
  }
  return draws;
}

function applyEnvironmentToTrial(trial, blockDistribution) {
  if (!blockDistribution.environmentType) return trial;
  var merged = Object.assign({}, trial, {
    environmentType: blockDistribution.environmentType,
    numberofOffers: blockDistribution.numberofOffers,
    showExitOption: blockDistribution.showExitOption,
    showTimer: blockDistribution.showTimer,
    timerScope: blockDistribution.timerScope,
  });
  if (blockDistribution.skipBidding) {
    merged.skipBidding = true;
    merged.predeterminedInfoObtained = blockDistribution.predeterminedInfoObtained;
  }
  if (blockDistribution.blockLength != null) {
    merged.blockLength = blockDistribution.blockLength;
  }
  if (blockDistribution.timeBudgetMs != null) {
    merged.timeBudgetMs = blockDistribution.timeBudgetMs;
  }
  return merged;
}

function resolveTrialInfoType(fixedBlockInfoType, fallbackInfoType) {
  if (!fixedBlockInfoType) return fallbackInfoType;
  return fixedBlockInfoType === "D" ? "A" : fixedBlockInfoType;
}

function getRealBlockTrialCount(blockDistribution) {
  if (blockDistribution.blockLength != null) {
    return blockDistribution.blockLength;
  }
  return blockLength_real;
}

function sampleExponential(rate) {
  return -Math.log(1.0 - Math.random()) / rate;
}

function sampleBernoulli(p) {
  return Math.random() < p ? 1 : 0;
}

function sampleGeometric(p) {
  return Math.ceil(Math.log(1.0 - Math.random()) / Math.log(1.0 - p));
}

function sampleGamma(shape, scale) {
  // This is a placeholder; Gamma distribution sampling can be complex
  // Implement or import a specific algorithm, e.g., Marsaglia and Tsang's method
  return "Implementation Required";
}

/////////////////// Function to randomize info colors for each subject /////////////
var INFO_CUE_COLOR_POOL = {
  purple: "#9B59B6",
  cyan: "#00BCD4",
  yellow: "#F1C40F",
  darkGreen: "#1B5E20",
};

function randomizeParticipantInfoTypeColors() {
  var informativeTypes = ["A", "B", "C"];
  var poolKeys = ["cyan", "yellow", "darkGreen"];
  var shuffledKeys = jsPsych.randomization.shuffle(poolKeys.slice());
  var mapping = {
    D: INFO_CUE_COLOR_POOL.purple,
  };
  informativeTypes.forEach(function (infoType, idx) {
    mapping[infoType] = INFO_CUE_COLOR_POOL[shuffledKeys[idx]];
  });
  return mapping;
}

// Function to generate an array of numbers within a specified range /////////
function range(start, end) {
  var arr = [];
  for (var i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

function generateOutcomes(blockLength, blockDistribution, higherRewardArmIndex) {
  var outcomes = [];
  var armMeans;
  var armMeanings;
  var armSds;
  var armIndicators;
  var armSdCases;
  var armSdCaseInds;
  var higherSdArmIndex = 0;
  // higherRewardArmIndex == 0 means mean(red) > blue and 1 means blue > red
  // we should assign all the properties from distribution to the arms accordingly
  if (blockDistribution.armColorsSame) {
    // Use fake indices to differentiate between arms
    if (higherSdArmIndex === 0) {
      armMeanings = ["arm0:high sd", "arm1: low sd"];
      armSds = [blockDistribution.sd1, blockDistribution.sd2];
      armMeans = [blockDistribution.mean1, blockDistribution.mean2];
      armIndicators = [blockDistribution.blockSdCase[0], blockDistribution.blockSdCase[1]];
      armSdCases = [blockDistribution.blockSdCase[0], blockDistribution.blockSdCase[1]];
      armSdCaseInds = [blockDistribution.blockSdCaseInd[0], blockDistribution.blockSdCaseInd[1]];
    } else {
      armMeanings = ["arm0:low sd", "arm1: high sd"];
      armSds = [blockDistribution.sd2, blockDistribution.sd1];
      armMeans = [blockDistribution.mean2, blockDistribution.mean1];
      armIndicators = [blockDistribution.blockSdCase[1], blockDistribution.blockSdCase[0]];
      armSdCases = [blockDistribution.blockSdCase[1], blockDistribution.blockSdCase[0]];
      armSdCaseInds = [blockDistribution.blockSdCaseInd[1], blockDistribution.blockSdCaseInd[0]];
    }
  } else {
    if (higherRewardArmIndex === 0) {
      armMeanings = ["red:high", "blue:low"];
      armMeans = [blockDistribution.mean1, blockDistribution.mean2];
      armSds = [blockDistribution.sd1, blockDistribution.sd2];
      armIndicators = [blockDistribution.blockSdCase[0], blockDistribution.blockSdCase[1]];
      armSdCases = [blockDistribution.blockSdCase[0], blockDistribution.blockSdCase[1]];
      armSdCaseInds = [blockDistribution.blockSdCaseInd[0], blockDistribution.blockSdCaseInd[1]];
    } else {
      armMeanings = ["red:low", "blue:high"];
      armMeans = [blockDistribution.mean2, blockDistribution.mean1];
      armSds = [blockDistribution.sd2, blockDistribution.sd1];
      armIndicators = [blockDistribution.blockSdCase[1], blockDistribution.blockSdCase[0]];
      armSdCases = [blockDistribution.blockSdCase[1], blockDistribution.blockSdCase[0]];
      armSdCaseInds = [blockDistribution.blockSdCaseInd[1], blockDistribution.blockSdCaseInd[0]];
    }
  }

  if (blockDistribution.armMeansSame) {
    if (blockDistribution.mean1 == meanHigh) {
      armMeanings = ["red:high", "blue:high"];
    } else if (blockDistribution.mean1 == meanLow) {
      armMeanings = ["red:low", "blue:low"];
    }
  }

  for (var i = 0; i < blockLength; i++) {
    // Sample outcomes based on the means and SDs
    var outcomeRed = sampleDiscreteGaussian(armMeans[0], armSds[0]);
    var outcomeBlue = sampleDiscreteGaussian(armMeans[1], armSds[1]);
    outcomes.push([outcomeRed, outcomeBlue]);
  }
  return {
    outcomes: outcomes,
    armMeans: armMeans,
    armMeanings: armMeanings,
    armMeaningsIndex: higherRewardArmIndex,
    armSds: armSds,
    armIndicators: armIndicators,
    armSdCases: armSdCases,
    armSdCaseInds: armSdCaseInds,
  };
}

function generateStimuliSequence(blockLength, blockDistribution) {
  var sequence = [];
  var armIndices = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  let blockSdCase = blockDistribution.blockSdCase;
  let if_same_color = blockDistribution.armColorsSame;
  let this_block_color_ind;
  if (if_same_color) {
    this_block_color_ind = blockDistribution.this_block_color_ind;
  }
  // Here, we also need to add arm indicators to the sequence
  // The arm indicators of a block depends on whether the block is RR,RS,SR, or SS
  // The arm indicators of a trial of a block depends on the arm indicators of the block, and the color of the arm
  // Helper function to convert arm indices to an arm index

  function convertToDecimal(indices) {
    return indices[0] * 2 + indices[1];
  }

  // Helper function to determine arm colors based on arm indices
  function determineArmColors(indices) {
    if (indices[0] === 0 && indices[1] === 0) return ["red", "red"];
    if (indices[0] === 0 && indices[1] === 1) return ["red", "blue"];
    if (indices[0] === 1 && indices[1] === 0) return ["blue", "red"];
    if (indices[0] === 1 && indices[1] === 1) return ["blue", "blue"];
  }
  //// Define trials
  var trial1 = {
    armIndices: armIndices[0],
    armIndex: convertToDecimal(armIndices[0]),
    armColors: determineArmColors(armIndices[0]),
    armUncIndicators: blockSdCase,
  };
  var trial2 = {
    armIndices: armIndices[1],
    armIndex: convertToDecimal(armIndices[1]),
    armColors: determineArmColors(armIndices[1]),
    armUncIndicators: blockSdCase,
  };
  var trial3 = {
    armIndices: armIndices[2],
    armIndex: convertToDecimal(armIndices[2]),
    armColors: determineArmColors(armIndices[2]),
    armUncIndicators: blockSdCase,
  };
  var trial4 = {
    armIndices: armIndices[3],
    armIndex: convertToDecimal(armIndices[3]),
    armColors: determineArmColors(armIndices[3]),
    armUncIndicators: blockSdCase,
  };
  if (if_same_color) {
    //// Define trials
    var trial1 = {
      armIndices: armIndices[0],
      armIndex: convertToDecimal(armIndices[0]),
      armColors: determineArmColors([this_block_color_ind, this_block_color_ind]),
      armUncIndicators: blockSdCase,
    };
    // define trial 1 and 4 for arm colors same blocks
    var trial2 = {
      armIndices: armIndices[1],
      armIndex: convertToDecimal(armIndices[0]),
      armColors: determineArmColors([this_block_color_ind, this_block_color_ind]),
      armUncIndicators: blockSdCase,
    };
    var trial3 = {
      armIndices: armIndices[2],
      armIndex: convertToDecimal(armIndices[3]),
      armColors: determineArmColors([this_block_color_ind, this_block_color_ind]),
      armUncIndicators: blockSdCase,
    };
    var trial4 = {
      armIndices: armIndices[3],
      armIndex: convertToDecimal(armIndices[3]),
      armColors: determineArmColors([this_block_color_ind, this_block_color_ind]),
      armUncIndicators: blockSdCase,
    };
  }

  // just to take screenshots for instructions and questions
  var pairs = Math.floor(blockLength / 2);
  for (var i = 0; i < pairs; i++) {
    sequence.push(trial2);
    sequence.push(trial3);
  }
  if (sequence.length < blockLength) {
    sequence.push(trial2);
  }
  sequence = jsPsych.randomization.shuffle(sequence);
  if (sequence.length > blockLength) {
    sequence = sequence.slice(0, blockLength);
  }
  while (sequence.length < blockLength) {
    sequence.push(trial2);
  }
  return sequence;
}

function generateTrials_realTrials(experimentconfig) {
  // This function can create trials for ssTrials, practice, and real trials
  var trials = [];
  let blockNumber = 1;
  // Randomly make one of the arms higher-reward. But make this such that 0.5 of the time,
  // the higher-reward arm is red and 0.5 of the time, the higher-reward arm is blue
  var tempInd = [0, 1];
  //  10/28/2024 : This is now used for balancing the higher-reward color
  var numToRepeat = blockCounts_real_diffArms / tempInd.length; 
  var higherRewardArmIndex = jsPsych.randomization.repeat(tempInd, numToRepeat);
  //var colors_same_color_blocks = [0, 1];
  //colors_same_color_blocks = jsPsych.randomization.repeat(colors_same_color_blocks, 1);
  //let same_color_blocks_number = 0;
  // For a given block, if higherRewardArmIndex[i] is 0, then the higher-reward arm is red
  var blockTrials = [];
  var block_count_diffArms = 0;
  blockDistributions.forEach((blockDistribution) => {
    //  10/28/2024 : This is now used for balancing the higher-reward color
    if (blockDistribution.armMeansSame || blockDistribution.armColorsSame) {
      var thisBlockHigherRewardArmIndex = 0;
    } else {
      block_count_diffArms += 1;
      var thisBlockHigherRewardArmIndex = higherRewardArmIndex[block_count_diffArms - 1];
    }
    var thisblockTrials = [];
    var thisBlockLength = getRealBlockTrialCount(blockDistribution);
    let outcomesInfo = generateOutcomes(thisBlockLength, blockDistribution, thisBlockHigherRewardArmIndex);
    let infoForced_block = blockDistribution.forcedInfo;
    let arm_mean_same = blockDistribution.armMeansSame;
    let arm_sd_same = blockDistribution.armSdSame;
    let arm_color_same = blockDistribution.armColorsSame;
    var this_block_color = "N/A";
    if (blockDistribution.hasOwnProperty("this_block_color")) {
      this_block_color = blockDistribution.this_block_color;
    }
    //var this_block_color = "N/A";
    // if (arm_color_same) {
    //   this_block_color = colors_same_color_blocks[same_color_blocks_number];
    //   blockDistribution.this_block_color = this_block_color;
    //   same_color_blocks_number++;
    // }
    var stimuliSequence = generateStimuliSequence(thisBlockLength, blockDistribution);
    var fixedBlockInfoType = blockDistribution.blockInfoType || null;
    var blockInfoTypes = fixedBlockInfoType ? null : assignInfoTypes(thisBlockLength);
    var goodArmIdx = outcomesInfo.armSds[0] <= outcomesInfo.armSds[1] ? 0 : 1;
    var badArmIdx = 1 - goodArmIdx;
    var singleMachineArmIdx = null;
    if (blockDistribution.numberofOffers === 1) {
      // NI/TA: one machine per block — randomly good or bad distribution, fixed for all trials.
      singleMachineArmIdx = Math.random() < 0.5 ? goodArmIdx : badArmIdx;
    }
    for (let i = 0; i < thisBlockLength; i++) {
      var sampleDraws_i = generateSampleDraws(outcomesInfo.armMeans, outcomesInfo.armSds, 3);
      var trial = {
        taskStage: "realTrials",
        trialNum: i + 1,
        blockNum: blockNumber,
        ifPractice: 0,
        distributionCase: thisBlockHigherRewardArmIndex, // 0 if red>blue, 1 if blue>red
        armMeaning: outcomesInfo.armMeanings,
        armMeans: outcomesInfo.armMeans,
        arm_means_same: arm_mean_same,
        armSds: outcomesInfo.armSds,
        armSdCaseInds: outcomesInfo.armSdCaseInds,
        arm_sds_same: arm_sd_same,
        // Additional properties can be added here as needed
        armIndices: stimuliSequence[i].armIndices,
        armColors: stimuliSequence[i].armColors,
        arm_colors_same: arm_color_same,
        this_block_color: this_block_color,
        //armIndicators: stimuliSequence[i].armUncIndicators,
        armIndicators: outcomesInfo.armIndicators,
        blockSdCaseInd: blockDistribution.blockSdCaseInd,
        blockSdInd: blockDistribution.blockSdInd,
        outcomes: outcomesInfo.outcomes[i],
        forcedInfo: infoForced_block,
        blockId: blockDistribution.blockId,
        blockErId: blockDistribution.blockErId,
        blockSdId: blockDistribution.blockSdId,
        blockDiffId: blockDistribution.blockDiffId,
        infoType: resolveTrialInfoType(fixedBlockInfoType, blockInfoTypes ? blockInfoTypes[i] : null),
        blockInfoType: fixedBlockInfoType || (blockInfoTypes ? blockInfoTypes[i] : null),
        sampleDraws: sampleDraws_i,
        sampleDrawCount: 3,
        goodArmIndex: goodArmIdx,
        badArmIndex: badArmIdx,
        singleMachineArmIdx: singleMachineArmIdx,
        assignedMachineRole: singleMachineArmIdx !== null
          ? (singleMachineArmIdx === goodArmIdx ? "good" : "bad")
          : null,
      };
      if (singleMachineArmIdx !== null) {
        trial.armIndex = singleMachineArmIdx;
        trial.armColor = stimuliSequence[i].armColors[singleMachineArmIdx];
        trial.outcome = outcomesInfo.outcomes[i][singleMachineArmIdx];
        trial.armMean = outcomesInfo.armMeans[singleMachineArmIdx];
        trial.armSd = outcomesInfo.armSds[singleMachineArmIdx];
        trial.machineRole = trial.assignedMachineRole;
      }
      var combinedtrial = applyEnvironmentToTrial(Object.assign({}, basePropertiesReal, trial), blockDistribution);
      thisblockTrials.push(combinedtrial);
    }
    blockTrials.push(thisblockTrials);
    blockNumber++;
    // here add the end notifion of the block
  });
  return {
    trials: trials,
    blockTrials: blockTrials,
  };
}

function generateTrials_practiceTrials(experimentconfig) {
  // This function can create trials for ssTrials, practice, and real trials
  var trials = [];
  let blockNumber = 1;
  var tempInd = [0, 1];
  var higherRewardArmIndex = jsPsych.randomization.repeat(tempInd, 1);
  var totalPracticeTrials = blockDistributions_practice.length * blockLength_practice;
  var practiceTrialNum = 0;
  blockDistributions_practice.forEach((blockDistribution) => {
    var thisBlockHigherRewardArmIndex = higherRewardArmIndex[blockNumber - 1] !== undefined
      ? higherRewardArmIndex[blockNumber - 1]
      : 0;
    let outcomesInfo = generateOutcomes(blockLength_practice, blockDistribution, thisBlockHigherRewardArmIndex);

    let infoForced_block = blockDistribution.forcedInfo;
    let arm_mean_same = blockDistribution.armMeansSame;
    let arm_sd_same = blockDistribution.armSdSame;
    let arm_color_same = blockDistribution.armColorsSame;
    var this_block_color = "N/A";
    if (blockDistribution.hasOwnProperty("this_block_color")) {
      this_block_color = blockDistribution.this_block_color;
    }
    var stimuliSequence = generateStimuliSequence(blockLength_practice, blockDistribution);
    var fixedBlockInfoType = blockDistribution.blockInfoType || null;
    var practiceInfoTypes = fixedBlockInfoType ? null : assignInfoTypes(blockLength_practice);
    var goodArmIdx = outcomesInfo.armSds[0] <= outcomesInfo.armSds[1] ? 0 : 1;
    var badArmIdx = 1 - goodArmIdx;
    var singleMachineArmIdx = null;
    if (blockDistribution.numberofOffers === 1) {
      singleMachineArmIdx = Math.random() < 0.5 ? goodArmIdx : badArmIdx;
    }

    for (let i = 0; i < blockLength_practice; i++) {
      practiceTrialNum++;
      var sampleDraws_i = generateSampleDraws(outcomesInfo.armMeans, outcomesInfo.armSds, 3);
      var trial = {
        taskStage: "practiceTrials",
        trialNum: practiceTrialNum,
        blockNum: blockNumber,
        ifPractice: 1,
        distributionCase: thisBlockHigherRewardArmIndex,
        armMeaning: outcomesInfo.armMeanings,
        armMeans: outcomesInfo.armMeans,
        arm_means_same: arm_mean_same,
        armSds: outcomesInfo.armSds,
        armSdCaseInds: outcomesInfo.armSdCaseInds,
        arm_sds_same: arm_sd_same,
        armIndices: stimuliSequence[i].armIndices,
        armColors: stimuliSequence[i].armColors,
        arm_colors_same: arm_color_same,
        this_block_color: this_block_color,
        armIndicators: outcomesInfo.armIndicators,
        blockSdCaseInd: blockDistribution.blockSdCaseInd,
        blockSdInd: blockDistribution.blockSdInd,
        outcomes: outcomesInfo.outcomes[i],
        forcedInfo: infoForced_block,
        blockId: blockDistribution.blockId,
        blockErId: blockDistribution.blockErId,
        blockSdId: blockDistribution.blockSdId,
        blockDiffId: blockDistribution.blockDiffId,
        infoType: resolveTrialInfoType(fixedBlockInfoType, practiceInfoTypes ? practiceInfoTypes[i] : null),
        blockInfoType: fixedBlockInfoType || (practiceInfoTypes ? practiceInfoTypes[i] : null),
        sampleDraws: sampleDraws_i,
        sampleDrawCount: 3,
        goodArmIndex: goodArmIdx,
        badArmIndex: badArmIdx,
        singleMachineArmIdx: singleMachineArmIdx,
        assignedMachineRole: singleMachineArmIdx !== null
          ? (singleMachineArmIdx === goodArmIdx ? "good" : "bad")
          : null,
        practiceblockLength: totalPracticeTrials,
      };
      if (singleMachineArmIdx !== null) {
        trial.armIndex = singleMachineArmIdx;
        trial.armColor = stimuliSequence[i].armColors[singleMachineArmIdx];
        trial.outcome = outcomesInfo.outcomes[i][singleMachineArmIdx];
        trial.armMean = outcomesInfo.armMeans[singleMachineArmIdx];
        trial.armSd = outcomesInfo.armSds[singleMachineArmIdx];
        trial.machineRole = trial.assignedMachineRole;
      }
      var combinedtrial = applyEnvironmentToTrial(Object.assign({}, baseProperties, trial), blockDistribution);
      trials.push(combinedtrial);
    }
    blockNumber++;
  });
  return trials;
}

// Function to save total earnings
function calculateEarnings(blockDistributions, blockLength) {
  let maxEarnings = 0;
  let minEarnings = 0;
  let totalMeans = 0;

  for (let block of blockDistributions) {
    let higherMean = Math.max(block.mean1, block.mean2);
    let lowerMean = Math.min(block.mean1, block.mean2);

    maxEarnings += higherMean * blockLength;
    minEarnings += lowerMean * blockLength;
    totalMeans += block.mean1 + block.mean2;
  }
  maxEarnings = Math.floor(maxEarnings * coinToDollarRate);
  minEarnings = Math.round(minEarnings * coinToDollarRate);
  totalMeans = Math.round(totalMeans * coinToDollarRate);

  let avgEarnings = (maxEarnings + minEarnings) / 2;

  return { maxEarnings, minEarnings, avgEarnings };
}

// Function to save the session parameters
function saveSessionParameters(sessionParameters) {
  sessionParameters = {
    uniqueId: uniqueId,
    adServerLoc: adServerLoc,
    mode: mode,
    runMode: runMode,
    experimentconfig: experimentconfig,
    platform: platform,
    PROLIFIC_CODE: PROLIFIC_CODE,
    useEnvironmentBlocks: useEnvironmentBlocks,
    participantInfoTypeColors: participantInfoTypeColors,
    practiceblockLength: blockLength_practice,
    realblockLength: blockCount_real,
    blockLength_real: blockLength_real,
    blockDistributions_practice: blockDistributions_practice,
    blockDistributions: blockDistributions,
    meanHigh: meanHigh,
    meanLow: meanLow,
    sdHigh: sdHigh,
    sdLow: sdLow,
    maxCoinNum: maxCoinNum,
    minCoinNum: minCoinNum,
    coinToDollarRate: coinToDollarRate,
    coinToCentRate: coinToCentRate,
    gachaMaxBid: gachaMaxBid,
    gachaMaxBidLabel: gachaMaxBidLabel,
    gachaSliderMax: gachaSliderMax,
    gachaSliderStep: gachaSliderStep,
    rewardWaitDuration: rewardWaitDuration,
    payMessageDisplayTime: payMessageDisplayTime,
    TA_BLOCK_TIME_BUDGET_MS: TA_BLOCK_TIME_BUDGET_MS,
    questionNum: questionNum,
    bdmQuestionNum: bdmQuestionNum,
    instructionQuestionPayment: instructionQuestionPayment,
    finishExperimentPayment: finishExperimentPayment,
    totalLength: totalLength,
    earnings_maintask: earnings_maintask,
    earnings_total: earnings_total,
    totalTimeMinutes_min_rounded: totalTimeMinutes_min_rounded,
    totalTimeMinutes_max_rounded: totalTimeMinutes_max_rounded,
    averagePayPerHour_min: averagePayPerHour_min,
    averagePayPerHour_max: averagePayPerHour_max,
  };
  return sessionParameters;
}

function prompt_resubmit() {
  var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";
  document.body.innerHTML = error_message;
  $("#resubmit").click(resubmit);
}

function resubmit() {
  document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
  reprompt = setTimeout(prompt_resubmit, 10000);
  psiTurk.saveData({
    success: function () {
      clearInterval(reprompt);
      psiTurk.completeHIT(); // when finished saving compute bonus, the quit
    },
    error: prompt_resubmit,
  });
}
