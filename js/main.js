var canvas;
var engine;
var scene;
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;
var isBPressed = false;
var isRPressed = false;
var isLocked = false;
var score = 0;

document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
  canvas = document.getElementById("renderCanvas");
  engine = new BABYLON.Engine(canvas, true);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  scene = createScene();
  lockZePointer();
  var tank = scene.getMeshByName("heroTank");
  var toRender = function () {
    tank.move();
    tank.fireCannonBalls();
    tank.fireLaserBeams();
    var cannonBall = scene.getMeshByName("cannonball")
    var vaccine = scene.getMeshByName("vaccine");
    if (vaccine) {
      vaccine.move();
    }
    var goodOrb = scene.getMeshByName("goodOrb");
    if (goodOrb) {
      goodOrb.move();
    }
    var flyingSaucer = scene.getMeshByName("flyingSaucer");
    let numArray = [...Array(21).keys()];
    numArray.forEach((elem) => {
      var badBounderBox = scene.getMeshByName(`badBounder_${elem}`);
      var cloneBadOrb = scene.getMeshByName(`cloneBadOrbs_${elem}`);
      if (cloneBadOrb) {
        // rotate badOrbs
        cloneBadOrb.move();
        // detect cannonball strikes
        var collectedBadOrb = scene.getMeshByName(`cloneBadOrbs_${elem}`);
        if(cannonBall){
          if(cannonBall.intersectsMesh(badBounderBox, true)){
            badBounderBox.dispose();
            collectedBadOrb.dispose();
            score += 5;
            scene.scoreBox.updateScore();
          }
        }
      }

      // rotate goodOrbs
      var cloneGoodOrb = scene.getMeshByName(`cloneGoodOrbs_${elem}`);
      if (cloneGoodOrb) {
        cloneGoodOrb.move();
      }

      // end game if badOrb hits spaceShip
      if (badBounderBox) {
        if (tank.intersectsMesh(badBounderBox, true)) {
          var winningBadOrb = scene.getMeshByName(`cloneBadOrbs_${elem}`);
          winningBadOrb.flexWin();
          if (flyingSaucer) {
            flyingSaucer.gameLost();
            scene.scoreBox.deathByCorona();
            removeZePointer();
            setTimeout(function () {
              engine.stopRenderLoop();
            }, 2000);
          }
        }

      }

      // gain points if goodOrb hits spaceship
      var goodBounderBox = scene.getMeshByName(`goodBounder_${elem}`);
      var collectedGoodOrb = scene.getMeshByName(`cloneGoodOrbs_${elem}`);
      if (goodBounderBox) {
        if (tank.intersectsMesh(goodBounderBox, true)) {
          goodBounderBox.dispose();
          collectedGoodOrb.dispose();
          score += 1;
          scene.scoreBox.updateScore();
        }
      }
    });

    const winRangeZ = [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63];
    const winRangeX = [
      -344,
      -345,
      -346,
      -347,
      -348,
      -349,
      -350,
      -351,
      -352,
      -353,
      -354,
      -355,
      -356,
    ];
    function doArrayThang(array, position) {
      if (array.find((element) => element == position)) {
        return true;
      } else {
        return false;
      }
    }
    if (
      doArrayThang(winRangeZ, Math.round(tank.position.z)) &&
      doArrayThang(winRangeX, Math.round(tank.position.x))
    ) {
      scene.scoreBox.winBoxYeet();
      engine.stopRenderLoop();
    }

    scene.render();
  };
  engine.runRenderLoop(toRender);
}

var createScene = function () {
  var scene = new BABYLON.Scene(engine);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, physicsPlugin);
  var ground = CreateGround(scene);

  var freeCamera = createUniversalCamera(scene);
  var tank = createTank(scene);
  var followCamera = createFollowCamera(scene, tank);
  // scene.activeCamera = freeCamera;
  scene.activeCamera = followCamera;
  createSky(scene);
  createLights(scene);
  createScifiFloor(scene);
  createAtomOrb(scene);
  createFlyingSaucer(scene, tank);
  createBadOrb(scene);
  createGoodOrb(scene);
  createRingSystem(scene);
  createScoreUI(scene, tank);
  return scene;
};

// function createFakeBox(scene){
//   var fakeBox = BABYLON.MeshBuilder.CreateBox(
//     "fakeBox",
//     { height: 5, width: 5, depth: 5 },
//     scene
//   );
//   fakeBox.position = new BABYLON.Vector3(0, 6, -360)
//   fakeBox.checkCollisions = true;
//   fakeBox.name = "fakeFuckingBox"
//   // return myBox
// }

