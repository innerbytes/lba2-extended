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
  TwinsenThanks: 8,
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

  // TODO - see if twinsen has any move script on this scene
  // TODO - be able to return move script handling to the vanilla engine
  twinsen.handleMoveScript();

  twinsen.handleLifeScript((objectId) => {
    const sceneStore = useSceneStore();

    if (sceneStore.state === States.CheckingEntranceFromBalcony) {
      if (twinsen.getPos().minus(balconyCenter).sqrMagnitude() < 2000 * 2000) {
        // Check if we have no gazogem with us
        // TODO - check if we come here second time, after giving gazogem to Baldino, should we still run this? Is it possible to get the second gazogem?
        const gazogem = scene.getGameVariable(scene.GameVariables.INV_GAZOGEM);
        if (!gazogem) {
          console.log("Twinsen forgot his gazogem!");
          sceneStore.state = States.TwinsenOnBalconyWithoutGazogem;
          return false;
        }
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
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(textId, "Hey, buddy! Haven't you forgotten something?")
      );

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

      ida.life(objectId, ida.Life.LM_MESSAGE, text.update(textId, "What? Oh no... My gazogem!"));
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(textId, "Ha-ha! You did forget it!")
      );
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(
          textId,
          "Incredible! You did so big effort storming this factory, killed so many of us, just to forget your gazogem in the final room! Aren't you a genius?"
        )
      );
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE,
        text.update(
          textId,
          "Damn! I can't believe it... What am I supposed to do now? Without my gazogem, I won't be able to go back to my world!"
        )
      );
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE,
        text.update(
          textId,
          "You know what? Now I will need to storm the whole factory again just to get another gazogem... Stupid me!"
        )
      );
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(
          textId,
          "No! Plese don't! We got enough of you here already! Even the dogs stopped barking and are depressed, staring in one direction.\nPlease, take this gazogem, and never come back!"
        )
      );

      sceneStore.state = States.WorkerIsGivingGazogem;
      ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, gazogemId, 255);
      ida.life(gazogemId, ida.Life.LM_BETA, 1024);
      startCoroutine(knartaWorkerId, "workerIsGivingGazogem");

      return false;
    }

    if (sceneStore.state === States.WorkerIsGivingGazogem) {
      return false;
    }

    if (sceneStore.state === States.TwinsenThanks) {
      ida.life(objectId, ida.Life.LM_MESSAGE, text.update(textId, "I guess... Thank you, friend!"));
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(textId, "Please, just get lost!")
      );

      startCoroutine(knartaWorkerId, "workerIsLeaving");
      ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.PlayerControl);

      sceneStore.state = States.SceneContinues;

      return false;
    }

    // TODO - handle collision with Gazogem item to obtain it

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
  yield doMove(ida.Move.TM_WAIT_NB_SECOND, 1);
  yield doMove(ida.Move.TM_ANGLE, angle);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.DialogContinues;
  });
}

function* workerIsGivingGazogem() {
  yield doMove(ida.Move.TM_ANGLE, 3072);
  yield doMove(ida.Move.TM_ANIM, 142);
  yield doMove(ida.Move.TM_WAIT_ANIM);
  yield doMove(ida.Move.TM_ANIM, 0);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.TwinsenThanks;
  });
}

function* workerIsLeaving() {
  yield doMove(ida.Move.TM_ANGLE, 2048);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doSceneStore((sceneStore) => (sceneStore.workerDisappears = true));
}
