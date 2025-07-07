import {
  Curtains,
  Plane,
  Vec2,
} from "https://cdn.jsdelivr.net/npm/curtainsjs@7.2.0/src/index.mjs";

window.addEventListener("load", () => {
  // Define the mouse position and deltas
  const mousePosition = new Vec2();
  const mouseLastPosition = new Vec2();
  const deltas = {
    max: 0,
    applied: 0,
  };
  
  // set up our WebGL context and append the canvas to our wrapper
  const curtains = new Curtains ({
  container: "canvas",
  pixelRatio: Math.min(1.5, window.devicePixelRatio),
  });

  // get our plane element
  const planeElements = document.getElementsByClassName("curtain");

  // some basic parameters
  const params = {
    vertexShader: vs,
    fragmentShader: fs,
    widthSegments: 20,
    heightSegments: 20,
    uniforms: {
      resolution: {
        name: "uResolution",
        type: "2f", //lengtth 2 array of floats
        value: [planeElements[0].clientWidth, planeElements[0].clientHeight],
      },
      time : {
        name: "uTime",
        type: "1f", // single float
        value: 0,
      },
      mousePosition: {
        name: "uMousePosition",
        type: "2f", // length 2 array of floats
        value: mousePosition,
      },
      mouseMoveStrength: {
        name: "uMouseMoveStrength",
        type: "1f", // single float
        value: 0,
      },
    },
  };

  // create our plane and ready it for this effect
  const simplePlane = new Plane(curtains, planeElements[0], params);

    simplePlane. onReady (() => {
    // set fove between 1-150 to reduce or get the perspective
    simplePlane.setPerspective(55);

      // now that our plane is ready we an Listen to mouse move event
      const wrapper = document.getElementById("curtainjs");

      wrapper. addEventListener("mousemove", (e) => {
      handleMovement(e, simplePlane);
      });

      document.body.classList.add("video-started");
      // apply a little effect once everything is ready
      deltas.max = 2;
      simplePlane.playVideos();
    })
    .onRender (() => {
      simplePlane.uniforms.time.value++;

      deltas.applied += (deltas.max - deltas.applied) * 0.02;
      deltas.max += (0 - deltas.max) * 0.01;

      // send the new mouse mousemove strength value
      simplePlane.uniforms.mouseMoveStrength.value = deltas.applied;
    });

  // handle the mouse move event
  function handleMovement(e, plane) {
    // update mouse last pos
    mouseLastPosition.copy(mousePosition);

    const mouse = new Vec2();

    // touch event
    if (e.targetTouches) {
      mouse.set(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    }
    // mouse event
    else {
      mouse.set(e.clientX, e.clientY);
    }

    // lerp the mouse position a bit to smoothen the overall effect
    mousePosition.set(
      curtains.lerp(mousePosition.x, mouse.x, 0.3),
      curtains.lerp(mousePosition.y, mouse.y, 0.3)
    );

    // convert our mouse/touch position to coordinates relative to the vertices of the plane and update our uniform
    plane.uniforms.mousePosition.value =
      plane.mouseToPlaneCoords(mousePosition);

    // calculate the mouse move strength
    if (mouseLastPosition.x && mouseLastPosition.y) {
      let delta =
        Math.sqrt(
          Math.pow(mousePosition.x - mouseLastPosition.x, 2) +
            Math.pow(mousePosition.y - mouseLastPosition.y, 5)
        ) / 30;
      delta = Math.min(8, delta);
      // update max delta only if it increased
      if (delta >= deltas.max) {
        deltas.max = delta;
      }
    }
  }
});