function createScoreUI(scene, tank) {
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "UI"
  );

  var rect1 = new BABYLON.GUI.Rectangle();
  rect1.width = "250px";
  rect1.height = "40px";
  rect1.cornerRadius = 20;
  rect1.color = "Orange";
  rect1.thickness = 4;
  rect1.background = "green";
  rect1.clipChildren = true;
  rect1.textHorizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(rect1);
  rect1.linkWithMesh(tank);

  var text = new BABYLON.GUI.TextBlock();
  scene.scoreBox = text;
  text.text = `Score: ${score}`;
  text.left = 0.1;
  text.textWrapping = true;
  text.fontSize = 28;
  text.fontWeight = "bold";
  rect1.addControl(text);
  text.updateScore = function () {
    text.text = `Score: ${score}`;
  };
  text.winBoxYeet = function () {
    if (score === 1) {
      text.text = `
        You Saved Civilization and collected ${score} Corona point. Now the thankless humans can continue polluting the planet and oppressing your Alien race. Rejoice!!
      `;
    } else {
      text.text = `
        You Saved Civilization and collected ${score} Corona points. Now the thankless humans can continue polluting the planet and oppressing your Alien race. Rejoice!!
      `;
    }
    rect1.width = "500px";
    rect1.height = "250px";
  };
  text.deathByCorona = function () {
    text.text = `
      The Corona Orb overlords destroyed your ship and took you down with it. Better luck next time!
    `;
    rect1.width = "600px";
    rect1.height = "250px";
    rect1.background = "red";
    text.color = "orange"
    text.font = 40;
    rect1.color = "white";
  };
}

function createSky(scene) {
  var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    "mettle/mettle",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode =
    BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;
}

function CreateGround(scene) {
  var ground = new BABYLON.Mesh.CreateGroundFromHeightMap(
    "ground",
    "images/final.png",
    800,
    800,
    100,
    0,
    10,
    scene,
    false,
    OnGroundCreated
  );
  function OnGroundCreated() {
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "images/grass.jpg",
      scene
    );
    scene.ground = ground;
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.HeightmapImpostor,
      { mass: 0 },
      scene
    );
    var stoneFloor = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 800, height: 400 },
      scene
    );
    stoneFloor.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    stoneFloor.position.y = 0.3;
    stoneFloor.position.z = -200;
    var stoneFloorMaterial = new BABYLON.StandardMaterial(
      "stoneFloorMaterial",
      scene
    );
    stoneFloorMaterial.diffuseTexture = new BABYLON.Texture(
      "images/hexagon-600-1200.png",
      scene
    );
    stoneFloor.material = stoneFloorMaterial;
    var stoneFloor = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 800, height: 400 },
      scene
    );
    stoneFloor.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    stoneFloor.position.y = 0.3;
    stoneFloor.position.z = 205;
    var stoneFloorMaterial = new BABYLON.StandardMaterial(
      "stoneFloorMaterial",
      scene
    );
    stoneFloorMaterial.diffuseTexture = new BABYLON.Texture(
      "images/ground-2.jpg",
      scene
    );
    stoneFloor.material = stoneFloorMaterial;
  }
  return ground;
}

function createLights(scene) {
  var light0 = new BABYLON.DirectionalLight(
    "dir0",
    new BABYLON.Vector3(-0.1, -1, 0),
    scene
  );
  light0.intensity = 0.0;
  light0.intensity = 0.3;
  var light1 = new BABYLON.DirectionalLight(
    "dir1",
    new BABYLON.Vector3(-1, -1, 0),
    scene
  );
  light1.intensity = 0.3;
  var light2 = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light2.intensity = 0.5;
}

function createFollowCamera(scene, target) {
  var camera = new BABYLON.FollowCamera(
    "tankFollowCamera",
    target.position,
    scene,
    target
  );
  camera.radius = 20; // how far from the object to follow
  camera.heightOffset = 4; // how high above object to place camera
  camera.rotationOffset = 180; //the viewing angle
  camera.cameraAcceleration = 0.5; // how fast to move
  camera.maxCameraSpeed = 50; //speed limit
  return camera;
}

