const StateManager = require("./stateManager");

/** @typedef {import("@idajs/types").GameObject} GameObject */

function ActorHandler(actorManager, actorBehavior) {
  if (!actorManager || typeof actorManager !== "object") {
    throw new TypeError("actorManager object must be provided");
  }

  if (!actorBehavior || typeof actorBehavior !== "object") {
    throw new TypeError("actorBehavior object must be provided");
  }

  if (!actorBehavior.id) {
    throw new TypeError("actorBehavior must have a valid id property");
  }

  this.actorManager = actorManager;
  this.actorBehavior = actorBehavior;
  this.id = actorBehavior.id;
  this.behaviors = actorBehavior.behaviors;
  this.defaultBehavior = actorBehavior.behaviors.default;
  this.selectBehavior = actorBehavior.selectBehavior;
  this.coroutines = actorBehavior.coroutines;
  this.stateManager = new StateManager(this.id, this.selectBehavior?.bind(this));
}

ActorHandler.prototype.init = function (/** @type {GameObject} */ actor, ...args) {
  if (!actor || typeof actor !== "object") {
    throw new TypeError("actor object must be provided");
  }

  this.actorBehavior.init?.call(this, ...args);

  // Life script registration
  if (this.actorBehavior.behaviors && Object.keys(this.actorBehavior.behaviors).length) {
    actor.handleLifeScript(this.handleLife.bind(this));
  }

  // Move script registration
  if (this.actorBehavior.coroutines && Object.keys(this.actorBehavior.coroutines).length) {
    registerCoroutines(this.id, this.actorBehavior.coroutines);
    actor.handleMoveScript();
  }

  this.objectId = actor.getId();

  return this.objectId;
};

ActorHandler.prototype.handleLife = function (objectId) {
  const behaviorKey = this.stateManager.getCurrentBehavior();
  const behavior = behaviorKey && this.behaviors[behaviorKey];
  if (behavior) {
    return behavior?.call(this, objectId);
  } else if (this.defaultBehavior) {
    return this.defaultBehavior.call(this, objectId);
  } else {
    return false;
  }
};

ActorHandler.prototype.getCoroutineName = function (name) {
  return getCoroutineName(this.id, name);
};

ActorHandler.prototype.startCoroutine = function (name, ...args) {
  const coroutineName = this.getCoroutineName(name);
  startCoroutine(this.objectId, coroutineName, ...args);
};

ActorHandler.prototype.getActor = function (actorBehaviorId) {
  return this.actorManager.getActorHandler(actorBehaviorId);
};

// TODO - add other coroutine methods as needed

function getCoroutineName(id, originalName) {
  return `${id}_${originalName}`;
}

function registerCoroutines(id, coroutines) {
  for (const [name, coroutine] of Object.entries(coroutines)) {
    registerCoroutine(getCoroutineName(id, name), coroutine);
  }
}

module.exports = ActorHandler;
