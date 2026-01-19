const forgotGazogemQuest = require("../quests/forgotGazogem");
const { props, actors } = require("../props");

const L = ida.Life;
const M = ida.Move;

const actor = {
  id: actors.knartaWorker,
  // TODO - this can be common function for actor handler later, if it has info about all quests
  selectBehavior: function () {
    const behavior = forgotGazogemQuest.selectBehavior(this.id);
    if (behavior) {
      return behavior;
    }

    return "";
  },
  behaviors: {
    start: function (objectId) {
      const sceneStore = useSceneStore(this.id);
      if (!sceneStore.hasStarted) {
        ida.life(objectId, L.LM_SET_ANIM_DIAL, 28);
        sceneStore.hasStarted = true;
        this.startCoroutine("startingDialog");
      }
    },
    giveGazogem: function (objectId) {
      const sceneStore = useSceneStore(this.id);
      if (sceneStore.hasGivenGazogem) {
        return;
      }

      ida.life(objectId, L.LM_SET_LIFE_POINT_OBJ, props.gazogemId, 255);
      ida.life(props.gazogemId, L.LM_BETA, 1024);
      sceneStore.hasGivenGazogem = true;
    },
    disappear: function (objectId) {
      const sceneStore = useSceneStore(this.id);
      if (!sceneStore.disappeared) {
        ida.life(objectId, L.LM_SUICIDE);
        sceneStore.disappeared = true;
      }
    },
  },
  coroutines: {
    startingDialog: function* () {
      // TODO - support life scripts from coroutine, so we can easier play longer sequences of events
      // yield doLife(() => {});

      yield doMove(M.TM_WAIT_NB_SECOND, 2);
      yield doMove(M.TM_FACE_TWINSEN, -1);
      yield forgotGazogemQuest.doSceneStore((sceneStore) => {
        sceneStore.state = forgotGazogemQuest.states.DialogStarted;
      });
    },
    givingGazogem: function* () {
      yield doMove(M.TM_ANGLE, 3072);
      yield forgotGazogemQuest.doSceneStore((sceneStore) => {
        sceneStore.state = forgotGazogemQuest.states.WorkerGaveGazogem;
      });
      yield doMove(M.TM_SAMPLE, 153);
      yield doMove(M.TM_ANIM, 0);
      yield doMove(M.TM_FACE_TWINSEN, -1);
      yield forgotGazogemQuest.doSceneStore((sceneStore) => {
        sceneStore.state = forgotGazogemQuest.states.TwinsenThanks;
      });
    },
    leaving: function* () {
      yield doMove(M.TM_ANGLE, 2048);
      yield doMove(M.TM_WAIT_NB_DIZIEME, 5);
      yield doMove(M.TM_ANIM, 1);
      yield doMove(M.TM_WAIT_NB_DIZIEME, 6);
      yield forgotGazogemQuest.doSceneStore((sceneStore) => (sceneStore.workerDisappears = true));
    },
  },
};

module.exports = actor;
