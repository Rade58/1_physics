import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import gsap from "gsap";
import CANNON from "cannon";

// we will create threejs world
// and a physics world

/**
 * @description Debug UI - lil-ui
 */
const gui = new GUI({
  width: 340,
  title: "Tweak it",
  closeFolders: false,
});

// gui.hide();
// gui parameters
const parameters = {
  floorMaterialColor: "#89898b",
};

const sizes = {
  // width: 800,
  width: window.innerWidth,
  // height: 600,
  height: window.innerHeight,
};

const canvas: HTMLCanvasElement | null = document.querySelector("canvas.webgl");

if (canvas) {
  const scene = new THREE.Scene();

  // TEXTURES
  const textureLoader = new THREE.TextureLoader();
  // const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
  // gradientTexture.magFilter = THREE.NearestFilter;

  const sphereMatcap = textureLoader.load("/textures/matcaps/3.png");

  // ------ PHYSICS --------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  /**
   * Physics
   */

  const world = new CANNON.World();

  world.gravity.set(0, -9.82, 0); // gravity is Vec3, not THREE.Vector3, it is CANNON.Vec3 instance (works almost the same)
  //  and as you know 9.81 is gravity acceleration (9.81 m/s^2)
  // we set acceleration on y axis (no need to explain this, it's clear as day)

  // in threejs we create meshes, aand in cannon we create bodies
  // https://schteppe.github.io/cannon.js/docs/classes/Body.html

  // Sphere
  const sphereShape = new CANNON.Sphere(0.5); // same radius as SphereGeometry
  const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 4, 0), // y is set to 4 because we want to release physical body from this position
    shape: sphereShape,
  });

  world.addBody(sphereBody);

  // floor is static, and without mass, since it symbolize the ground where objects are falling

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body();
  floorBody.mass = 0;
  floorBody.addShape(floorShape);
  world.addBody(floorBody);

  // but since we need to rotate mesh plane in order it to be positioned
  // horyzontaly we need this to do with body also
  // but this is complicated
  floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
  ); // this will rotate the body by minus 90deg

  //
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------

  // ------ LIGHTS ---------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------

  /**
   * Lights
   */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(7, 9, -7);
  scene.add(directionalLight);

  // ---------------------------------------------------------------
  // ------ MESHES ------
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------

  const floorMaterial = new THREE.MeshStandardMaterial({
    // color: "#777777",
    color: parameters.floorMaterialColor,
    metalness: 0.3,
    roughness: 0.4,
  });

  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    // works only with light
    floorMaterial
  );

  // rotate it by -90deg
  floorMesh.rotation.x = -Math.PI * 0.5;

  scene.add(floorMesh);

  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshMatcapMaterial({
      matcap: sphereMatcap,
    })
  );

  sphereMesh.position.y = 0.5;

  scene.add(sphereMesh);

  // -----------------------------------------------------------------------
  // ---------- PARTICLES --------------------------------------------------
  // -----------------------------------------------------------------------
  /**
   * Particles
   */

  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------

  //  ---------------------- SHADOWS RELATED ----------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  directionalLight.castShadow = true;
  sphereMesh.castShadow = true;
  floorMesh.receiveShadow = true;

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;

  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 24;

  directionalLight.shadow.camera.top = 8;
  directionalLight.shadow.camera.bottom = -8;
  directionalLight.shadow.camera.right = 8;
  directionalLight.shadow.camera.left = -8;

  directionalLight.shadow.radius = 10;

  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------

  //  GUI

  gui.addColor(parameters, "floorMaterialColor").onChange(() => {
    floorMaterial.color.set(parameters.floorMaterialColor);
    // particlesMaterial.color.set(parameters.materialColor);
  });

  /**
   * just to show that we can tweak normal html with lil gui
   */
  /* const o = { showBorders: false };
  gui.add(o, "showBorders").onChange(() => {
    const els = document.querySelectorAll(".content div");
    if (o.showBorders === false) {
      if (els) {
        els.forEach((el) => {
          el.classList.remove("show_border");
        });
      }
    } else {
      if (els) {
        els.forEach((el) => {
          el.classList.add("show_border");
        });
      }
    }
  }); */

  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------

  // we don't need this, it is from previous group of lessons to show how we can move group
  // instead of camera
  // so I kept this
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);

  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,

    0.1,
    100
  );

  camera.position.z = 8;
  camera.position.x = 4;
  camera.position.y = 4;

  cameraGroup.add(camera);
  // scene.add(camera);

  // ------ HELPERS ----------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------

  const axHelp = new THREE.AxesHelper(4);
  axHelp.setColors("red", "green", "blue");
  scene.add(axHelp);

  const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
  );
  scene.add(directionalLightCameraHelper);

  axHelp.visible = false;
  directionalLightCameraHelper.visible = false;

  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------

  // orbit controls
  const orbit_controls = new OrbitControls(camera, canvas);
  // orbit_controls.enabled = false
  orbit_controls.enableDamping = true;
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });

  // for shadows to work
  // ------ ACTIVATE SHADOW MAP ------
  //--------------------------------------------------
  renderer.shadowMap.enabled = true;
  // shadow algos
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //--------------------------------------------------
  //--------------------------------------------------

  // handle pixel ratio
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // -------------------------------------------------
  // toggle debug ui on key `h`
  window.addEventListener("keydown", (e) => {
    if (e.key === "h") {
      gui.show(gui._hidden);
    }
  });

  // ------ ANIMATING ON SCROLL ------
  // we don't need this
  // ---------------------------------
  // ---------------------------------
  // ---------------------------------
  // ---------------------------------
  // ---------------------------------
  // ---------------------------------
  // ---------------------------------
  // we will use this value to update camera in tick function
  /**
   * Scroll
   */
  // let scrollY = window.screenY;

  // let currentSection = 0; //

  // console.log({ scrollY });

  /*  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;

    // console.log({ scrollY });
    // we will add this
    // to calculate what is our current section
    const newSection = Math.round(scrollY / sizes.height);

    // changing sections
    if (newSection !== currentSection) {
      currentSection = newSection;
      // console.log("changed", currentSection);

      gsap.to(sectionMeshes[currentSection].rotation, {
        duration: 1.5,
        ease: "power2.inOut",
        x: "+=6",
        y: "+=3",
        z: "+=1.5",
      });
    }

    // console.log(newSection);
  }); */

  // --------------------------------------------------
  // ---------- FOR PARALLAX --------------------------
  /**
   * Cursor
   */
  /* const cursor = { x: 0, y: 0 };
  cursor.x = 0;
  cursor.y = 0;

  window.addEventListener("mousemove", (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = e.clientY / sizes.height - 0.5;
  }); */

  // --------------------------------------------------
  // --------------------------------------------------
  // --------------------------------------------------

  // ------------- Animation loop ------------------
  const clock = new THREE.Clock();

  //
  let oldElapsedTime = 0;

  const tick = () => {
    //
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    //
    oldElapsedTime = elapsedTime;
    //

    // to understand what are we doing
    // read this:   https://gafferongames.com/post/fix_your_timestep/

    // ------ UPDATE PHYSICS WORLD ------
    // ---------------------------------------------------
    // ---------------------------------------------------
    // fixed time step for 60fps
    world.step(1 / 60, deltaTime, 3); // max sub steps is 3 (read the article to understand this)

    // console.log(sphereBody.position); CANNON.Vec3
    // console.log(sphereBody.position.y); // you will see this value change (makes sense) (value will decrease)

    // ---------------------------------------------------
    // ----- UPDATE THREEJS WORLD, BY TAKING COORDINATES FROM PHYSICAL WORLD
    // but instead of this
    // sphereMesh.position.x = sphereBody.position.x;
    // sphereMesh.position.y = sphereBody.position.y;
    // sphereMesh.position.z = sphereBody.position.z;
    // it's easier like this
    // this will work despite we aare deling with THREE.Vector3 and CANNON.Vec3
    sphereMesh.position.copy(sphereBody.position);

    // same for floor even floor is static
    floorMesh.position.copy(floorBody.position);

    // for dumping to work
    orbit_controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
  };

  tick();

  // ------------------------------------------------------
  // --------------- handle resize ------------------------
  window.addEventListener("resize", (e) => {
    console.log("resizing");
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // ------------------------------------------------------
  // ----------------- enter fulll screen with double click

  window.addEventListener("dblclick", () => {
    console.log("double click");

    // handling safari
    const fullscreenElement =
      // @ts-ignore webkit
      document.fullscreenElement || document.webkitFullScreenElement;
    //

    // if (!document.fullscreenElement) {
    if (!fullscreenElement) {
      if (canvas.requestFullscreen) {
        // go fullscreen
        canvas.requestFullscreen();

        // @ts-ignore webkit
      } else if (canvas.webkitRequestFullScreen) {
        // @ts-ignore webkit
        canvas.webkitRequestFullScreen();
      }
    } else {
      // @ts-ignore
      if (document.exitFullscreen) {
        document.exitFullscreen();

        // @ts-ignore webkit
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore webkit
        document.webkitExitFullscreen();
      }
    }
  });
}
