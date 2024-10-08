import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import gsap from "gsap";
import CANNON from "cannon";

// manging few objects is easy, but manging multiple objects (I gues multiple bodies, cannon materials can be messy)

// (in this case we are considering as "objects", or calling them "objects": a body and mesh that are related oto eachother)

// --------------------------------------------------------------------------------------------------
// in order our body to stop eventually after force application, we need to define linerDumping and angularDumping on the body

// we will first remove sphere mesh, related body, shape (we used sphere in previous example)

// and we will create function (createObject) to automate creation of the sphere, and we can use this function
// multiple times
// we will define it (right before animate part (before tick function definition and related things))

// we will group related meshes and bodies into objects, so we can update them in tick function, by calling createObject

// ----
// we will also use lil-gui to allow creation of objects by clicking on a button

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
  createSphere: () => {
    //
  },
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

  world.gravity.set(0, -9.82, 0);

  // CANNON.Material and CANNON.ContactMaterial instancs ---------------
  // ---------------------------------------------------------
  // const concreteMaterial = new CANNON.Material("concrete");
  // const plasticMaterial = new CANNON.Material("plastic");

  const defaultMaterial = new CANNON.Material("concrete_and_plastic");

  const defaultContactMaterial = new CANNON.ContactMaterial(
    // concreteMaterial,
    // plasticMaterial,
    defaultMaterial,
    defaultMaterial,
    {
      // values above 1.0 are allowed
      friction: 0.1, // higher the number it is smoother slide like oil
      restitution: 0.7, // higher the number, the bouncing will be larger
    }
  );

  // instead of this (or you can keep this)
  world.addContactMaterial(defaultContactMaterial);
  // set defaultContactMaterial instead
  world.defaultContactMaterial = defaultContactMaterial;

  // ------------------------------------------

  // Sphere
  // we don't need this for our current example
  // const sphereShape = new CANNON.Sphere(0.5);
  /* const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 4, 0),
    shape: sphereShape,
    // we set THREE.Material instance
    // material: plasticMaterial,
    material: defaultMaterial,
  });
 */
  // I applied it in order to body stop moving eventually, after we apply the force
  // sphereBody.linearDamping = 0.1;
  // sphereBody.angularDamping = 0.1;

  // APPLYING LOCAL FORCE ON THE sphereBody
  // FORCE WILL HAVE 150N on thee x axis, and it will be applied in the center of the body
  // we can use negative values to change direction of the force
  //
  // sphereBody.applyLocalForce(
  //   new CANNON.Vec3(-150, 0, 0),
  //   new CANNON.Vec3(0, 0, 0) // in center
  // );

  // like you saw I commented out everything above
  // world.addBody(sphereBody);

  // I also commented out sphere mesh (it's not added to the scene anymore)

  // ---------------------------------------

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body();
  floorBody.mass = 0;
  floorBody.addShape(floorShape);
  world.addBody(floorBody);

  // floorBody.material = concreteMaterial;
  floorBody.material = defaultMaterial;

  //
  floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
  );

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
  // ---------------------------------------------------------------
  //  GEOMETRIES AND MATERIALS
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

  /* const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshMatcapMaterial({
      matcap: sphereMatcap,
    })
  ) */ // sphereMesh.position.y = 0.5;

  // scene.add(sphereMesh);

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
  // sphereMesh.castShadow = true;
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

  gui.add(parameters, "createSphere").onChange(() => {
    /* createSphere(0.5, {
      x: 0,
      y: 3,
      z: 0,
    }); */

    createSphere(Math.random() * 0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    });
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
  // PHYSICS AND MESH UTILS
  // --------------------------------------------------
  // --------------------------------------------------

  const objectsToUpdate: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

  function createSphere(
    radius: number,
    position: { x: number; y: number; z: number }
  ) {
    // mesh ------------------------------------------------
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 20, 20),
      new THREE.MeshMatcapMaterial({
        // metalness: 0.3,
        // roughness: 0.4,
        // envMap: sphereMatcap,
        matcap: sphereMatcap,
        color: "#3bb09c",
      })
    );

    mesh.castShadow = true;
    mesh.position.copy(position);

    scene.add(mesh);
    // -----------------------------------------------------
    // CannonJS body ---------------------------------------
    const shape = new CANNON.Sphere(radius);

    const body = new CANNON.Body({
      mass: 1,
      // position: new CANNON.Vec3(position.x, position.y, position.z),
      position: new CANNON.Vec3(0, 3, 0),
      shape,
      material: defaultMaterial,
    });

    // @ts-expect-error Vec3  Vector3 , or object with x y z
    body.position.copy(position);

    body.linearDamping = 0.1;
    body.angularDamping = 0.1;

    world.addBody(body);

    // save in object to update
    // and we use this object inside tick (looping through and updating every object)
    objectsToUpdate.push({
      mesh,
      body,
    });
  }

  createSphere(0.5, { x: 0, y: 4, z: 0 });
  /* createSphere(0.5, { x: 1, y: 4, z: 1 });
  createSphere(0.5, { x: 2, y: 4, z: 2 });
  createSphere(0.5, { x: 3, y: 4, z: 3 });
  createSphere(0.5, { x: 4, y: 4, z: 4 });
  */
  // console.log(objectsToUpdate);

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

    // MIMICKING THE WIND FORCE
    // since we are doing this on every frame this will be consistent force
    // always applied to the body

    // sphereBody.applyForce(new CANNON.Vec3(0.5, 0, 0), sphereBody.position);
    // I comment it out since I don't need wind, I want to see some other effects

    // ------ UPDATE PHYSICS WORLD ------
    // ---------------------------------------------------
    // ---------------------------------------------------
    // fixed time step for 60fps
    // to understand what are we doing
    // read this:   https://gafferongames.com/post/fix_your_timestep/
    world.step(1 / 60, deltaTime, 3); // max sub steps is 3 (read the article to understand this)

    // console.log(sphereBody.position); CANNON.Vec3
    // console.log(sphereBody.position.y); // you will see this value change (makes sense) (value will decrease)

    // ---------------------------------------------------
    // ----- UPDATE THREEJS WORLD, BY TAKING COORDINATES FROM PHYSICAL WORLD

    for (const element of objectsToUpdate) {
      element.mesh.position.copy(element.body.position);
    }

    // sphereMesh.position.x = sphereBody.position.x;
    // sphereMesh.position.y = sphereBody.position.y;
    // sphereMesh.position.z = sphereBody.position.z;
    // this will work despite we aare deling with THREE.Vector3 and CANNON.Vec3
    // sphereMesh.position.copy(sphereBody.position);

    // same for floor, even floor is static
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
