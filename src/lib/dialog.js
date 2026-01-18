function DialogHandler() {
  this.textId = text.create();
  this.choices = text.createChoices();
}

const TextObjectKeys = ["color", "color256End", "color256Start", "flags", "sprite", "x", "y"];

function createMessage(message, options) {
  // If user passes message in IdaJS format
  if (Array.isArray(message) || typeof message === "function" || typeof message === "object") {
    return message;
  }

  // Message must be a string now
  if (typeof message !== "string") {
    throw new TypeError(
      `Expected message to be a string, array, function, or object, but got ${typeof message}`
    );
  }

  // Check if options has any TextObject properties
  if (options) {
    const hasTextObjectProps = TextObjectKeys.some((key) => key in options);
    if (hasTextObjectProps) {
      return { text: message, ...options };
    }
  }

  // Otherwise return plain message
  return message;
}

DialogHandler.prototype.message = function (actorId, message, options = {}) {
  const speakerId = options?.speakerId ?? actorId;

  if (actorId === speakerId) {
    ida.life(
      actorId,
      ida.Life.LM_MESSAGE,
      text.update(this.textId, createMessage(message, options))
    );
  } else {
    ida.life(
      actorId,
      ida.Life.LM_MESSAGE_OBJ,
      speakerId,
      text.update(this.textId, createMessage(message, options))
    );
  }
};

function Dialog(dialogHandler, myActorId, theirActorId, myOptions, theirOptions) {
  if (!dialogHandler || !(dialogHandler instanceof DialogHandler)) {
    throw new TypeError("an instance of DialogHandler must be provided as first argument");
  }

  if (typeof myActorId !== "number" || myActorId < 0) {
    throw new TypeError("myActorId must be a valid actor id number");
  }

  if (typeof theirActorId !== "number" || theirActorId < 0) {
    throw new TypeError("theirActorId must be a valid actor id number");
  }

  this.dialogHandler = dialogHandler;
  this.myActorId = myActorId;
  this.theirActorId = theirActorId;
  this.myOptions = myOptions;
  this.theirOptions = theirOptions;
}

Dialog.prototype.me = function (message) {
  this.dialogHandler.message(this.myActorId, message, this.myOptions);
};

Dialog.prototype.them = function (message) {
  this.dialogHandler.message(this.myActorId, message, {
    speakerId: this.theirActorId,
    ...this.theirOptions,
  });
};

module.exports = { DialogHandler, Dialog };
