const { States } = require("./props");

module.exports = {
  dialogIsStarting: function* () {
    // TODO - support life scripts from coroutine
    // yield doLife(() => {});

    yield doMove(ida.Move.TM_WAIT_NB_SECOND, 2);
    yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
    yield doSceneStore((sceneStore) => {
      sceneStore.state = States.DialogStarted;
    });
  },
};

function* dialogIsStarting() {}

function* twinsenIsTurning(angle) {
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doMove(ida.Move.TM_ANGLE, angle);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.DialogContinues;
  });
}

function* workerIsGivingGazogem() {
  yield doMove(ida.Move.TM_ANGLE, 3072);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.WorkerGaveGazogem;
  });
  yield doMove(ida.Move.TM_SAMPLE, 153);
  yield doMove(ida.Move.TM_ANIM, 0);
  yield doMove(ida.Move.TM_FACE_TWINSEN, -1);
  yield doSceneStore((sceneStore) => {
    sceneStore.state = States.TwinsenThanks;
  });
}

function* workerIsLeaving() {
  yield doMove(ida.Move.TM_ANGLE, 2048);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 5);
  yield doMove(ida.Move.TM_ANIM, 1);
  yield doMove(ida.Move.TM_WAIT_NB_DIZIEME, 6);
  yield doSceneStore((sceneStore) => (sceneStore.workerDisappears = true));
}
