import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import gsap from "gsap";
import CANNON from "cannon";

// in case of shadows, don't forget to activate shadowMap on renderer,
// I think it will not work without it
// you can also se shdow map type (picking shadow algorythm)

// also, sphere will cast shadow, and floor will receive it (you also need to set this)
// directional light needs to cast shadow also

/**
 * @description Debug UI - lil-ui
 */
const gui = new GUI({
  width: 340,
  title: "Tweak it",
  closeFolders: false,
});

gui.hide();
// gui parameters
const parameters = {
  materialColor: "#e481a4",
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
  directionalLight.position.set(2, 2, -1);
  scene.add(directionalLight);

  // ---------------------------------------------------------------
  // ------ MESHES ------
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------

  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    // works only with light
    new THREE.MeshStandardMaterial({
      color: "#777777",
      metalness: 0.3,
      roughness: 0.4,
    })
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
  directionalLight.shadow.camera.far = 6;

  directionalLight.shadow.camera.top = 2;
  directionalLight.shadow.camera.bottom = -2;
  directionalLight.shadow.camera.right = 2;
  directionalLight.shadow.camera.left = -2;

  directionalLight.shadow.radius = 10;

  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------

  //  GUI

  gui.addColor(parameters, "materialColor").onChange(() => {
    // material.color.set(parameters.materialColor);
    // particlesMaterial.color.set(parameters.materialColor);
  });

  /**
   * just to show that we can tweak normal html with lil gui
   */
  const o = { showBorders: false };
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
  });

  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------

  // we don't need this, it is from previous example to show how we can move group
  // instead of camera
  // we can keep this
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);

  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,

    0.1,
    100
  );

  camera.position.z = 6;
  camera.position.x = 3;
  camera.position.y = 3;

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
  // let previousTime = 0;

  const tick = () => {
    //
    // const elapsedTime = clock.getElapsedTime();
    // const deltaTime = elapsedTime - previousTime;
    //
    // previousTime = elapsedTime;

    // camera.position.y = (-scrollY / sizes.height) * objectDistance;

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
