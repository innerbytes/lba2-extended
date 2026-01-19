/** @typedef {import("@idajs/types").GameObject} GameObject */

function ActorHandler(actorBehavior, stateManager) {
  if (!actorBehavior || typeof actorBehavior !== "object") {
    throw new TypeError("actorBehavior object must be provided");
  }

  if (!actorBehavior.id) {
    throw new TypeError("actorBehavior must have a valid id property");
  }

  this.actorBehavior = actorBehavior;
  this.id = actorBehavior.id;
  this.behaviors = actorBehavior.behaviors;
  this.defaultBehavior = actorBehavior.behaviors.default;
  this.coroutines = actorBehavior.coroutines;
  this.stateManager = stateManager ?? new SceneManager(id); // TODO - implement
}

ActorHandler.prototype.init = function (/** @type {GameObject} */ actor, ...args) {
  if (!actor || typeof actor !== "object") {
    throw new TypeError("actor object must be provided");
  }

  this.actorBehavior.init?.call(this, ...args);

  // Life script registration
  if (this.actorBehavior.behaviors && Object.keys(this.actorBehavior.behaviors).length) {
    actor.handleLifeScript(this.handleLife);
  }

  // Move script registration
  if (this.actorBehavior.coroutines && Object.keys(this.actorBehavior.coroutines).length) {
    registerCoroutines(this.actorBehavior.coroutines);
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
  // TODO - implement, need to route through scene actor behaviors
  return {};
};

// TODO - add other coroutine methods as needed

function getCoroutineName(id, originalName) {
  return `${id}_${originalName}`;
}

function registerCoroutines(coroutines) {
  for (const [name, coroutine] of Object.entries(coroutines)) {
    registerCoroutine(getCoroutineName(name), coroutine);
  }
}
