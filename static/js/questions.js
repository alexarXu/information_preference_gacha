// Comprehension question bank (see makeQuestions for section order).
// Count: 17 core + 3 room questions when useEnvironmentBlocks (20 total).

var COMPREHENSION_QUESTION_COUNT_CORE = 17;
var COMPREHENSION_QUESTION_COUNT_ROOMS = 3;

function comprehensionQuestionCount(useEnvironmentBlocks, options) {
  options = options || {};
  if (options.biddingQuestionsOnly) {
    return 8;
  }
  var includeBiddingQuestions = options.includeBiddingQuestions !== false;
  var coreCount = includeBiddingQuestions ? COMPREHENSION_QUESTION_COUNT_CORE : 9;
  return useEnvironmentBlocks
    ? coreCount + COMPREHENSION_QUESTION_COUNT_ROOMS
    : coreCount;
}

function makeConditionalQuestion(trial, questionID) {
  return {
    timeline: [trial],
    conditional_function: function () {
      return !(questionID in answeredCorrectly && answeredCorrectly[questionID]);
    },
  };
}

function makeMultiChoiceQuestion(id, name, prompt, options, correctAnswerIndex) {
  return {
    type: jsPsychSurveyMultiChoice,
    show_clickable_nav: true,
    questions: [
      {
        id: id,
        name: name,
        prompt: prompt,
        options: options,
        answerindices: [0, 1, 2, 3],
        correctAnswerIndex: correctAnswerIndex,
      },
    ],
    on_load: function () {
      if (typeof setupInstructionVideos === "function") {
        setupInstructionVideos(document);
      }
    },
    on_finish: function (data) {
      evaluateAnswer(data);
    },
  };
}

function roomEnvironmentOptions(roomTimeBudgetMinutes, roomLearningTrials) {
  return [
    "<span style='font-weight: 400'>One machine per trial. After you select it, you must wait for it to deliver its ball. There is nothing you can do on that trial to change how many coins you receive.</span>",
    "<span style='font-weight: 400'>You have a limited time budget for the block. The budget counts down only while you are waiting for the machine to deliver its ball. After your cue, you may skip the ball to end the trial immediately without receiving its coins.</span>",
    "<span style='font-weight: 400'>On each trial you choose between a red machine and a blue machine. One gives more coins on average and one gives fewer; you must learn which is which by trial and error. After each set of " +
      String(roomLearningTrials) +
      " trials, the good and bad machine colors are randomized again.</span>",
    "<span style='font-weight: 400'>The room you are in determines how many coins are inside each ball before you bid.</span>",
  ];
}

function cueMeaningOptions() {
  return [
    "<span style='font-weight: 400'>It shows exactly how many coins are in your ball (for example, if it shows 5, your ball contains 5 coins).</span>",
    "<span style='font-weight: 400'>It tells you whether the number of coins is better or worse than average (👍 means better than average; 👎 means worse than average).</span>",
    "<span style='font-weight: 400'>It shows the number of coins inside three other balls from the same machine (this gives you a sense of how many coins that machine typically produces).</span>",
    "<span style='font-weight: 400'>It does NOT tell you anything about the coins (it shows a question mark only).</span>",
  ];
}