function createUniversalCamera(scene) {
  var camera = new BABYLON.UniversalCamera(
    "UniversalCamera",
    new BABYLON.Vector3(
      -118.37268800277741,
      50.18638187910689,
      -57.51010707965682
    ),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  camera.checkCollisions = true;
  camera.keysUp.push("w".charCodeAt(0));
  camera.keysUp.push("W".charCodeAt(0));
  camera.keysDown.push("s".charCodeAt(0));
  camera.keysDown.push("S".charCodeAt(0));
  camera.keysRight.push("d".charCodeAt(0));
  camera.keysRight.push("D".charCodeAt(0));
  camera.keysLeft.push("a".charCodeAt(0));
  camera.keysLeft.push("A".charCodeAt(0));
  return camera;
}

function createAtomOrb(scene) {
  BABYLON.SceneLoader.ImportMesh(
    null,
    "./",
    "animated-atom.glb",
    scene,
    (meshes, particleSystems, skeletons, animationGroups) => {
      meshes[0].scaling = new BABYLON.Vector3(35, 35, 35);
      meshes[0].position = new BABYLON.Vector3(
        scene.finishFloor.position.x,
        40,
        57
      );
      meshes[0].name = "vaccine";
      animationGroups[0].start(true);
      var vaccine = meshes[0];
      vaccine.move = function () {
        vaccine.addRotation(0.05, -0.05, 0.05);
      };
    }
  );
}

function createScifiFloor(scene) {
  BABYLON.SceneLoader.ImportMesh(
    null,
    "./",
    "finish-floor.glb",
    scene,
    (meshes, particleSystems, skeletons) => {
      meshes[0].name = "finishFloor";
      meshes[0].scaling = new BABYLON.Vector3(10, 10, 10);
      meshes[0].position = new BABYLON.Vector3(-350, 0.1, 100);
      var finishFloor = meshes[0];
      scene.finishFloor = finishFloor;
    }
  );
}

function createFlyingSaucer(scene, tank) {
  BABYLON.SceneLoader.ImportMesh(
    null,
    "./",
    "flying-saucer.glb",
    scene,
    (meshes, particleSystems, skeletons, animationGroups) => {
      animationGroups[0].start(true);
      meshes[0].scaling = new BABYLON.Vector3(7, 7, 7);
      meshes[0].position = tank.position;
      meshes[0].name = "flyingSaucer";
      var flyingSaucer = meshes[0];

      flyingSaucer.gameLost = function () {
        flyingSaucer.dispose();
        tank.dispose();
      };
    }
  );
}

function createBadOrb(scene) {
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./",
    "coronaOrb.babylon",
    scene,
    onBadOrbImport
  );
  function onBadOrbImport(meshes, particleSystems, skeletons) {
    meshes[0].position = new BABYLON.Vector3(50, -10, 30);
    meshes[0].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
    var coronaOrbMaterial = new BABYLON.StandardMaterial(
      "badOrbMaterial",
      scene
    );
    coronaOrbMaterial.diffuseTexture = new BABYLON.Texture(
      "images/coronadiffuse.png",
      scene
    );
    meshes[0].material = coronaOrbMaterial;
    meshes[0].name = "badOrb";
    var badOrb = meshes[0];
    scene.badOrbs = [];
    scene.badOrbs[0] = badOrb;
    for (var q = 1; q <= 20; q++) {
      scene.badOrbs[q] = cloneBadOrb(badOrb, skeletons, q);
    }
  }
}

function cloneBadOrb(original, skeletons, id) {
  var myClone;
  var range = 750;
  var xrand = range / 2 - Math.random() * range;
  var zrand = range / 2 - Math.random() * range;
  var yrand = scene.ground.getHeightAtCoordinates(xrand, zrand);
  var rotChange = Math.random();
  myClone = original.clone("clone_" + id);
  myClone.name = "cloneBadOrbs_" + id;
  myClone.position = new BABYLON.Vector3(xrand, yrand + 5, zrand);
  var badBounder = BABYLON.MeshBuilder.CreateBox(
    "badBounder_" + id,
    { height: 5, width: 4, depth: 4 },
    scene
  );
  badBounder.position = myClone.position;

  badBounder.visibility = false;
  let counter = 0;
  myClone.move = function () {
    counter += 0.4;
    myClone.addRotation(0, -0.05 * rotChange, 0);

  };
  myClone.flexWin = function () {
    counter += 0.25;
    myClone.scaling = new BABYLON.Vector3(
      0.05 * Math.sin(counter / 2) + 0.3,
      0.05 * Math.sin(counter / 2) + 0.3,
      0.05 * Math.sin(counter / 2) + 0.3
    );
  };
}

