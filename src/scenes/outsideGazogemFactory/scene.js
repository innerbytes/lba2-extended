const { createActor, createPickableItem } = require("../../lib/actor");
const SceneManager = require("../../lib/sceneManager");
const { props } = require("./props");
const forgotGazogemQuest = require("./quests/forgotGazogem");
const twinsenBehavior = require("./actors/twinsen");
const knartaWorkerBehavior = require("./actors/knartaWorker");

const outsideOfGazogemeFactoryScene = {
  id: 108,
  afterLoad: afterLoad,
};
module.exports = outsideOfGazogemeFactoryScene;

// Entities
const knartaWorkerEntityId = 56;
const gazogemEntityId = 305;

function afterLoad(loadMode) {
  // Creating scene manager, passing all the quests for this scene
  const sceneManager = new SceneManager([forgotGazogemQuest]);

  // Zones
  props.exitZoneValue = scene.findFreeZoneValue(object.ZoneTypes.Sceneric);
  console.log("Zone value for exit zones:", props.exitZoneValue);

  const exitZoneCount = 3;
  const exitZoneId = scene.addZones(exitZoneCount);
  const exitZones = Array.from({ length: exitZoneCount }, (_, i) => scene.getZone(exitZoneId + i));
  exitZones.forEach((zone) => {
    zone.setType(object.ZoneTypes.Sceneric);
    zone.setZoneValue(props.exitZoneValue);
  });

  // Area where he jumps to the ground from the Refinery Balcony
  exitZones[0].setPos1([17019, 1300, 27028]);
  exitZones[0].setPos2([19203, 3000, 29053]);

  exitZones[1].setPos1([19203, 1300, 27900]);
  exitZones[1].setPos2([25200, 3000, 29200]);

  exitZones[2].setPos1([21692, 1300, 27175]);
  exitZones[2].setPos2([24957, 3000, 27805]);

  // Actors
  const twinsenHandler = sceneManager.createActorHandler(twinsenBehavior);
  const twinsen = scene.getObject(0);

  // TODO - be able to return move script handling to the vanilla engine
  // Twinsen has no move scripts on this scene, but for general case we need to be able to get back to handle original move scripts
  twinsenHandler.init(twinsen, loadMode, props.exitZoneValue);

  const knartaWorkerHandler = sceneManager.createActorHandler(knartaWorkerBehavior);
  const knartaWorker = createActor(knartaWorkerEntityId, {
    position: props.balconyCenter,
    talkColor: text.Colors.Seafoam,
    isDisabled: true,
  });
  props.knartaWorkerId = knartaWorkerHandler.init(knartaWorker, loadMode);

  const gazogem = createPickableItem(gazogemEntityId, scene.GameVariables.INV_GAZOGEM, {
    isDisabled: true,
    position: props.balconyCenter.minus([600, 0, 0]),
    clearHoloPos: 140,
    recenterCamera: true,
    resetHeroStance: true,
  });
  props.gazogemId = gazogem.getId();

  // Quests initialization
  sceneManager.initQuests();

  // Init quest states
  if (loadMode === scene.LoadModes.PlayerMovedHere) {
    sceneManager.initQuestStates();
  }
}
