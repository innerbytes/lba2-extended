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

let tempStore;
let exitZoneValue;
let knartaWorkerId;
let gazogemId;
let textId;

scene.addEventListener(scene.Events.afterLoadScene, (sceneId, sceneLoadMode) => {
  // TODO - use scene router
  if (sceneId !== 108) return;

  textId = text.create();

  tempStore = {};

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
  // TODO - make an utility function to add NPCs
  knartaWorkerId = scene.addObjects();
  const knartaWorker = scene.getObject(knartaWorkerId);
  knartaWorker.setEntity(knartaWorkerEntityId);
  knartaWorker.setArmor(255);
  knartaWorker.setControlMode(object.ControlModes.NoMovement);
  knartaWorker.setStaticFlags(
    object.Flags.CanFall |
      object.Flags.CheckCollisionsWithActors |
      object.Flags.CheckCollisionsWithScene
  );
  knartaWorker.setPos(balconyCenter);
  knartaWorker.setTalkColor(text.Colors.Seafoam);
  knartaWorker.handleMoveScript();
  knartaWorker.disable();

  gazogemId = scene.addObjects();
  const gazogem = scene.getObject(gazogemId);
  gazogem.setEntity(gazogemEntityId);
  gazogem.setArmor(255);
  gazogem.setControlMode(object.ControlModes.NoMovement);
  gazogem.setStaticFlags(
    object.Flags.CanFall |
      object.Flags.CheckCollisionsWithActors |
      object.Flags.CheckCollisionsWithScene
  );
  gazogem.setPos(balconyCenter.minus([600, 0, 0]));
  gazogem.disable();

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
      // TODO - add to an util function
      if (
        isTriggeredTrue(
          sceneStore,
          "landedNearBalcony",
          ida.lifef(objectId, ida.Life.LF_ZONE) === exitZoneValue
        )
      ) {
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
      simpleMessage(objectId, knartaWorkerId, "Hey, buddy... forgetting something?");

      sceneStore.state = States.TwinsenIsTurning;
      ida.life(objectId, ida.Life.LM_CINEMA_MODE, 0);
      startCoroutine(objectId, "twinsenIsTurning", getAngleToObject(twinsen, knartaWorker));

      return false;
    }

    if (sceneStore.state === States.TwinsenIsTurning) {
      return false;
    }

    if (sceneStore.state === States.DialogContinues) {
      // TODO - improve documentation for this function, what is angle_adjust?
      ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);

      simpleMyMessage(objectId, "What?! Oh no... my Gazogem!");
      simpleMessage(objectId, knartaWorkerId, "Ha! You really forgot it!");
      simpleMessage(
        objectId,
        knartaWorkerId,
        "Amazing. You stormed the whole factory, flattened half my colleagues... and then left your Gazogem in the last room. Brilliant. Truly."
      );
      simpleMyMessage(
        objectId,
        "Blast! I can't believe it... What am I supposed to do now? Without the Gazogem, I can't get back to my world!"
      );
      simpleMyMessage(
        objectId,
        "You know what? Now I will need to storm the whole factory again... Stupid me!"
      );
      simpleMessage(
        objectId,
        knartaWorkerId,
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
      simpleMyMessage(objectId, "Uh... thanks. I guess.");
      simpleMessage(objectId, knartaWorkerId, "Please. Just get lost!");

      startCoroutine(knartaWorkerId, "workerIsLeaving");
      ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.PlayerControl);

      sceneStore.state = States.SceneContinues;

      return false;
    }

    // Checking collision with Gazogem item to obtain it
    if (scene.getGameVariable(scene.GameVariables.INV_GAZOGEM) === 0) {
      if (ida.lifef(objectId, ida.Life.LF_COL) === gazogemId) {
        ida.life(objectId, ida.Life.LM_KILL_OBJ, gazogemId);
        ida.life(objectId, ida.Life.LM_FOUND_OBJECT, scene.GameVariables.INV_GAZOGEM);
        scene.setGameVariable(scene.GameVariables.INV_GAZOGEM, 1);
        ida.life(objectId, ida.Life.LM_CLR_HOLO_POS, 140);
        ida.life(objectId, ida.Life.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
        ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);
      }
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

// TODO - move to the engine
function getAngleToObject(sourceObject, targetObject) {
  const sourcePos = sourceObject.getPos();
  const targetPos = targetObject.getPos();

  const deltaX = targetPos[0] - sourcePos[0];
  const deltaZ = targetPos[2] - sourcePos[2];
  const angleRad = Math.atan2(deltaX, deltaZ);

  // TODO - modify convertor functions to always return positive game angles
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
  // yield doLife(0, () => {});

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

function simpleMyMessage(objectId, message) {
  simpleMessage(objectId, objectId, message);
}

function simpleMessage(objectId, speakerId, message) {
  if (objectId === speakerId) {
    ida.life(objectId, ida.Life.LM_MESSAGE, text.update(textId, message));
  } else {
    ida.life(objectId, ida.Life.LM_MESSAGE_OBJ, speakerId, text.update(textId, message));
  }
}
