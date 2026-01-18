const { createActor, createPickableItem } = require("./lib/actor");
const { IsActorInZoneTrigger } = require("./lib/triggers");
const { DialogHandler, Dialog } = require("./lib/dialog");

console.log("Welcome to the LBA2 Extended edition!\n");

const knartaWorkerEntityId = 56;
const gazogemEntityId = 305;
const balconyCenter = [20832, 3365, 27271];

const States = {
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
};

let exitZoneValue;
let knartaWorkerId;
let gazogemId;

scene.addEventListener(scene.Events.afterLoadScene, (sceneId, sceneLoadMode) => {
  // TODO - use scene router
  if (sceneId !== 108) return;

  const dialogHandler = new DialogHandler();

  const twinsen = scene.getObject(0);

  exitZoneValue = scene.findFreeZoneValue(object.ZoneTypes.Sceneric);

  const exitZoneCount = 3;
  const exitZoneId = scene.addZones(exitZoneCount);
  const exitZones = Array.from({ length: exitZoneCount }, (_, i) => scene.getZone(exitZoneId + i));
  exitZones.forEach((zone) => {
    zone.setType(object.ZoneTypes.Sceneric);
    zone.setZoneValue(exitZoneValue);
  });

  // Area where he jumps to the ground from the Refinery Balcony
  exitZones[0].setPos1([17019, 1300, 27028]);
  exitZones[0].setPos2([19203, 3000, 29053]);

  exitZones[1].setPos1([19203, 1300, 27900]);
  exitZones[1].setPos2([25200, 3000, 29200]);

  exitZones[2].setPos1([21692, 1300, 27175]);
  exitZones[2].setPos2([24957, 3000, 27805]);

  // Add a knarta worker guy
  const knartaWorker = createActor(knartaWorkerEntityId, {
    position: balconyCenter,
    talkColor: text.Colors.Seafoam,
    isDisabled: true,
    handleMove: true,
  });
  knartaWorkerId = knartaWorker.getId();

  const dialogWithWorker = new Dialog(dialogHandler, 0, knartaWorkerId);

  // Add the gazogem item
  const gazogem = createPickableItem(gazogemEntityId, scene.GameVariables.INV_GAZOGEM, {
    isDisabled: true,
    position: balconyCenter.minus([600, 0, 0]),
    clearHoloPos: 140,
    recenterCamera: true,
    resetHeroStance: true,
  });
  gazogemId = gazogem.getId();

  registerCoroutine("dialogIsStarting", dialogIsStarting);
  registerCoroutine("twinsenIsTurning", twinsenIsTurning);
  registerCoroutine("workerIsGivingGazogem", workerIsGivingGazogem);
  registerCoroutine("workerIsLeaving", workerIsLeaving);

  if (sceneLoadMode === scene.LoadModes.PlayerMovedHere) {
    const sceneStore = useSceneStore();
    sceneStore.state = States.CheckingEntranceFromBalcony;
  }

  // TODO - be able to return move script handling to the vanilla engine
  // Twinsen has no move scripts on this scene, but for general case we need to be able to get back to handle original move scripts
  twinsen.handleMoveScript();

  const twinsenInExitZone = new IsActorInZoneTrigger(0, exitZoneValue);

  twinsen.handleLifeScript((objectId) => {
    const sceneStore = useSceneStore();

    if (sceneStore.state === States.CheckingEntranceFromBalcony) {
      if (
        scene.getGameVariable(scene.GameVariables.INV_GAZOGEM) > 0 ||
        scene.getGameVariable(127) > 0 // State after which Twinsen doesn't need gazogem anymore
      ) {
        sceneStore.state = States.SceneContinues;
        return true;
      }

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
      dialogWithWorker.them("Hey, buddy... forgetting something?");
      sceneStore.state = States.TwinsenIsTurning;
      ida.life(objectId, ida.Life.LM_CINEMA_MODE, 0);
      startCoroutine(objectId, "twinsenIsTurning", getAngleToObject(twinsen, knartaWorker));

      return false;
    }

    if (sceneStore.state === States.TwinsenIsTurning) {
      return false;
    }

    if (sceneStore.state === States.DialogContinues) {
      ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);

      dialogWithWorker.me("What?! Oh no... my Gazogem!");
      dialogWithWorker.them("Ha! You really forgot it!");
      dialogWithWorker.them(
        "Amazing. You stormed the whole factory, flattened half my colleagues... and then left your Gazogem in the last room. Brilliant. Truly."
      );
      dialogWithWorker.me(
        "Blast! I can't believe it... What am I supposed to do now? Without the Gazogem, I can't get back to my world!"
      );
      dialogWithWorker.me(
        "You know what? Now I will need to storm the whole factory again... Stupid me!"
      );
      dialogWithWorker.them(
        "No! Please, don't! We've had enough of you already! Even the dogs stopped barking - they are just sitting weirdly, staring into space.\nHere, take this Gazogem... and please never come back!"
      );

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
      dialogWithWorker.me("Uh... thanks. I guess.");
      dialogWithWorker.them("Please. Just get lost!");

      startCoroutine(knartaWorkerId, "workerIsLeaving");
      ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.PlayerControl);

      sceneStore.state = States.SceneContinues;

      return false;
    }

    return true;
  });

  knartaWorker.handleLifeScript((objectId) => {
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
  });
});

// TODO - this will be move to be objectHelper function
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
  ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, knartaWorkerId, 255);
  ida.life(objectId, ida.Life.LM_CINEMA_MODE, 1);
  ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.NoMovement);
  ida.life(objectId, ida.Life.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
  ida.life(objectId, ida.Life.LM_SET_ANIM_DIAL, 28);

  startCoroutine(knartaWorkerId, "dialogIsStarting");
}

function* dialogIsStarting() {
  // TODO - support life scripts from coroutine
  // yield doLife(() => {});

  yield doMove(ida.Move.TM_WAIT_NB_SECOND, 2);
  yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.DialogStarted;
  });
}

function* twinsenIsTurning(angle) {
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doMove(ida.Move.TM_ANGLE, angle);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.DialogContinues;
  });
}

function* workerIsGivingGazogem() {
  yield doMove(ida.Move.TM_ANGLE, 3072);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.WorkerGaveGazogem;
  });
  yield doMove(ida.Move.TM_SAMPLE, 153);
  yield doMove(ida.Move.TM_ANIM, 0);
  yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.TwinsenThanks;
  });
}

function* workerIsLeaving() {
  yield doMove(ida.Move.TM_ANGLE, 2048);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doMove(ida.Move.TM_ANIM, 1);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 6);
  yield doSceneStore((sceneStore) => (sceneStore.workerDisappears = true));
}
