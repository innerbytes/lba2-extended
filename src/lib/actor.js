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

// TODO - support more items, now only assumes itemId is a legacy game variable
const createPickableItem = (entityId, itemId, options = {}) => {
  options = { displayFoundObject: true, ...options };

  const item = createActor(entityId, { armor: 255, ...options });
  item.handleLifeScript((objectId) => {
    // If the item is created enabled by default, user might pass the condition life script, where it should not exist on the scene anymore
    if (options?.suicideCondition?.(objectId)) {
      ida.life(objectId, ida.Life.LM_SUICIDE);
      return;
    }

    if (scene.getGameVariable(itemId) > 0 && !options?.canHaveMultiple) {
      ida.life(objectId, ida.Life.LM_SUICIDE);
      return;
    }

    // If collided with Hero
    if (ida.lifef(objectId, ida.Life.LF_COL_OBJ, 0) === objectId) {
      ida.life(objectId, ida.Life.LM_INVISIBLE, 1);

      if (options?.displayFoundObject) {
        ida.life(objectId, ida.Life.LM_FOUND_OBJECT, itemId);
      }
      scene.setGameVariable(itemId, scene.getGameVariable(itemId) + 1);

      if (options?.resetHeroStance) {
        ida.life(objectId, ida.Life.LM_COMPORTEMENT_HERO, object.TwinsenStances.Normal);
      }

      if (options?.recenterCamera) {
        ida.life(objectId, ida.Life.LM_CAMERA_CENTER, 0);
      }

      if (options?.clearHoloPos) {
        ida.life(objectId, ida.Life.LM_CLR_HOLO_POS, options.clearHoloPos);
      }

      options?.onPickedUpScript?.(objectId);

      ida.life(objectId, ida.Life.LM_SUICIDE);
    }
  });

  return item;
};

module.exports = { createActor, createPickableItem };