function makeQuestions(practiceTrials_coinNum, instructions_bidExamples_lowprize, instructions_bidExamples, questionOptions) {
  questionOptions = questionOptions || {};
  var biddingQuestionsOnly = !!questionOptions.biddingQuestionsOnly;
  var includeRoomQuestions = !!questionOptions.useEnvironmentBlocks && !biddingQuestionsOnly;
  var includeBiddingQuestions = biddingQuestionsOnly || questionOptions.includeBiddingQuestions !== false;
  var includeCoreQuestions = !biddingQuestionsOnly;
  var roomTimeBudgetMinutes = questionOptions.taBlockTimeBudgetLabel || questionOptions.totalSessionMinutes || "1:30";
  var roomLearningTrials = questionOptions.learningRoomTrials || 10;
  var prequestions = [];
  var qNum = biddingQuestionsOnly ? 5 : 0;

  function nextLabel(text) {
    qNum += 1;
    return "<p><b>Q" + qNum + ": " + text + "</b></p>";
  }

  var roomOptions = roomEnvironmentOptions(roomTimeBudgetMinutes, roomLearningTrials);
  var cueOptions = cueMeaningOptions();

  var alwaysReceiveCoinsOptionsInfo = [
    "<span style='font-weight: 400'>All of the coins from that ball will be added to my winnings at the end of the trial.</span>",
    "<span style='font-weight: 400'>I only receive coins if I guessed correctly before the ball was delivered.</span>",
    "<span style='font-weight: 400'>Informative cues reduce the number of coins in the ball.</span>",
    "<span style='font-weight: 400'>I never learn or receive the coins when I get an informative cue.</span>",
  ];

  var alwaysReceiveCoinsOptionsBlank = [
    "<span style='font-weight: 400'>All of the coins from that ball will be added to my winnings at the end of the trial.</span>",
    "<span style='font-weight: 400'>I receive fewer coins because I got a blank cue.</span>",
    "<span style='font-weight: 400'>I only receive coins if I bid 0 on the slider.</span>",
    "<span style='font-weight: 400'>Blank cues mean the ball contains 0 coins.</span>",
  ];

  // Q1 — earnings screening
  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q1",
      "totalEarnings",
      nextLabel("What is the possible range of your earnings in this task, assuming you complete it?"),
      [
        "<span style='font-weight: 400'>$0 to $4</span>",
        "<span style='font-weight: 400'>$4 to $8</span>",
        "<span style='font-weight: 400'>$8 to $12</span>",
        "<span style='font-weight: 400'>$" + earnings_total.minEarnings.toFixed(2) + " to $" + earnings_total.maxEarnings.toFixed(2) + "</span>",
      ],
      3
    ),
    "q1"
  ));

  // Q2–Q5 — cue types
  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q2",
      "exactCueMeaning",
      imageTags.informativeCue.exactCue + nextLabel("What does an Exact Cue tell you?"),
      cueOptions,
      0
    ),
    "q2"
  ));

  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q3",
      "ratingCueMeaning",
      imageTags.informativeCue.ratingCue + nextLabel("What does a Rating Cue tell you?"),
      cueOptions,
      1
    ),
    "q3"
  ));

  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q4",
      "machineCueMeaning",
      imageTags.informativeCue.machineCue + nextLabel("What does a Machine Cue tell you?"),
      cueOptions,
      2
    ),
    "q4"
  ));

  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q5",
      "blankCueMeaning",
      imageTags.nonInformativeCue.blankCue + nextLabel("What does a Blank Cue tell you?"),
      cueOptions,
      3
    ),
    "q5"
  ));

  // Q6–Q13 — BDM bidding
  if (includeBiddingQuestions) {
  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q6",
      "bidHigherThanPrice",
      videoTags.stage3.bidForCueHigherThanPrice +
        nextLabel("You bid 0.24 coins for your preferred cue. The computer's price for that cue is 0.22 coins. What happens?"),
      [
        "<span style='font-weight: 400'>You pay 0.24 coins and receive your preferred cue.</span>",
        "<span style='font-weight: 400'>You pay 0 coins and receive the other (non-preferred) type of cue.</span>",
        "<span style='font-weight: 400'>You pay 0.22 coins and receive your preferred cue.</span>",
        "<span style='font-weight: 400'>You pay 0.24 coins but receive the other type of cue.</span>",
      ],
      0
    ),
    "q6"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q7",
      "bidLowerThanPrice",
      videoTags.stage3.bidForCueLowerThanPrice +
        nextLabel("You bid 0.24 coins for your preferred cue. The computer's price is 0.50 coins. What happens?"),
      [
        "<span style='font-weight: 400'>You pay 0.50 coins and receive your preferred cue.</span>",
        "<span style='font-weight: 400'>You pay 0 coins and receive the other (non-preferred) type of cue.</span>",
        "<span style='font-weight: 400'>You pay 0.24 coins and receive your preferred cue.</span>",
        "<span style='font-weight: 400'>You pay 0.50 coins and receive the other type of cue.</span>",
      ],
      1
    ),
    "q7"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q8",
      "netEarningsAfterBid",
      imageTags.trialStage.bidResult +
        nextLabel("Suppose your ball contains " + String(practiceTrials_coinNum) + " coins and you successfully bid for an informative cue: you pay " + String(instructions_bidExamples_lowprize) + " coins and receive it. What are your total earnings on that trial?"),
      [
        "<span style='font-weight: 400'>" + String(practiceTrials_coinNum) + " coins (the bid does not affect earnings).</span>",
        "<span style='font-weight: 400'>" + String(practiceTrials_coinNum + instructions_bidExamples_lowprize) + " coins (" + String(practiceTrials_coinNum) + " + " + String(instructions_bidExamples_lowprize) + ").</span>",
        "<span style='font-weight: 400'>" + String(practiceTrials_coinNum - instructions_bidExamples_lowprize) + " coins (" + String(practiceTrials_coinNum) + " − " + String(instructions_bidExamples_lowprize) + ").</span>",
        "<span style='font-weight: 400'>0 coins (you forfeit the ball when you pay for a cue).</span>",
      ],
      2
    ),
    "q8"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q9",
      "bidNoPreference",
      imageTags.trialStage.bidSampleBidBar +
        nextLabel("What should you do if you do not have a preference for receiving an informative cue or a blank cue?"),
      [
        "<span style='font-weight: 400'>Drag the marker to the left half of the bid slider.</span>",
        "<span style='font-weight: 400'>Drag the marker to the middle of the bid slider, which is labeled with <b>'no bid'</b> and <b>'0'</b>.</span>",
        "<span style='font-weight: 400'>Drag the marker to the right half of the bid slider.</span>",
        "<span style='font-weight: 400'>It does not matter where you drag the marker.</span>",
      ],
      1
    ),
    "q9"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q10",
      "bidPreferBlankCue",
      imageTags.trialStage.bidSampleBidBar +
        nextLabel("What should you do if you prefer receiving a blank cue?"),
      [
        "<span style='font-weight: 400'>Drag the marker to the left half of the bid slider.</span>",
        "<span style='font-weight: 400'>Drag the marker to the middle of the bid slider, which is labeled with <b>'no bid'</b> and <b>'0'</b>.</span>",
        "<span style='font-weight: 400'>Drag the marker to the right half of the bid slider.</span>",
        "<span style='font-weight: 400'>It does not matter where you drag the marker.</span>",
      ],
      0
    ),
    "q10"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q11",
      "bidPreferInformativeCue",
      imageTags.trialStage.bidSampleBidBar +
        nextLabel("What should you do if you prefer receiving an informative cue?"),
      [
        "<span style='font-weight: 400'>Drag the marker to the left half of the bid slider.</span>",
        "<span style='font-weight: 400'>Drag the marker to the middle of the bid slider, which is labeled with <b>'no bid'</b> and <b>'0'</b>.</span>",
        "<span style='font-weight: 400'>Drag the marker to the right half of the bid slider.</span>",
        "<span style='font-weight: 400'>It does not matter where you drag the marker.</span>",
      ],
      2
    ),
    "q11"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q12",
      "biddingProbabilities",
      imageTags.trialStage.bidProbabilityChart +
        nextLabel("Which of the following is an accurate summary of how the bidding procedure works?"),
      [
        "<span style='font-weight: 400'>The bidding does not have any effect on your chances of receiving an informative cue or a blank cue.</span>",
        "<span style='font-weight: 400'>Your chance of getting your preferred cue decreases with the amount of coins you bid. At the same time, the average amount you will pay decreases with the amount of coins you bid.</span>",
        "<span style='font-weight: 400'>Your chance of getting your preferred cue increases with the amount of coins you bid. At the same time, the average amount you will pay increases with the amount of coins you bid.</span>",
        "<span style='font-weight: 400'>Your chance of getting your preferred cue increases with the amount of coins you bid. At the same time, the average amount you will pay decreases with the amount of coins you bid.</span>",
      ],
      2
    ),
    "q12"
  ));

  prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q13",
      "biddingStrategy",
      imageTags.trialStage.bidSampleBidBar +
        nextLabel("Which of the following is an accurate summary of what you should do during the bidding stage?"),
      [
        "<span style='font-weight: 400'>Always drag the marker to the middle of the bid slider, which is labeled with <b>'no bid'</b> and <b>'0'</b>.</span>",
        "<span style='font-weight: 400'>Always drag the marker to the rightmost location of the bid slider.</span>",
        "<span style='font-weight: 400'>Always drag the marker to the leftmost location of the bid slider.</span>",
        "<span style='font-weight: 400'>First decide whether you want an informative cue or a blank cue, then drag the marker to the maximum number of coins you would be willing to pay for your preferred cue.</span>",
      ],
      3
    ),
    "q13"
  ));

  }

  // Q14–Q15 — always receive ball coins
  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q14",
      "alwaysReceiveCoinsInformative",
      imageTags.informativeCue.exactCue +
        nextLabel("You receive an Exact Cue showing 5. The ball is delivered at the end of the trial. Which is true?"),
      alwaysReceiveCoinsOptionsInfo,
      0
    ),
    "q14"
  ));

  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q15",
      "alwaysReceiveCoinsBlank",
      imageTags.nonInformativeCue.blankCue +
        nextLabel("You receive a Blank Cue (?). You do not know how many coins are in the ball until it is deposited. Which is true?"),
      alwaysReceiveCoinsOptionsBlank,
      0
    ),
    "q15"
  ));

  // Q16–Q17 — cue type does not change reward (only information / timing)
  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q16",
      "cueTypeTrialDuration",
      '<div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; margin:12px 0;">' +
        imageTags.informativeCue.exactCue +
        imageTags.nonInformativeCue.blankCue +
      "</div>" +
        nextLabel("How does receiving an informative cue vs. a non-informative cue affect the total duration of the trial?"),
      [
        "<span style='font-weight: 400'>Receiving an informative cue lets me complete the trial faster.</span>",
        "<span style='font-weight: 400'>Receiving a non-informative cue lets me complete the trial faster.</span>",
        "<span style='font-weight: 400'>The type of cue only affects what I learn and when I learn it, not how long it takes to complete the trial.</span>",
        "<span style='font-weight: 400'>None of the above.</span>",
      ],
      2
    ),
    "q16"
  ));

  if (includeCoreQuestions) prequestions.push(makeConditionalQuestion(
    makeMultiChoiceQuestion(
      "q17",
      "cueTypeTrialOutcome",
      '<div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; margin:12px 0;">' +
        imageTags.informativeCue.exactCue +
        imageTags.nonInformativeCue.blankCue +
      "</div>" +
        nextLabel("How does receiving an informative cue vs. a blank cue affect how many coins you receive from the machine on a trial?"),
      [
        "<span style='font-weight: 400'>Receiving an informative cue helps me earn more coins from the machine.</span>",
        "<span style='font-weight: 400'>Receiving a blank cue helps me earn more coins from the machine.</span>",
        "<span style='font-weight: 400'>I might need to pay some coins depending on the result of the bidding. But other than that, the type of cue only affects when and how I learn about the coins, not how many coins are in my ball.</span>",
        "<span style='font-weight: 400'>None of the above.</span>",
      ],
      2
    ),
    "q17"
  ));

  // Q18–Q20 — rooms (shared options, different correct answer per room)
  if (includeRoomQuestions) {
    prequestions.push(makeConditionalQuestion(
      makeMultiChoiceQuestion(
        "q18",
        "basicRoom",
        videoTags.rooms.basicRoom +
          nextLabel("Which of the following descriptions matches the <b>Basic Room</b> (as shown in the video above)?"),
        roomOptions,
        0
      ),
      "q18"
    ));

    prequestions.push(makeConditionalQuestion(
      makeMultiChoiceQuestion(
        "q19",
        "timeBudgetRoom",
        videoTags.rooms.timeBudgetRoom +
          nextLabel("Which of the following descriptions matches the <b>Time Budget Room</b> (as shown in the video above)?"),
        roomOptions,
        1
      ),
      "q19"
    ));

    prequestions.push(makeConditionalQuestion(
      makeMultiChoiceQuestion(
        "q20",
        "learningRoom",
        videoTags.rooms.learningRoom +
          nextLabel("Which of the following descriptions matches the <b>Learning Room</b> (as shown in the video above)?"),
        roomOptions,
        2
      ),
      "q20"
    ));
  }

  return prequestions;
}

