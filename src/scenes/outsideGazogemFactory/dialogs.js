const { Dialog } = require("../../lib/dialog");

// TODO - move dialogs to particular quest?
function createDialogs(dialogHandler, knartaWorkerId) {
  const initialDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [["them", "Hey, buddy... forgetting something?"]],
  });

  const mainDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [
      ["me", "What?! Oh no... my Gazogem!"],
      ["them", "Ha! You really forgot it!"],
      [
        "them",
        "Amazing. You stormed the whole factory, flattened half my colleagues... and then left your Gazogem in the last room. Brilliant. Truly.",
      ],
      [
        "me",
        "Blast! I can't believe it... What am I supposed to do now? Without the Gazogem, I can't get back to my world!",
      ],
      ["me", "You know what? Now I will need to storm the whole factory again... Stupid me!"],
      [
        "them",
        "No! Please, don't! We've had enough of you already! Even the dogs stopped barking - they are just sitting weirdly, staring into space.\nHere, take this Gazogem... and please never come back!",
      ],
    ],
  });

  const finalDialog = new Dialog(dialogHandler, 0, knartaWorkerId, {
    dialogSequence: [
      ["me", "Uh... thanks. I guess."],
      ["them", "Please. Just get lost!"],
    ],
  });

  return { initialDialog, mainDialog, finalDialog };
}

module.exports = { createDialogs };
