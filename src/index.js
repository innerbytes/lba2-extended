const { SceneRouter } = require("./lib/router");
const TwinsenHouse = require("./scenes/twinsenHouse/scene");
const OutsideGazogemFactory = require("./scenes/outsideGazogemFactory/scene");

console.log("Welcome to the LBA2 Extended edition!\n");

const router = new SceneRouter([TwinsenHouse, OutsideGazogemFactory]);
router.init();