var answeredCorrectly = {};
var incorrectAnswerCount = 0;
var isCorrect = 0;

function evaluateAnswer(data) {
  var questionName = Object.keys(data.response)[0];
  var responseOption = data.response[questionName];
  var questionData = jsPsych.getCurrentTrial().questions[0];
  var questionID = questionData.id;
  var responseIndex = questionData.options.indexOf(responseOption);

  // Radio values are HTML attributes; embedded quotes can break string matching.
  if (responseIndex === -1) {
    var checked = document.querySelector("input[type=radio]:checked");
    if (checked && checked.id && checked.id.indexOf("jspsych-survey-multi-choice-response-") === 0) {
      var idParts = checked.id.split("-");
      responseIndex = parseInt(idParts[idParts.length - 1], 10);
    }
  }

  var isCorrect = responseIndex === questionData.correctAnswerIndex;
  answeredCorrectly[questionID] = isCorrect;
  if (!isCorrect) {
    incorrectAnswerCount++;
  }
  data.isCorrect = isCorrect;
  return [isCorrect, incorrectAnswerCount, answeredCorrectly];
}

function setComprehensionQuestionsLayout(active) {
  if (active) {
    document.documentElement.classList.add("comprehension-questions-mode");
  } else {
    document.documentElement.classList.remove("comprehension-questions-mode");
  }
}

