const ActorHandler = require("./actorHandler");
const { DialogHandler } = require("./dialog");

function ActorManager(quests) {
  this.actorHandlers = new Map();
  this.quests = quests || [];
  this.dialogHandler = new DialogHandler();
}

ActorManager.prototype.initQuests = function () {
  this.quests.forEach((quest) => quest.init?.(this));
};

ActorManager.prototype.initQuestStates = function () {
  this.quests.forEach((quest) => quest.initState?.());
};

ActorManager.prototype.createActorHandler = function (actorBehavior) {
  const id = actorBehavior.id;

  if (!id) {
    throw new TypeError("actorBehavior must have a valid id property");
  }

  const actorHandler = new ActorHandler(this, actorBehavior);
  this.actorHandlers.set(id, actorHandler);
  return actorHandler;
};

ActorManager.prototype.getActorHandler = function (actorHandlerId) {
  return this.actorHandlers.get(actorHandlerId);
};

module.exports = ActorManager;
