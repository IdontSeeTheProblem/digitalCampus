import * as THREE from './three.module.js'
import { OrbitControls } from './OrbitControls.js'
import { GLTFLoader } from './GLTFLoader.js'
// Interactive: https://github.com/markuslerner/THREE.Interactive#readme
import { InteractionManager} from './three.interactive.module.js'
import createBldg from './createBldg.js'

// todo: zoom with double click 

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
const renderer = new THREE.WebGL1Renderer( {alpha: true, antialias: true}) 
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
//#endregion

// create the lights, Todo: define Lights for good texture
//#region Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5);
scene.add(hemiLight);
const light = new THREE.DirectionalLight(0xffeeb1,2);
light.castShadow = true;
light.shadow.mapSize.width = 1024;  // default
light.shadow.mapSize.height = 1024; // default
light.position.set(0,20,0);
light.target.position.set(-35,10,-40)
scene.add(light)
scene.add(light.target)
const helper = new THREE.DirectionalLightHelper( light );
scene.add(helper);

function updateLight() {
    light.target.updateMatrixWorld();
    helper.update();
  }
  updateLight();
//#endregion

// create the OrbitControls, params: camera and renderer
//#region controls
const controls = new OrbitControls(camera, renderer.domElement)
// deceleration of the camera
controls.enableDamping = true
controls.target.set(0,2.5,-100)
var camtarget = new THREE.Object3D()
camtarget.position.set(0,2.5,-100)
setTimeout(() => {  
    gsap.to( camera.position, {
        duration: 3,
        x: camtarget.position.x+95,
        y: camtarget.position.y+60,
        z: camtarget.position.z+95,
        onUpdate: function() {
            controls.update()
        }
    } )
}, 
5000)

controls.maxPolarAngle = Math.PI/2;
controls.minDistance = 10;
controls.maxDistance = 200;

var minPan = new THREE.Vector3( -1000, 0, -1000 );
var maxPan = new THREE.Vector3( 1000, 150, 1000 );
var panVec = new THREE.Vector3();
    
controls.addEventListener("change", function() {
    panVec.copy(controls.target)
    controls.target.clamp(minPan, maxPan)
    panVec.sub(controls.target)
    camera.position.sub(panVec)
})
//#endregion

// create a loading screen untill all elements are loaded
//#region loading screen	
const loadingManager = new THREE.LoadingManager( () => {

    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    
    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
} );
//#endregion

// create the gLTFLoader and import the object
//#region GLTFLoader
const loader = new GLTFLoader(loadingManager)

loader.load( 'models/scene.glb', function (gltf) {
    const root = gltf.scene
    scene.add(gltf.scene)
    },
    // (xhr) => {console.log((xhr.loaded / xhr.total) * 100 + '% loaded')},
    // (error) => {console.log(error)}
)
loader.load( 'models/scene.gltf', function (gltf) {
    const root = gltf.scene
    gltf.scene.scale.set(0.5,0.5,0.5)
    const mesh = gltf.scene;
    mesh.position.set(-30,0,-20);
    scene.add(mesh);
    scene.add(gltf.scene)
    },
    // (xhr) => {console.log((xhr.loaded / xhr.total) * 100 + '% loaded')},
    // (error) => {console.log(error)}
)
//#endregion

// Skybox with Textures
// Quelle: https://opengameart.org/node/28792
// Author: Submitted by Calinou
// Quelle: https://redstapler.co/create-3d-world-with-three-js-and-skybox-technique/
//#region Skybox
let matArray = []
let tex_ft = new THREE.TextureLoader(loadingManager).load('../resources/meadow_ft.jpg')
let tex_bk = new THREE.TextureLoader(loadingManager).load('../resources/meadow_bk.jpg')
let tex_rt = new THREE.TextureLoader(loadingManager).load('../resources/meadow_rt.jpg')
let tex_lf = new THREE.TextureLoader(loadingManager).load('../resources/meadow_lf.jpg')
let tex_up = new THREE.TextureLoader(loadingManager).load('../resources/meadow_up.jpg')
let tex_dn = new THREE.TextureLoader(loadingManager).load('../resources/meadow_dn.jpg')

