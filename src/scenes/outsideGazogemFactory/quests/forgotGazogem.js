const { Dialog } = require("../../../lib/dialog");
const Scene = require("../../outsideGazogemFactory/scene");

const quest = {
  id: "forgotGazogem",
  init: function (dialogHandler, knartaWorkerId) {
    this.dialogs = createDialogs(dialogHandler, knartaWorkerId);
  },
  initState: function () {
    const sceneStore = this.useSceneStore();
    sceneStore.state = this.states.CheckingEntranceFromBalcony;
  },
  states: {
    SceneContinues: 0,
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
  selectBehavior: function (actorId) {
    const sceneStore = this.useSceneStore();
    const state = sceneStore.state;

    if (actorId === Scene.actors.twinsen) {
      if (!state || state === this.states.SceneContinues) {
        return "";
      }

      if (state === this.states.CheckingEntranceFromBalcony) {
        return "checkingEntranceFromBalcony";
      }
      if (state === this.states.TwinsenOnBalconyWithoutGazogem) {
        return "onBalconyWithoutGazogem";
      }
      if (state === this.states.DialogStarted) {
        return "dialogAboutGazogemStart";
      }
      if (state === this.states.DialogContinues) {
        return "dialogAboutGazogemMain";
      }
      if (state === this.states.TwinsenThanks) {
        return "dialogAboutGazogemFinal";
      }

      return "busy";
    } else if (actorId === Scene.actors.knartaWorker) {
      if (sceneStore.workerDisappears) {
        return "disappear";
      }

      if (state == this.states.DialogIsStarting) {
        return "start";
      }

      if (state === this.states.WorkerGaveGazogem) {
        return "giveGazogem";
      }

      return "";
    }

    return "";
  },

  // TODO - make quest prototype that will have those facilitators
  useSceneStore: function () {
    return useSceneStore(this.id);
  },
  doSceneStore: function (callback) {
    return doSceneStore((sceneStore) => callback(sceneStore[this.id]));
  },
};

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