function createGoodOrb(scene) {
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./",
    "goodOrbTho.glb",
    scene,
    onOrbImport
  );
  function onOrbImport(meshes, particleSystems, skeletons) {
    meshes[0].scaling = new BABYLON.Vector3(-0.035, 0.035, 0.035);
    meshes[0].position = new BABYLON.Vector3(-17, -10, 30);
    meshes[0].name = "goodOrb";
    var goodOrb = meshes[0];
    goodOrb.move = function () {
      goodOrb.addRotation(0, -0.05, 0);
    };
    scene.goodOrbs = [];
    scene.goodOrbs[0] = goodOrb;
    for (var q = 1; q <= 20; q++) {
      scene.goodOrbs[q] = cloneGoodOrb(goodOrb, skeletons, q);
    }
  }
}

function cloneGoodOrb(original, skeletons, id) {
  var myClone;
  var range = 750;
  var xrand = range / 2 - Math.random() * range;
  var zrand = range / 2 - Math.random() * range;
  var yrand = scene.ground.getHeightAtCoordinates(xrand, zrand);
  var rotChange = Math.random();
  myClone = original.clone("clone_" + id);
  myClone.name = "cloneGoodOrbs_" + id;
  myClone.position = new BABYLON.Vector3(xrand, yrand + 5, zrand);
  var goodBounder = BABYLON.MeshBuilder.CreateBox(
    "goodBounder_" + id,
    { height: 5, width: 4, depth: 4 },
    scene
  );
  goodBounder.position = myClone.position;
  goodBounder.visibility = false;
  myClone.move = function () {
    myClone.addRotation(0, -0.05 * rotChange, 0);
  };
}

function createRingSystem(scene) {
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./",
    "ringSystem.babylon",
    scene,
    function (meshes, particleSystems, skeletons) {
      // do something with th
      meshes[0].position = new BABYLON.Vector3(-10, 0.5, 30);
      meshes[0].scaling = new BABYLON.Vector3(35, 25, 17);
      meshes[0].rotation.y = 3.129;
      var ringMaterial = new BABYLON.StandardMaterial(
        "woodenRingMaterial",
        scene
      );
      ringMaterial.diffuseTexture = new BABYLON.Texture(
        "images/wood.jpg",
        scene
      );
      meshes[0].material = ringMaterial;
    }
  );

  var m = BABYLON.MeshBuilder.CreateBox(
    "ringbounder1",
    { height: 70, width: 25, depth: 285 },
    scene
  );
  m.position = new BABYLON.Vector3(20, 2, 157);
  m.checkCollisions = true;
  m.rotation.y = (1 * Math.PI) / 180;
  m.visibility = false;

  var n = BABYLON.MeshBuilder.CreateBox(
    "ringbounder2",
    { height: 70, width: 25, depth: 285 },
    scene
  );
  n.position = new BABYLON.Vector3(-42, 2, 157);
  n.checkCollisions = true;
  n.rotation.y = -((2 * Math.PI) / 180);
  n.visibility = false;
}

function createHeroDude(scene) {
  BABYLON.SceneLoader.ImportMesh(
    "him",
    "models/Dude/",
    "Dude.babylon",
    scene,
    onDudeImported
  );
}

function lockZePointer() {
  scene.onPointerDown = function () {
    if (event.pointerType === "mouse" && event.button === 2) {
      if (isLocked) {
        if (document.exitPointerLock) {
          document.exitPointerLock();
          isLocked = false;
        }
      }
    } else if (!isLocked) {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
        isLocked = true;
      }
    }
  };
}
function removeZePointer() {
  scene.onPointerDown = function () {
    document.exitPointerLock();
  };
}