matArray.push(new THREE.MeshBasicMaterial( {map: tex_ft}))
matArray.push(new THREE.MeshBasicMaterial( {map: tex_bk}))
matArray.push(new THREE.MeshBasicMaterial( {map: tex_up}))
matArray.push(new THREE.MeshBasicMaterial( {map: tex_dn}))
matArray.push(new THREE.MeshBasicMaterial( {map: tex_rt}))
matArray.push(new THREE.MeshBasicMaterial( {map: tex_lf}))

for (let i = 0; i < 6; i++) {
    matArray[i].side = THREE.BackSide 
}

const sykboxGeo = new THREE.BoxGeometry(500, 500, 500)
const skybox = new THREE.Mesh(sykboxGeo, matArray)
skybox.position.set(-10, 0, -150)
scene.add(skybox)
//#endregion


// building's objects for interactions, set opacity to 0 for transparency
//#region Building Objects
const bldgs = {
    rst: createBldg({ 
        l:1, w:1, h:1, color: 0xffff00, opacity: 1, x:0, y:2.5, z:-100, rotation: 0
    }),
    mainBldg: createBldg({ 
        l:30, w:20, h:10, color: 0xffff00, opacity: 1, x:-35, y:10, z:-40.5, rotation: 0
    }),
    lib: createBldg({ 
        l:12, w:4.9, h:39, color: 0xffff00, opacity: 1, x:-14, y:2.6, z:-130, rotation: -3.2
    }),
    lab: createBldg({ 
        l:16, w:18, h:80, color: 0xffff00, opacity: 1, x:-75, y:7, z:-105, rotation: -3.28
    }),
    mensa: createBldg({ 
        l:26, w:9.7, h:42, color: 0xffff00, opacity: 1, x:-67, y:-0.5, z:-185, rotation: -3.31
    }),
    dorm: createBldg({ 
        l:14.8, w:25, h:59, color: 0xffff00, opacity: 1, x: 3.5, y:12.15, z:-220, rotation: -3.37
    })
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
    const bldg = event.target;
    // makes the camera look at the building
    controls.target = new THREE.Vector3(bldg.position.x, bldg.position.y, bldg.position.z)
    // the tedious task of positioning the camera to look at the building 
    switch (name){
        case 'mainBldg':
            gsap.to( camera.position, {
                duration: 2,
                x: bldg.position.x+10,
                y: bldg.position.y+20,
                z: bldg.position.z+50,
                onUpdate: function() {
                    controls.update();
                }
            } );
            break;
        case 'lib':
            gsap.to( camera.position, {
                duration: 2,
                x: bldg.position.x-25,
                y: bldg.position.y+1,
                z: bldg.position.z-45,
                onUpdate: function() {
                    controls.update();
                }
            } );
            break;
        case 'lab':
            gsap.to( camera.position, {
                duration: 2,
                x: bldg.position.x+40,
                y: bldg.position.y+10,
                z: bldg.position.z-55,
                onUpdate: function() {
                    controls.update();
                }
            } );
            break;
        case 'mensa':
            gsap.to( camera.position, {
                duration: 2,
                x: bldg.position.x+50,
                y: bldg.position.y+10,
                z: bldg.position.z+30,
                onUpdate: function() {
                    controls.update();
                }
            } );
            break;
        case 'dorm':
            gsap.to( camera.position, {
                duration: 2,
                x: bldg.position.x+25,
                y: bldg.position.y+20,
                z: bldg.position.z+55,
                onUpdate: function() {
                    controls.update();
                }
            } );
            break;
    }
    controls.update()
  });
  interactionManager.add(object);
  scene.add(object);
}
//#endregion

// create Annotations for building and mouse style on hover
// rotation source: https://manu.ninja/webgl-three-js-annotations/
//#region Annotations for buildings
// get the canvas by "number" as 2D Element
const canvas = document.getElementById("number");
const ctx = canvas.getContext("2d");

// get the description of the buildings from HTML
const mainAnno = document.querySelector("#mainAnno")
const libAnno = document.querySelector("#libAnno")
const labAnno = document.querySelector("#labAnno")
const mensaAnno = document.querySelector("#mensaAnno")
const dormAnno = document.querySelector("#dormAnno")

