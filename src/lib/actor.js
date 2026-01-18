const createActor = (entityId, options = undefined) => {
  const actorId = scene.addObjects();
  const actor = scene.getObject(actorId);
  actor.setEntity(entityId);
  actor.setControlMode(object.ControlModes.NoMovement);
  actor.setStaticFlags(
    object.Flags.CanFall |
      object.Flags.CheckCollisionsWithActors |
      object.Flags.CheckCollisionsWithScene
  );

  if (options?.position) {
    actor.setPos(options.position);
  }

  if (options?.angle) {
    actor.setAngle(options.angle);
  }

  if (options?.body) {
    actor.setBody(options.body);
  }

  if (options?.animation) {
    actor.setAnimation(options.animation);
  }

  if (options?.armor) {
    actor.setArmor(options.armor);
  } else {
    actor.setArmor(255);
  }

  if (options?.hitPower) {
    actor.setHitPower(options.hitPower);
  }

  if (options?.talkColor) {
    actor.setTalkColor(options.talkColor);
  }

  if (options?.handleMove) {
    actor.handleMoveScript();
  }

  if (options?.isDisabled) {
    actor.disable();
  } else if (options?.hp) {
    actor.setLifePoints(options.hp);
  } else {
    actor.setLifePoints(255);
  }

  return actor;
};

module.exports = { createActor };