function makeQuestionTimelineFrom(questions) {
  var timeline_temp = [];
  for (var i = 0; i < questions.length; i++) {
    timeline_temp.push(questions[i]);
  }
  return timeline_temp;
}

function makeQuestionTimeline() {
  return makeQuestionTimelineFrom(allQuestions);
}

function createComprehensionControlLoop(config) {
  config = config || {};
  var questions = config.questions || [];
  var repeatInstructionsTimeline = config.repeatInstructionsTimeline;
  var taskStagePrefix = config.taskStagePrefix || "questions";
  var instructionsTimeline = config.instructionsTimeline;
  var instructionsQuestionNum = config.instructionsQuestionNum;

  var loopQuestionLoop = true;
  var loopChooseRepeatQuestions = false;
  var loopChooseRepeatInstructionsAndQuestions = false;
  var loopChooseToOptOut = false;
  var loopRepeatQuestionsCount = 0;
  var loopRepeatInstructionsAndQuestionsCount = 0;

  function makeBankQuestionTimeline() {
    return makeQuestionTimelineFrom(questions);
  }

  function makeRepeatInstructionsAndQuestionsTimeline() {
    var timeline_temp2 = [repeatInstructionsTimeline];
    var timeline_temp = makeBankQuestionTimeline();
    for (var i = 0; i < timeline_temp.length; i++) {
      timeline_temp2.push(timeline_temp[i]);
    }
    return timeline_temp2;
  }

  var congratsPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Congrats! You answered all questions correctly!",
    choices: ["Proceed"],
    data: {
      taskStage: taskStagePrefix + "_congratsPage",
      choiceTrials: 0,
    },
    on_finish: function () {
      loopQuestionLoop = false;
    },
  };

  var congratsPage_conditional = {
    timeline: [congratsPage],
    conditional_function: function () {
      return incorrectAnswerCount == 0;
    },
  };

  var choiceTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: ["Repeat wrong questions", "Repeat instructions and wrong questions"],
    data: {
      taskStage: taskStagePrefix + "_chooseToRepeatQuestions",
      choiceTrials: 0,
    },
    on_start: function (trial) {
      trial.stimulus = "You answered " + incorrectAnswerCount + " questions incorrectly. Please choose an option:";
    },
    on_finish: function (data) {
      if (data.response == 0) {
        loopChooseRepeatQuestions = true;
        loopChooseRepeatInstructionsAndQuestions = false;
        loopChooseToOptOut = false;
      } else if (data.response == 1) {
        loopChooseRepeatInstructionsAndQuestions = true;
        loopChooseRepeatQuestions = false;
        loopChooseToOptOut = false;
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
    timeline: makeBankQuestionTimeline(),
    conditional_function: function () {
      return loopChooseRepeatQuestions;
    },
    on_timeline_start: function () {
      incorrectAnswerCount = 0;
      loopRepeatQuestionsCount++;
    },
    on_finish: function () {
      loopChooseRepeatQuestions = false;
      loopRepeatQuestionsCount++;
    },
    data: {
      taskStage: function () {
        return taskStagePrefix + "_repeat_questions_" + loopRepeatQuestionsCount;
      },
      choiceTrials: 0,
    },
  };

  var repeatInstructionsAndQuestions_conditional = {
    timeline: makeRepeatInstructionsAndQuestionsTimeline(),
    conditional_function: function () {
      return loopChooseRepeatInstructionsAndQuestions;
    },
    on_timeline_start: function () {
      incorrectAnswerCount = 0;
      loopRepeatInstructionsAndQuestionsCount++;
    },
    on_finish: function () {
      loopChooseRepeatInstructionsAndQuestions = false;
    },
    data: {
      taskStage: function () {
        return taskStagePrefix + "_repeat_instructions_and_questions_" + loopRepeatInstructionsAndQuestionsCount;
      },
      choiceTrials: 0,
    },
  };

  var finishExperiment_conditional = {
    timeline: [finishExperiment],
    conditional_function: function () {
      return loopChooseToOptOut;
    },
    on_finish: function () {
      loopChooseToOptOut = false;
      loopQuestionLoop = false;
    },
  };

  var controlLoopTimeline = {
    timeline: [
      choiceTrial_conditional,
      repeatQuestions_conditional,
      repeatInstructionsAndQuestions_conditional,
      finishExperiment_conditional,
      congratsPage_conditional,
    ],
    loop_function: function () {
      return loopQuestionLoop;
    },
    on_timeline_start: function () {
      setComprehensionQuestionsLayout(true);
    },
    on_timeline_finish: function () {
      setComprehensionQuestionsLayout(false);
    },
    data: { taskStage: taskStagePrefix + "_answersControlLoop", choiceTrials: 0 },
  };

  var questionsTimeline = {
    timeline: makeBankQuestionTimeline(),
    data: {
      taskStage: taskStagePrefix,
      choiceTrials: 0,
    },
    on_timeline_start: function () {
      incorrectAnswerCount = 0;
      loopQuestionLoop = true;
      loopChooseRepeatQuestions = false;
      loopChooseRepeatInstructionsAndQuestions = false;
      loopChooseToOptOut = false;
      setComprehensionQuestionsLayout(true);
    },
  };

  return {
    instructionsEntryLoop:
      instructionsTimeline && instructionsQuestionNum != null
        ? createComprehensionInstructionsEntryLoop(
            instructionsTimeline,
            instructionsQuestionNum,
            taskStagePrefix
          )
        : null,
    questionsTimeline: questionsTimeline,
    answersControlLoopTimeline: controlLoopTimeline,
  };
}

function makeIQTimeline() {
  var timeline_temp2 = [];
  timeline_temp2.push(instructions);
  var timeline_temp = makeQuestionTimeline();
  for (var i = 0; i < timeline_temp.length; i++) {
    timeline_temp2.push(timeline_temp[i]);
  }
  return timeline_temp2;
}

function makeIQTimelineFull() {
  var timeline_temp3 = [];
  timeline_temp3.push(choiceTrial_conditional, repeatQuestions_conditional, repeatInstructionsAndQuestions_conditional, finishExperiment_conditional, congratsPage_conditional);
  return timeline_temp3;
}
