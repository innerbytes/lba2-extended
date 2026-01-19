const Scene = require("../scene");
const { IsActorInZoneTrigger } = require("../../../lib/triggers");

let twinsenInExitZoneTrigger;

// TODO - behaviors and coroutines can probably be main or per-quest, so we can segregate them better
const actor = {
  init: function () {
    twinsenInExitZoneTrigger = new IsActorInZoneTrigger(0, Scene.props.exitZoneValue);
  },
  behaviours: {
    default: function () {
      return true;
    },
    busy: function () {
      return false;
    },
    checkingEntranceFromBalcony: function () {
      const sceneStore = useSceneStore();
      const States = Scene.states;

      if (
        scene.getGameVariable(scene.GameVariables.INV_GAZOGEM) > 0 ||
        scene.getGameVariable(127) > 0 // State after which Twinsen doesn't need gazogem anymore
      ) {
        sceneStore.state = States.SceneContinues;
        return true;
      }

      const twinsen = scene.getObject(0);
      if (twinsen.getPos().minus(Scene.props.balconyCenter).sqrMagnitude() < 2000 * 2000) {
        sceneStore.state = States.TwinsenOnBalconyWithoutGazogem;
        return false;
      }

      sceneStore.state = States.SceneContinues;
      return true;
    },
    onBalconyWithoutGazogem: function (objectId) {
      const sceneStore = useSceneStore();

      if (twinsenInExitZoneTrigger.isTrue()) {
        startDialogWithWorker(objectId);
        sceneStore.state = Scene.states.DialogIsStarting;
        return false;
      }

      return true;
    },
    dialogAboutGazogemStart: function (objectId) {
      Scene.dialogs.initialDialog.play();
      const sceneStore = useSceneStore();

      sceneStore.state = Scene.states.TwinsenIsTurning;
      ida.life(objectId, ida.Life.LM_CINEMA_MODE, 0);

      const twinsen = scene.getObject(0);
      const knartaWorker = scene.getObject(Scene.props.knartaWorkerId);
      startCoroutine(objectId, "twinsenIsTurning", getAngleToObject(twinsen, knartaWorker));

      return false;
    },
    dialogAboutGazogemMain: function (objectId) {
      const sceneStore = useSceneStore();

      ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);

      Scene.dialogs.mainDialog.play();

      sceneStore.state = Scene.states.WorkerIsGivingGazogem;

      // TODO - do not directly start coroutine on other object, but communicate through message
      startCoroutine(Scene.props.knartaWorkerId, "workerIsGivingGazogem");

      return false;
    },
    dialogGazogemFinal: function (objectId) {
      const sceneStore = useSceneStore();

      Scene.dialogs.finalDialog.play();

      startCoroutine(Scene.props.knartaWorkerId, "workerIsLeaving");
      ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.PlayerControl);

      sceneStore.state = Scene.states.SceneContinues;

      return false;
    },
  },

  coroutines: {
    turningTowardsWorker: function* (targetAngle) {
      yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
      yield doMove(ida.Move.TM_ANGLE, targetAngle);
      yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
      yield doSceneStore((sceneStore) => {
        sceneStore.state = Scene.states.DialogContinues;
      });
    },
  },
};

// TODO - this will be moved to be an objectHelper function
function getAngleToObject(sourceObject, targetObject) {
  const sourcePos = sourceObject.getPos();
  const targetPos = targetObject.getPos();

  const deltaX = targetPos[0] - sourcePos[0];
  const deltaZ = targetPos[2] - sourcePos[2];
  const angleRad = Math.atan2(deltaX, deltaZ);

  // Convertor functions will be fixed to always return positive angles
  let angle = object.radiansToAngle(angleRad);
  if (angle < 0) {
    angle += 4096;
  }
  return angle;
}

function startDialogWithWorker(objectId) {
  ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, Scene.props.knartaWorkerId, 255);
  ida.life(objectId, ida.Life.LM_CINEMA_MODE, 1);
  ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.NoMovement);
  ida.life(objectId, ida.Life.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
  ida.life(objectId, ida.Life.LM_SET_ANIM_DIAL, 28);

  startCoroutine(Scene.props.knartaWorkerId, "dialogIsStarting");
}
