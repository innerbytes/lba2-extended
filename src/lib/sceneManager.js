const ActorHandler = require("./actorHandler");
const { DialogHandler } = require("./dialog");

function SceneManager(quests) {
  this.actorHandlers = new Map();
  this.quests = quests || [];
  this.dialogHandler = new DialogHandler();
}

SceneManager.prototype.initQuests = function () {
  this.quests.forEach((quest) => quest.init?.(this));
};

SceneManager.prototype.initQuestStates = function () {
  this.quests.forEach((quest) => quest.initState?.());
};

SceneManager.prototype.createActorHandler = function (actorBehavior) {
  const id = actorBehavior.id;

  if (!id) {
    throw new TypeError("actorBehavior must have a valid id property");
  }

  const actorHandler = new ActorHandler(this, actorBehavior);
  this.actorHandlers.set(id, actorHandler);
  return actorHandler;
};

SceneManager.prototype.getActorHandler = function (actorHandlerId) {
  return this.actorHandlers.get(actorHandlerId);
};

module.exports = SceneManager;
