const questProto = {
  useSceneStore: function () {
    return useSceneStore(this.id);
  },
  doSceneStore: function (callback) {
    return doSceneStore((sceneStore) => callback(sceneStore[this.id]));
  },
  useGameStore: function () {
    return useGameStore(this.id);
  },
  doGameStore: function (callback) {
    return doGameStore((gameStore) => callback(gameStore[this.id]));
  },
};

function createQuest(options) {
  if (!options || !options.id) {
    throw new TypeError("Quest options must include an id");
  }

  return Object.setPrototypeOf(options, questProto);
}

module.exports = createQuest;
