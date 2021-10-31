import * as THREE from './js/three.module.js'
import { OrbitControls } from './js/OrbitControls.js'
import { GLTFLoader } from './js/GLTFLoader.js'
import Stats from './js/stats.module.js'

// todo
// Navigation menu
// Cklickable objects 

// create Scene, Camera, renderer

const scene = new THREE.Scene()
// Optional the 3D Axes
scene.add(new THREE.AxesHelper(5))
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
camera.position.set(-199, -142, 73)

// Renderer with Anti-Aliasing, then set renderer aspect ration, add to the document
// difference bewtween WebGLRenderer and WebGL1Renderer
const renderer = new THREE.WebGL1Renderer( {antialias: true})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// create the light
const hlight = new THREE.AmbientLight (0x404040,100);
scene.add(hlight);
const directionalLight = new THREE.DirectionalLight(0xffffff,100);
directionalLight.position.set(0,1,0);
directionalLight.castShadow = true;
scene.add(directionalLight);


// create the OrbitControls, params: camera and renderer
const controls = new OrbitControls(camera, renderer.domElement)
// deceleration of the camera
controls.enableDamping = true 

// create the gLTFLoader and import the object
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

// EventListener for resizing the window
window.addEventListener('resize', onWindowResize, false)
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

// The stats
const stats = Stats()
document.body.appendChild(stats.dom)

// animate function in infinite loop, on every change update the controls and render again
function animate() {
	requestAnimationFrame(animate);
    controls.update()
    renderer.render(scene, camera)
    stats.update()
}

animate()

// mouse event listener
const mouse ={
    x: undefined,
    y: undefined,
    z: undefined
}
addEventListener('mousemove', (event)=>{
    mouse.x = event.clientX
    mouse.y = event.clientY
    mouse.z = event.ClientZ    
}

)