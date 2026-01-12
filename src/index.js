console.log("Welcome to the LBA2 Extended edition!\n");

const knartaWorkerEntityId = 56;
const balconyCenter = [20832, 3365, 27271];

let tempStore;
let exitZoneValue;
let knartaWorkerId;
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
  const knartaWorkerId = scene.addObjects();
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

  registerCoroutine("dialogIsStarting", dialogIsStarting);

  if (sceneLoadMode === scene.LoadModes.PlayerMovedHere) {
    const sceneStore = useSceneStore();
    sceneStore.checkingEntranceFromBalcony = true;
  }

  twinsen.handleLifeScript((objectId) => {
    const sceneStore = useSceneStore();
    if (sceneStore.checkingEntranceFromBalcony) {
      if (twinsen.getPos().minus(balconyCenter).sqrMagnitude() < 2000 * 2000) {
        // Check if we have no gazogem with us
        // TODO - check if we come here second time, after giving gazogem to Baldino, should we still run this? Is it possible to get the second gazogem?
        const gazogem = scene.getGameVariable(scene.GameVariables.INV_GAZOGEM);
        if (!gazogem) {
          console.log("Twinsen forgot his gazogem!");
          sceneStore.twinsenForgotGazogem = true;
        }
      }

      sceneStore.checkingEntranceFromBalcony = false;
      return true;
    }

    if (!sceneStore.twinsenForgotGazogem) {
      return true;
    }

    if (sceneStore.dialogWithKnartaWorkerStarting) {
      return false;
    }

    if (sceneStore.dialogWithKnartaWorkerStarted) {
      ida.life(
        objectId,
        ida.Life.LM_MESSAGE_OBJ,
        knartaWorkerId,
        text.update(textId, "Hey, buddy! Haven't you forgotten something?")
      );

      // TODO - need to start twinsen turning

      ida.life(objectId, ida.Life.LM_MESSAGE, text.update(textId, "What? Oh no... My gazogem!"));

      // Throw item

      sceneStore.dialogWithKnartaWorkerStarted = false;
      sceneStore.twinsenForgotGazogem = false;

      return false;
    }

    // Checking if Twinsen landed to the ground near the balcony
    // TODO - add to an util function
    if (
      isTriggeredTrue(
        sceneStore,
        "landedNearBalcony",
        ida.lifef(objectId, ida.Life.LF_ZONE) === exitZoneValue
      )
    ) {
      // Start dialog with a knartas worker guy
      ida.life(objectId, ida.Life.LM_SET_LIFE_POINT_OBJ, knartaWorkerId, 255);
      ida.life(objectId, ida.Life.LM_CINEMA_MODE, 1);
      ida.life(objectId, ida.Life.LM_SET_CONTROL, object.ControlModes.NoMovement);
      ida.life(objectId, ida.Life.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
      // TODO - see if we need to set anim dial for Twinsen

      startCoroutine(knartaWorkerId, "dialogIsStarting");
      sceneStore.dialogWithKnartaWorkerStarting = true;

      return false;
    }

    return true;
  });
});

function* dialogIsStarting() {
  yield doMove(ida.Move.TM_WAIT_NB_SECOND, 2);
  yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
  yield doMove(ida.Move.TM_ANIM, 28);
  yield doSceneStore((sceneStore) => {
    sceneStore.dialogWithKnartaWorkerStarted = true;
    sceneStore.dialogWithKnartaWorkerStarting = false;
  });
}
