const { actors } = require("../props");

const L = ida.Life;
const M = ida.Move;

const actor = {
  id: actors.zoe,
  init: function (loadMode) {
    // Giving Twinsen some more weapons to try :)
    if (loadMode === scene.LoadModes.NewGameStarted) {
      scene.setGameVariable(scene.GameVariables.INV_MECA_PENGUIN, 10);
    }
  },
  behaviors: {
    default: function (objectId) {
      const lastHitBy = ida.lifef(objectId, ida.Life.LF_HIT_BY);

      if (lastHitBy === 0) {
        ida.life(objectId, ida.Life.LM_GAME_OVER);
        return false;
      }

      return true;
    },
  },
};

module.exports = actor;
