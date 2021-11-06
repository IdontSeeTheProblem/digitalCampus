import * as THREE from './three.module.js'
import { OrbitControls } from './OrbitControls.js'
import { GLTFLoader } from './GLTFLoader.js'
// Interactive: https://github.com/markuslerner/THREE.Interactive#readme
import { InteractionManager} from './three.interactive.module.js'
import createBldg from './createBldg.js'

// create Scene, Camera, renderer
//#region Scene, Camera, renderer
const scene = new THREE.Scene()
// Optional Background color
scene.background = new THREE.Color(0xA9D7FF);

// Camera params: Field of View (FOV), apect ratio, nearest renderable distance, furthest renderable distance
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
)
// Set camera pos
// rotation in browser is in radiant, convert to degrees, y first x second in radians
// x: horizontal movement, y: vertical movement, z: zoom in or out
camera.position.set(77, 95, 105)

// Renderer with Anti-Aliasing, then set renderer aspect ration, add to the document
// difference bewtween WebGLRenderer and WebGL1Renderer to document
const renderer = new THREE.WebGL1Renderer( {antialias: true})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
//#endregion

// create the lights, Todo: define Lights for good texture
//#region Lights
const hlight = new THREE.AmbientLight (0x404040,5);
scene.add(hlight);
const directionalLight = new THREE.DirectionalLight(0xFFF0BF,5);
directionalLight.position.set(10,50,50);
directionalLight.castShadow = true;
scene.add(directionalLight);
//#endregion

// create the OrbitControls, params: camera and renderer
const controls = new OrbitControls(camera, renderer.domElement)
// deceleration of the camera
controls.enableDamping = true 

// create the gLTFLoader and import the object
//#region GLTFLoader
const loader = new GLTFLoader()
loader.load(
    'models/scene.gltf',
    function (gltf) {
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
//#endregion

// building's objects for interactions, set opacity to 0 for transparency
//#region Building Objects
const bldgs = {
    mainBldg: createBldg({ l:30, w:20, h:10, color: 0xffff00, opacity: 1, x:-35, y:10, z:-40.5}),
    lib: createBldg({ l:12, w:10, h:30, color: 0xffff00, opacity: 1, x:-12, y:5, z:-130}),
    lab: createBldg({ l:15, w:20, h:80, color: 0xffff00, opacity: 1, x:-82, y:10, z:-95 }),
    mensa: createBldg({ l:25, w:10, h:40, color: 0xffff00, opacity: 1, x:-85, y:5, z:-170}),
    dorm: createBldg({ l:11, w:25, h:55, color: 0xffff00, opacity: 1, x:-14, y:12.5, z:-222 })
};
for (const object of Object.values(bldgs)) {
    scene.add(object);
}
//#endregion

// create click with the buildings
//#region Building click
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
for (const [name, object] of Object.entries(bldgs)) {
  object.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log(`${name} building was clicked`);
    const bldg = event.target;
    // makes the camera look at the building
    controls.target = new THREE.Vector3(bldg.position.x, bldg.position.y, bldg.position.z)
    // the tedious task of positioning the camera to look at the building 
    switch (name){
        case 'mainBldg':
            camera.position.set(bldg.position.x+10, bldg.position.y+20, bldg.position.z+50)
            break;
        case 'lib':
            camera.position.set(bldg.position.x-40, bldg.position.y+10, bldg.position.z-30)
            break;
        case 'lab':
            camera.position.set(bldg.position.x+50, bldg.position.y+15, bldg.position.z+5)
            break;
        case 'mensa':
            camera.position.set(bldg.position.x+40, bldg.position.y+10, bldg.position.z-10)
            break;
        case 'dorm':
            camera.position.set(bldg.position.x+60, bldg.position.y+20, bldg.position.z+20)
            break;
    }
    controls.update()
  });
  interactionManager.add(object);
  scene.add(object);
}
//#endregion

// animate function in infinite loop, on every change update the controls and render again
function animate() {
	requestAnimationFrame(animate);
    controls.update()
    renderer.render(scene, camera)
    interactionManager.update();
}
animate()

// EventListener for resizing the window
//#region resize windows EventListener
window.addEventListener('resize', onWindowResize, false)
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}
//#endregion

// EventListener for Navigation menu
//#region Navigation menu
document.getElementById("mainBldg").addEventListener("click", function(){
    navigateToBuilding({name: "mainBldg"});
})
document.getElementById("lib").addEventListener("click", function(){
    navigateToBuilding({name: "lib"});
})
document.getElementById("lab").addEventListener("click", function(){
    navigateToBuilding({name: "lab"});
})
document.getElementById("mensa").addEventListener("click", function(){
    navigateToBuilding({name: "mensa"});
})
document.getElementById("dorm").addEventListener("click", function(){
    navigateToBuilding({name: "dorm"});
})
function navigateToBuilding({name}) {
    for (const [bldg, object] of Object.entries(bldgs)) {
        if (bldg === name) {
          controls.target = new THREE.Vector3(object.position.x, object.position.y, object.position.z) 
          switch (name){
            case 'mainBldg':
                camera.position.set(object.position.x+10, object.position.y+20, object.position.z+50)
                break;
            case 'lib':
                camera.position.set(object.position.x-40, object.position.y+10, object.position.z-30)
                break;
            case 'lab':
                camera.position.set(object.position.x+50, object.position.y+15, object.position.z+5)
                break;
            case 'mensa':
                camera.position.set(object.position.x+40, object.position.y+10, object.position.z-10)
                break;
            case 'dorm':
                camera.position.set(object.position.x+60, object.position.y+20, object.position.z+20)
                break;
        }
          console.log(object.position.x, object.position.y, object.position.z);
          controls.update()
        }
      }
}
//#endregion