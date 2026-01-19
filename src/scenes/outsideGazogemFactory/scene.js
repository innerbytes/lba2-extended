const { createActor, createPickableItem } = require("../../lib/actor");
const ActorManager = require("../../lib/actorManager");
const { DialogHandler } = require("../../lib/dialog");
const forgotGazogemQuest = require("./quests/forgotGazogem");
const twinsenBehavior = require("./actors/twinsen");
const knartaWorkerBehavior = require("./actors/knartaWorker");

// Outside of the Gazogem Factory scene (108)
const Scene = {
  id: 108,
  afterLoad: afterLoad,
  actors: {
    twinsen: "twinsen",
    knartaWorker: "knartaWorker",
  },
  props: {
    balconyCenter: [20832, 3365, 27271],
    exitZoneValue: null,
    knartaWorkerId: null,
    gazogemId: null,
  },
};
module.exports = Scene;

// Entities
const knartaWorkerEntityId = 56;
const gazogemEntityId = 305;

function afterLoad(loadMode) {
  // Zones
  Scene.props.exitZoneValue = scene.findFreeZoneValue(object.ZoneTypes.Sceneric);

  const exitZoneCount = 3;
  const exitZoneId = scene.addZones(exitZoneCount);
  const exitZones = Array.from({ length: exitZoneCount }, (_, i) => scene.getZone(exitZoneId + i));
  exitZones.forEach((zone) => {
    zone.setType(object.ZoneTypes.Sceneric);
    zone.setZoneValue(Scene.props.exitZoneValue);
  });

  // Area where he jumps to the ground from the Refinery Balcony
  exitZones[0].setPos1([17019, 1300, 27028]);
  exitZones[0].setPos2([19203, 3000, 29053]);

  exitZones[1].setPos1([19203, 1300, 27900]);
  exitZones[1].setPos2([25200, 3000, 29200]);

  exitZones[2].setPos1([21692, 1300, 27175]);
  exitZones[2].setPos2([24957, 3000, 27805]);

  // Actors
  const actorManager = new ActorManager();

  const twinsenHandler = actorManager.createHandler(twinsenBehavior);
  const twinsen = scene.getObject(0);

  // TODO - be able to return move script handling to the vanilla engine
  // Twinsen has no move scripts on this scene, but for general case we need to be able to get back to handle original move scripts
  twinsenHandler.init(twinsen, Scene.props.exitZoneValue);

  const knartaWorkerHandler = actorManager.createHandler(knartaWorkerBehavior);
  const knartaWorker = createActor(knartaWorkerEntityId, {
    position: Scene.props.balconyCenter,
    talkColor: text.Colors.Seafoam,
    isDisabled: true,
  });
  Scene.props.knartaWorkerId = knartaWorkerHandler.init(knartaWorker);

  const gazogem = createPickableItem(gazogemEntityId, scene.GameVariables.INV_GAZOGEM, {
    isDisabled: true,
    position: Scene.props.balconyCenter.minus([600, 0, 0]),
    clearHoloPos: 140,
    recenterCamera: true,
    resetHeroStance: true,
  });
  Scene.props.gazogemId = gazogem.getId();

  // Quests
  const dialogHandler = new DialogHandler();
  forgotGazogemQuest.init(dialogHandler, Scene.props.knartaWorkerId);

  // Init quest states
  if (loadMode === scene.LoadModes.PlayerMovedHere) {
    forgotGazogemQuest.initState();
  }
}

/*
function twinsenLife(objectId) {
  const sceneStore = useSceneStore();

  if (sceneStore.state === States.CheckingEntranceFromBalcony) {
    if (
      scene.getGameVariable(scene.GameVariables.INV_GAZOGEM) > 0 ||
      scene.getGameVariable(127) > 0 // State after which Twinsen doesn't need gazogem anymore
    ) {
      sceneStore.state = States.SceneContinues;
      return true;
    }

    const twinsen = scene.getObject(0);
    if (twinsen.getPos().minus(balconyCenter).sqrMagnitude() < 2000 * 2000) {
      sceneStore.state = States.TwinsenOnBalconyWithoutGazogem;
      return false;
    }

    sceneStore.state = States.SceneContinues;
    return true;
  }

  if (sceneStore.state === States.TwinsenOnBalconyWithoutGazogem) {
    if (twinsenInExitZone.isTrue()) {
      startDialogWithWorker(objectId);
      sceneStore.state = States.DialogIsStarting;
      return false;
    }

    return true;
  }

  if (sceneStore.state === States.DialogIsStarting) {
    return false;
  }

  if (sceneStore.state === States.DialogStarted) {
    initialDialog.play();

    sceneStore.state = States.TwinsenIsTurning;
    ida.life(objectId, ida.Life.LM_CINEMA_MODE, 0);

    const twinsen = scene.getObject(0);
    const knartaWorker = scene.getObject(knartaWorkerId);
    startCoroutine(objectId, "twinsenIsTurning", getAngleToObject(twinsen, knartaWorker));

    return false;
  }

  if (sceneStore.state === States.TwinsenIsTurning) {
    return false;
  }

  if (sceneStore.state === States.DialogContinues) {
    ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);

    mainDialog.play();

    sceneStore.state = States.WorkerIsGivingGazogem;
    startCoroutine(knartaWorkerId, "workerIsGivingGazogem");

    return false;
  }

  if (sceneStore.state === States.WorkerIsGivingGazogem) {
    return false;
  }

  if (sceneStore.state === States.WorkerGaveGazogem) {
    if (sceneStore.gazogemIsPresent) {
      return false;
    }

    ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, gazogemId, 255);
    ida.life(gazogemId, ida.Life.LM_BETA, 1024);
    sceneStore.gazogemIsPresent = true;

    return false;
  }

  if (sceneStore.state === States.TwinsenThanks) {
    finalDialog.play();

    startCoroutine(knartaWorkerId, "workerIsLeaving");
    ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.PlayerControl);

    sceneStore.state = States.SceneContinues;

    return false;
  }

  return true;
}

function knartaWorkerLife(objectId) {
  const sceneStore = useSceneStore();
  if (sceneStore.state === States.DialogIsStarting && !sceneStore.knartaIsInit) {
    ida.life(objectId, ida.Life.LM_SET_ANIM_DIAL, 28);
    sceneStore.knartaIsInit = true;
    return;
  }

  if (sceneStore.state === States.SceneContinues && sceneStore.workerDisappears) {
    ida.life(objectId, ida.Life.LM_SUICIDE);
    sceneStore.workerDisappears = false;
  }
}
*/
