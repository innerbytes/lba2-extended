const Scene = require("../scene");
const forgotGazogemQuest = require("../quests/forgotGazogem");
const { IsActorInZoneTrigger } = require("../../../lib/triggers");

let twinsenInExitZoneTrigger;

const L = ida.Life;
const M = ida.Move;

// Note - behaviors and coroutines can probably be both main or per-quest, so we can segregate them better
const actor = {
  id: Scene.actors.twinsen,
  init: function (exitZoneValue) {
    twinsenInExitZoneTrigger = new IsActorInZoneTrigger(0, exitZoneValue);
  },
  // TODO - this can be common function for actor handler later, if it has info about all quests
  selectBehavior: function () {
    const behavior = forgotGazogemQuest.selectBehavior(this.id);
    if (behavior) {
      return behavior;
    }

    return "";
  },
  behaviors: {
    default: () => true,
    busy: () => false,
    checkingEntranceFromBalcony: function () {
      const sceneStore = forgotGazogemQuest.useSceneStore();
      const States = forgotGazogemQuest.states;

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
      if (twinsenInExitZoneTrigger.isTrue()) {
        ida.life(objectId, L.LM_SET_LIFE_POINT_OBJ, Scene.props.knartaWorkerId, 255);
        ida.life(objectId, L.LM_CINEMA_MODE, 1);
        ida.life(objectId, L.LM_SET_CONTROL, object.ControlModes.NoMovement);
        ida.life(objectId, L.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
        ida.life(objectId, L.LM_SET_ANIM_DIAL, 28);

        const sceneStore = forgotGazogemQuest.useSceneStore();
        sceneStore.state = forgotGazogemQuest.states.DialogIsStarting;

        return false;
      }

      return true;
    },
    dialogAboutGazogemStart: function (objectId) {
      forgotGazogemQuest.dialogs.initialDialog.play();

      const sceneStore = forgotGazogemQuest.useSceneStore();
      sceneStore.state = forgotGazogemQuest.states.TwinsenIsTurning;
      ida.life(objectId, L.LM_CINEMA_MODE, 0);

      const twinsen = scene.getObject(0);
      const knartaWorker = scene.getObject(Scene.props.knartaWorkerId);
      this.startCoroutine("turningTowardsWorker", getAngleToObject(twinsen, knartaWorker));

      return false;
    },
    dialogAboutGazogemMain: function (objectId) {
      ida.life(objectId, L.LM_CAMERA_CENTER, 0);
      forgotGazogemQuest.dialogs.mainDialog.play();

      const sceneStore = forgotGazogemQuest.useSceneStore();
      sceneStore.state = forgotGazogemQuest.states.WorkerIsGivingGazogem;

      this.getActor(Scene.actors.knartaWorker).startCoroutine("givingGazogem");

      return false;
    },
    dialogGazogemFinal: function (objectId) {
      forgotGazogemQuest.dialogs.finalDialog.play();

      this.getActor(Scene.actors.knartaWorker).startCoroutine("leaving");
      ida.life(objectId, L.LM_SET_CONTROL, object.ControlModes.PlayerControl);

      const sceneStore = forgotGazogemQuest.useSceneStore();
      sceneStore.state = forgotGazogemQuest.states.SceneContinues;

      return false;
    },
  },

  coroutines: {
    turningTowardsWorker: function* (targetAngle) {
      yield doMove(M.TM_WAIT_NB_DIZIEME, 5);
      yield doMove(M.TM_ANGLE, targetAngle);
      yield doMove(M.TM_WAIT_NB_DIZIEME, 5);
      yield forgotGazogemQuest.doSceneStore((sceneStore) => {
        sceneStore.state = forgotGazogemQuest.states.DialogContinues;
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

module.exports = actor;
