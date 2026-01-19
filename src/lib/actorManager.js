const ActorHandler = require("./actorHandler");

function ActorManager() {
  this.actorHandlers = new Map();
}

ActorManager.prototype.createHandler = function (actorBehavior) {
  const id = actorBehavior.id;

  if (!id) {
    throw new TypeError("actorBehavior must have a valid id property");
  }

  const actorHandler = new ActorHandler(this, actorBehavior);
  this.actorHandlers.set(id, actorHandler);
  return actorHandler;
};

ActorManager.prototype.getHandler = function (actorHandlerId) {
  return this.actorHandlers.get(actorHandlerId);
};

module.exports = ActorManager;
