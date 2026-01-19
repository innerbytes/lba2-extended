function StateManager(actorHandlerId, calculateBehavior) {
  if (!actorHandlerId) {
    throw new TypeError("actorHandlerId must be provided");
  }

  if (calculateBehavior && typeof calculateBehavior !== "function") {
    throw new TypeError("calculateBehavior must be a function");
  }

  this.actorHandlerId = actorHandlerId;
  this.calculateBehavior = calculateBehavior;
}

StateManager.prototype.getCurrentBehavior = function () {
  // If ordered behavior
  const sceneStore = useSceneStore();
  if (sceneStore[this.actorHandlerId]?.behavior) {
    return sceneStore.behavior;
  }

  // If calculated behavior
  if (this.calculateBehavior) {
    return this.calculateBehavior(sceneStore);
  }

  return "";
};

module.exports = StateManager;
