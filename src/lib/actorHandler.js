/** @typedef {import("@idajs/types").GameObject} GameObject */

function ActorHandler(actorBehavior) {
  if (!actorBehavior || typeof actorBehavior !== "object") {
    throw new TypeError("actorBehavior object must be provided");
  }
  this.actorBehavior = actorBehavior;

  // TODO - set prototype of the actorBehavior to enrich it with helper methods
}

ActorHandler.prototype.init = function (/** @type {GameObject} */ actor) {
  if (!actor || typeof actor !== "object") {
    throw new TypeError("actor object must be provided");
  }

  const id = actor.getId();
  actor.handleLifeScript(this.handleLife);

  // Register coroutines
  if (this.actorBehavior.coroutines && Object.keys(this.actorBehavior.coroutines).length) {
    actor.handleMoveScript();
  }
};

ActorHandler.prototype.handleLife = function (objectId) {
  // TODO
};
