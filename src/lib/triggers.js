const isActorInZone = (actorId, zoneValue, triggerName = undefined) => {
  const sceneStore = useSceneStore();
  triggerName ??= `actorInZone_${actorId}_${zoneValue}`;

  return isTriggeredTrue(
    sceneStore,
    triggerName,
    ida.lifef(actorId, ida.Life.LF_ZONE) === zoneValue
  );
};

function IsActorInZoneTrigger(actorId, zoneValue) {
  this.actorId = actorId;
  this.zoneValue = zoneValue;
  this.triggerName = `actorInZone_${actorId}_${zoneValue}`;
}

IsActorInZoneTrigger.prototype.isTrue = function () {
  return isActorInZone(this.actorId, this.zoneValue, this.triggerName);
};

// TODO
/*
const isActionButtonPressed = (actorId, triggerName = undefined) => {
  const tempStore = useTempStore();
};
*/

module.exports = { IsActorInZoneTrigger, isActorInZone };
