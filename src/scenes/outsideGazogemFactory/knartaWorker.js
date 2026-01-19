const Scene = require("./scene");

const actorName = "knartaWorker";

const actor = {
  behaviours: {
    start: function (objectId) {
      const sceneStore = useSceneStore(actorName);
      if (!sceneStore.knartaIsInit) {
        ida.life(objectId, ida.Life.LM_SET_ANIM_DIAL, 28);
        sceneStore.knartaIsInit = true;
        return;
      }
    },
    givingGazogem: function (objectId) {
      const sceneStore = useSceneStore(actorName);

      if (sceneStore.hasGivenGazogem) {
        return false;
      }

      ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, Scene.props.gazogemId, 255);
      ida.life(Scene.props.gazogemId, ida.Life.LM_BETA, 1024);
      sceneStore.hasGivenGazogem = true;

      return false;
    },
    disappear: function (objectId) {
      const sceneStore = useSceneStore(actorName);
      if (!sceneStore.workerDisappeared) {
        ida.life(objectId, ida.Life.LM_SUICIDE);
        sceneStore.workerDisappeared = true;
      }
    },
  },
  coroutines: {
    startingDialog: function* () {
      // TODO - support life scripts from coroutine, so we can play the whole sequence of events
      // yield doLife(() => {});

      yield doMove(ida.Move.TM_WAIT_NB_SECOND, 2);
      yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.DialogStarted;
      });
    },
    givingGazogem: function* () {
      yield doMove(ida.Move.TM_ANGLE, 3072);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.WorkerGaveGazogem;
      });
      yield doMove(ida.Move.TM_SAMPLE, 153);
      yield doMove(ida.Move.TM_ANIM, 0);
      yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.TwinsenThanks;
      });
    },
    leaving: function* () {
      yield doMove(ida.Move.TM_ANGLE, 2048);
      yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
      yield doMove(ida.Move.TM_ANIM, 1);
      yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 6);

      // TODO - switch behavior correctly
      yield doSceneStore((sceneStore) => (sceneStore.workerDisappears = true));
    },
  },
};
