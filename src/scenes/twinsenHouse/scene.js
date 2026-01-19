const SceneManager = require("../../lib/sceneManager");
const zoeBehavior = require("./actors/zoe");

const twinsenHouseScene = {
  id: 0,
  afterLoad: afterLoad,
};
module.exports = twinsenHouseScene;

function afterLoad(loadMode) {
  const sceneManager = new SceneManager(loadMode);

  // Actors
  const zoeHandler = sceneManager.createActorHandler(zoeBehavior);
  const zoe = scene.getObject(4);
  zoeHandler.init(zoe);

  // Quests initialization
  sceneManager.initQuests();

  // Init quest states
  if (loadMode === scene.LoadModes.PlayerMovedHere || loadMode === scene.LoadModes.NewGameStarted) {
    sceneManager.initQuestStates();
  }
}
