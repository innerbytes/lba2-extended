const { Dialog } = require("../../../lib/dialog");
const createQuest = require("../../../lib/quest");
const { actors, props } = require("../props");

const quest = createQuest({
  id: "forgotGazogem",
  init: function (sceneManager) {
    this.dialogs = createDialogs(sceneManager.dialogHandler, props.knartaWorkerId);
  },
  initState: function () {
    const sceneStore = this.useSceneStore();
    sceneStore.state = this.states.CheckingEntranceFromBalcony;
  },
  states: {
    // 0 state means quest is not active
    None: 0,
    CheckingEntranceFromBalcony: 1,
    TwinsenOnBalconyWithoutGazogem: 2,
    DialogIsStarting: 3,
    DialogStarted: 4,
    TwinsenIsTurning: 5,
    DialogContinues: 6,
    WorkerIsGivingGazogem: 7,
    WorkerGaveGazogem: 8,
    TwinsenThanks: 9,
  },
  behaviors: {
    [actors.twinsen]: function (quest) {
      const sceneStore = quest.useSceneStore();
      const state = sceneStore.state;
      const States = quest.states;

      switch (state) {
        case undefined:
        case States.None:
          return "";
        case States.CheckingEntranceFromBalcony:
          return "checkingEntranceFromBalcony";
        case States.TwinsenOnBalconyWithoutGazogem:
          return "onBalconyWithoutGazogem";
        case States.DialogStarted:
          return "dialogAboutGazogemStart";
        case States.DialogContinues:
          return "dialogAboutGazogemMain";
        case States.TwinsenThanks:
          return "dialogAboutGazogemFinal";
        default:
          return "busy";
      }
    },
    [actors.knartaWorker]: function (quest) {
      const sceneStore = quest.useSceneStore();

      if (sceneStore.workerDisappears) {
        return "disappear";
      }

      const state = sceneStore.state;
      const States = quest.states;

      switch (state) {
        case States.DialogIsStarting:
          return "start";
        case States.WorkerGaveGazogem:
          return "giveGazogem";
        default:
          return "";
      }
    },
  },
});

module.exports = quest;

function createDialogs(dialogHandler, knartaWorkerId) {
  const initialDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [["them", "Hey, buddy... forgetting something?"]],
  });

  const mainDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [
      ["me", "What?! Oh no... my Gazogem!"],
      ["them", "Ha! You really forgot it!"],
      [
        "them",
        "Amazing. You stormed the whole factory, flattened half my colleagues... and then left your Gazogem in the last room. Brilliant. Truly.",
      ],
      [
        "me",
        "Blast! I can't believe it... What am I supposed to do now? Without the Gazogem, I can't get back to my world!",
      ],
      ["me", "You know what? Now I will need to storm the whole factory again... Stupid me!"],
      [
        "them",
        "No! Please, don't! We've had enough of you already! Even the dogs stopped barking - they are just sitting weirdly, staring into space.\nHere, take this Gazogem... and please never come back!",
      ],
    ],
  });

  const finalDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [
      ["me", "Uh... thanks. I guess."],
      ["them", "Please. Just get lost!"],
    ],
  });

  return { initialDialog, mainDialog, finalDialog };
}
