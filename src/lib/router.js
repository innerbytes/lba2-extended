function SceneRouter(scenes) {
  this.scenes = new Map();

  for (const sceneModule of scenes) {
    if (typeof sceneModule.id !== "number") {
      console.warn("Scene module is missing id property, skipping:", sceneModule);
      continue;
    }
    this.scenes.set(sceneModule.id, sceneModule);
  }
}

function afterLoadScene(router, sceneId, sceneLoadMode) {
  const sceneModule = router.scenes.get(sceneId);
  if (!sceneModule) {
    return;
  }

  if (typeof sceneModule.afterLoad === "function") {
    sceneModule.afterLoad(sceneLoadMode);
  }
}

SceneRouter.prototype.init = function () {
  scene.addEventListener(scene.Events.afterLoadScene, (sceneId, sceneLoadMode) => {
    afterLoadScene(this, sceneId, sceneLoadMode);
  });
};

module.exports = { SceneRouter };