// craete EventListener for hover and mouseout to shoe the description
const infoIM = new InteractionManager(renderer, camera, renderer.domElement)
for (const [name, object] of Object.entries(bldgs)) 
{
    var cursorStyle = document.getElementsByTagName("body")[0]

    object.addEventListener("mouseover", (event) => 
    {
        event.stopPropagation()
        var vector, canvas
        // change cursor style
        cursorStyle.style.cursor = "pointer";
        // the tedious task of positioning the camera to look at the building 
        switch (name){
            case 'mainBldg':
                mainAnno.style.visibility = 'visible'
                vector = new THREE.Vector3(-25, 25, -50);
                canvas = renderer.domElement;
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                mainAnno.style.top = `${vector.y}px`;
                mainAnno.style.left = `${vector.x}px`;
                break;
            case 'lib':
                libAnno.style.visibility = 'visible'
                vector = new THREE.Vector3(-15, 5, -150);
                canvas = renderer.domElement;
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                libAnno.style.top = `${vector.y}px`;
                libAnno.style.left = `${vector.x}px`;
                break;
            case 'lab':
                labAnno.style.visibility = 'visible'
                vector = new THREE.Vector3(-80, 20, -120);
                canvas = renderer.domElement;
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                labAnno.style.top = `${vector.y}px`;
                labAnno.style.left = `${vector.x}px`;
                break;
            case 'mensa':
                mensaAnno.style.visibility = 'visible'
                vector = new THREE.Vector3(-75, 10, -185);
                canvas = renderer.domElement;
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                mensaAnno.style.top = `${vector.y}px`;
                mensaAnno.style.left = `${vector.x}px`;
                break;
            case 'dorm':
                dormAnno.style.visibility = 'visible'
                vector = new THREE.Vector3(-10, 30, -200);
                canvas = renderer.domElement;
                vector.project(camera);
                vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                dormAnno.style.top = `${vector.y}px`;
                dormAnno.style.left = `${vector.x}px`;
                break;
        }
        controls.update()
    })
    object.addEventListener("mouseout", (event) => 
    {
        event.stopPropagation();
        const bldg = event.target;
        // change the cursor back
        cursorStyle.style.cursor = "auto";
        // the tedious task of positioning the camera to look at the building 
        switch (name){
            case 'mainBldg':
                mainAnno.style.visibility = 'hidden'
                break;
            case 'lib':
                libAnno.style.visibility = 'hidden'
                break;
            case 'lab':
                labAnno.style.visibility = 'hidden'
                break;
            case 'mensa':
                mensaAnno.style.visibility = 'hidden'
                break;
            case 'dorm':
                dormAnno.style.visibility = 'hidden'
                break;
        }
        controls.update()
    });
    infoIM.add(object);
    scene.add(object);
}
//#endregion


// animate function in infinite loop, on every change update the controls and render again
function animate() {
    scene.updateMatrixWorld()
    controls.update()
    //css3Renderer.render(scene, camera)
    interactionManager.update()
    requestAnimationFrame(animate)
    renderer.render( scene, camera )
}
animate()

// source: https://jsfiddle.net/vfug1adn/19/
function onTransitionEnd( event ) {
	const element = event.target
	element.remove()
}

// EventListener for resizing the window
// source https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
//#region resize windows EventListener
window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}
//#endregion

// EventListener for Navigation menu
//#region Navigation menu
document.getElementById("rst").addEventListener("click", function(){
    navigateToBuilding({name: "rst"});
})
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
            case 'rst':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x+95,
                    y: object.position.y+60,
                    z: object.position.z+95,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
            case 'mainBldg':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x+10,
                    y: object.position.y+20,
                    z: object.position.z+50,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
            case 'lib':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x-25,
                    y: object.position.y+15,
                    z: object.position.z-45,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
            case 'lab':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x+40,
                    y: object.position.y+10,
                    z: object.position.z-55,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
            case 'mensa':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x+50,
                    y: object.position.y+15,
                    z: object.position.z+30,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
            case 'dorm':
                gsap.to( camera.position, {
                    duration: 2,
                    x: object.position.x+25,
                    y: object.position.y+20,
                    z: object.position.z+55,
                    onUpdate: function() {
                        controls.update();
                    }
                } );
                break;
        }
          controls.update()
        }
      }
}
//#endregion

