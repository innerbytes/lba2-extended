const Scene = require("../scene");

const L = ida.Life;
const M = ida.Move;

const actor = {
  id: Scene.actors.knartaWorker,
  behaviours: {
    start: function (objectId) {
      const sceneStore = useSceneStore(this.id);
      if (!sceneStore.hasStarted) {
        ida.life(objectId, L.LM_SET_ANIM_DIAL, 28);
        sceneStore.hasStarted = true;
      }
    },
    giveGazogem: function (objectId) {
      const sceneStore = useSceneStore(this.id);
      if (sceneStore.hasGivenGazogem) {
        return;
      }

      ida.life(objectId, L.LM_SET_LIFE_POINT_OBJ, Scene.props.gazogemId, 255);
      ida.life(Scene.props.gazogemId, L.LM_BETA, 1024);
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
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.DialogStarted;
      });
    },
    givingGazogem: function* () {
      yield doMove(M.TM_ANGLE, 3072);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.WorkerGaveGazogem;
      });
      yield doMove(M.TM_SAMPLE, 153);
      yield doMove(M.TM_ANIM, 0);
      yield doMove(M.TM_FACE_TWINSEN, -1);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.TwinsenThanks;
      });
    },
    leaving: function* () {
      yield doMove(M.TM_ANGLE, 2048);
      yield doMove(M.TM_WAIT_NB_DIZIEME, 5);
      yield doMove(M.TM_ANIM, 1);
      yield doMove(M.TM_WAIT_NB_DIZIEME, 6);

      // TODO - can call it thtough static StateManager method
      // yield doSceneStore((sceneStore) => StateManager.doBehavior(sceneStore, "disappear"));
      yield doSceneStore((sceneStore) => (sceneStore.behaviour.disappear = true));
    },
  },
};