function createTank() {
  var tank = new BABYLON.MeshBuilder.CreateBox(
    "heroTank",
    { height: 1, depth: 6, width: 6 },
    scene
  );
  var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
  tankMaterial.diffuseColor = new BABYLON.Color3.Red();
  tankMaterial.emissiveColor = new BABYLON.Color3.Blue();
  tank.material = tankMaterial;
  tank.position.y += 2;
  tank.position.z += -370;
  tank.speed = 2.0;
  tank.frontVector = new BABYLON.Vector3(0, 0, 1);
  tank.canFireCannonBalls = true;
  tank.canFireLaser = true;
  tank.visibility = false;
  // tank.isPickable = false;
  tank.move = function () {
    if (isWPressed) {
      if (tank.position.y > 2) {
        tank.moveWithCollisions(new BABYLON.Vector3(0, -1, 0));
      } else {
        tank.moveWithCollisions(
          tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed)
        );
      }
    }
    if (isSPressed) {
      if (tank.position.y > 2) {
        tank.moveWithCollisions(new BABYLON.Vector3(0, -1, 0));
      } else {
        tank.moveWithCollisions(
          tank.frontVector.multiplyByFloats(
            -1 * tank.speed,
            -1 * tank.speed,
            -1 * tank.speed
          )
        );
      }
    }
    if (isAPressed) {
      tank.rotation.y -= 0.06;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
    if (isDPressed) {
      tank.rotation.y += 0.06;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
  };

  tank.fireCannonBalls = function () {
    var tank = this;
    if (!isBPressed) return;
    if (!tank.canFireCannonBalls) return;
    tank.canFireCannonBalls = false;

    setTimeout(function () {
      tank.canFireCannonBalls = true;
    }, 500);

    var cannonBall = new BABYLON.Mesh.CreateSphere("cannonball", 32, 2, scene);
    cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
    cannonBall.material.diffuseTexture = new BABYLON.Texture(
      "images/Fire.jpg",
      scene
    );
    var pos = tank.position;

    cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z);
    cannonBall.position.addInPlace(tank.frontVector.multiplyByFloats(5, 5, 5));

    cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(
      cannonBall,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene
    );
    var fVector = tank.frontVector;
    var force = new BABYLON.Vector3(
      fVector.x * 100,
      (fVector.y + 1) * 10,
      fVector.z * 100
    );
    cannonBall.physicsImpostor.applyImpulse(
      force,
      cannonBall.getAbsolutePosition()
    );

    setTimeout(function () {
      cannonBall.dispose();
    }, 3000);
  };

  //#region
  tank.fireLaserBeams = function () {
    var tank = this;
    if (!isRPressed) return;
    if (!tank.canFireLaser) return;
    tank.canFireLaser = false;

    setTimeout(function () {
      tank.canFireLaser = true;
    }, 500);

    var origin = tank.position;
    var direction = new BABYLON.Vector3(
      tank.frontVector.x,
      tank.frontVector.y + 0.1,
      tank.frontVector.z
    );

    var ray = new BABYLON.Ray(origin, direction, 1000);
    var rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.show(scene, new BABYLON.Color3.Red());

    setTimeout(function () {
      rayHelper.hide(ray);
    }, 200);

    var pickInfos = scene.multiPickWithRay(ray, (mesh) => {
      //use multiPick instead of pickWithRay to pick everything it hits instead of closest
      // this requires you to loop through everything it hits
      if (mesh.name == "heroTank") {
        return false;
      } else {
        return true;
      }
    });
    for (let i = 0; i < pickInfos.length; i++) {
      var pickInfo = pickInfos[i];
      if (pickInfo.pickedMesh) {
        if (pickInfo.pickedMesh.name.startsWith("bounder")) {
          var bounder = pickInfo.pickedMesh;
          bounder.dudeMesh.dispose();
          bounder.dispose();
        } else if (pickInfo.pickedMesh.name.startsWith("clone")) {
          var child = pickInfo.pickedMesh;
          child.parent.dispose();
        }
      }
    }
    // console.log(pickInfo.pickedMesh.name) sometimes the bounder sometimes the mesh
  };
  //#endregion
  return tank;
}
document.addEventListener("keydown", function () {
  if (event.key == "w" || event.key == "W") {
    isWPressed = true;
  }
  if (event.key == "s" || event.key == "S") {
    isSPressed = true;
  }
  if (event.key == "a" || event.key == "A") {
    isAPressed = true;
  }
  if (event.key == "d" || event.key == "D") {
    isDPressed = true;
  }
  if (event.key == "b" || event.key == "B") {
    isBPressed = true;
  }
  if (event.key == "r" || event.key == "R") {
    isRPressed = true;
  }
});

document.addEventListener("keyup", function () {
  if (event.key == "w" || event.key == "W") {
    isWPressed = false;
  }
  if (event.key == "s" || event.key == "S") {
    isSPressed = false;
  }
  if (event.key == "a" || event.key == "A") {
    isAPressed = false;
  }
  if (event.key == "d" || event.key == "D") {
    isDPressed = false;
  }
  if (event.key == "b" || event.key == "B") {
    isBPressed = false;
  }
  if (event.key == "r" || event.key == "R") {
    isRPressed = false;
  }
});

// Resize
window.addEventListener("resize", function (camera) {
  engine.resize();
});
