const { SceneRouter } = require("./lib/router");
const OutsideGazogemFactory = require("./scenes/outsideGazogemFactory/scene");

console.log("Welcome to the LBA2 Extended edition!\n");

const router = new SceneRouter([OutsideGazogemFactory]);
router.init();
