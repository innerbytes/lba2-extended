const { SceneRouter } = require("./lib/router");
const OutsideGazogemFactory = require("./outsideGazogemFactory");

console.log("Welcome to the LBA2 Extended edition!\n");

const router = new SceneRouter([OutsideGazogemFactory]);
router.init();
