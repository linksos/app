import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import gsap from 'gsap'
import { AxesHelper } from 'three'

const scene = new THREE.Scene()
const loader = new FBXLoader()

loader.load('/macfbx/source/scene/mac.fbx', (object) => {
  const scaleFactor = 0.3
  object.scale.set(scaleFactor, scaleFactor, scaleFactor)
  object.translateZ(-12 * scaleFactor)
  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true
    }
  })

  mac.add(object)
})

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const mac = new THREE.Group()
mac.name = 'mac'
mac.translateY(-4.25)
scene.add(mac)

const iframe = document.createElement('iframe')
iframe.src = "https://arjunphull123.github.io/black-space"
iframe.width = '1024'
iframe.height = '768'
iframe.style.border = 'none'
iframe.style.overflow = 'hidden'
iframe.scrolling = 'no'

const canvas = document.querySelector('.webgl')


const CSSRenderer = new CSS3DRenderer({canvas})
CSSRenderer.setSize(sizes.width, sizes.height)
CSSRenderer.domElement.style.position = "absolute"
CSSRenderer.domElement.style.zIndex = '1'
CSSRenderer.domElement.style.pointerEvents = 'none'
CSSRenderer.domElement.style.top = "0px"

const screen = new CSS3DObject(iframe)
screen.name = "screen"
const scrScale = 0.01 * 0.42
screen.scale.set(scrScale, scrScale, scrScale)
screen.position.set(0, 1.87, 2.5)
screen.rotation.set(-6.5* 2 * 3.14159 / 360, 0, 0)
scene.add(screen)

const backingGeom = new THREE.PlaneGeometry(700, 600)
const backingMat = new THREE.MeshLambertMaterial({color: 0x000000})
const backing = new THREE.Mesh(backingGeom, backingMat)
backing.name = "backing"
const bScale = scrScale * 2
backing.scale.set(bScale, bScale, bScale)
backing.position.set(0, 2, 2.5)
backing.rotation.set(-6.5* 2 * 3.14159 / 360, 0, 0)
scene.add(backing)


const container = document.querySelector('.container')
container.appendChild(CSSRenderer.domElement)

// Lights
const ambLight = new THREE.AmbientLight(0xfaf9f6, 0.5)
scene.add(ambLight)

const ptLight = new THREE.DirectionalLight(0xfaf9f6, 0.1, 100)
ptLight.position.set(10, 10, 10)
ptLight.castShadow = true
scene.add(ptLight)


const ptLight2 = new THREE.DirectionalLight(0xfaf9f6, 0.3, 100)
ptLight2.position.set(-10, 10, 10)
ptLight2.castShadow = true
scene.add(ptLight2)

const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.2 )
scene.add(hemiLight)

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-4.5, 0, 18.6)
camera.rotation.set(0, 0, 0)


scene.add(camera)

const renderer = new THREE.WebGLRenderer({canvas})
renderer.setClearColor("#dfdbce")
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(2)
renderer.render(scene, camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
//controls.enableZoom = false
controls.enablePan = false
//controls.autoRotate = true
//controls.autoRotateSpeed = 10
controls.maxPolarAngle = (90) * Math.PI/180
controls.minPolarAngle = (40) * Math.PI/180
controls.minAzimuthAngle = - (53) * Math.PI/180; // -90 degrees
controls.maxAzimuthAngle = (53) * Math.PI/180; // 90 degrees


let zoomed = 0

screen.element.addEventListener("mouseenter", () => {
  console.log("mouse entered screen")
  animateCamera('screen')
})

let bounce = 0.125

function animateCamera(state) {
  const d = 0.5
  if (state == 'screen') {
    bounce = 0
    console.log('Animating to screen')
    gsap.to(camera.position, d, {x: 0, y: 1, z: 8})
    gsap.to(camera.rotation, d, {x: -0.12, y: 0, z: 0})
    gsap.to(mac.position, d, {y: -5.75})
    gsap.to(screen.position, d, {y: 0.37})
    gsap.to(backing.position, d, {y: 0.5})
    zoomed = 1
  } else {
    bounce = 0.125
    console.log('Animating to back')
    gsap.to(camera.position, d, {x: -4.5, y: 0, z: 18.6})
    gsap.to(camera.rotation, d, {x: 0, y: 0, z: 0})
    gsap.to(mac.position, d, {y: -4.25})
    gsap.to(screen.position, d, {y: 1.87})
    gsap.to(backing.position, d, {y: 2})
    zoomed = 0
  }
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastHoverObject = null;

// Set the initial target to the center of the scene
const initialTarget = new THREE.Vector3(0, 0, 0);
controls.target.copy(initialTarget);

// Set the amount of orbiting to apply on hover
const orbitAmount = 0.005;

function onMouseMove(event) {
  const { clientX, clientY } = event;
  const { left, top, width, height } = canvas.getBoundingClientRect();
  mouse.x = ((clientX - left) / width) * 2 - 1;
  mouse.y = -((clientY - top) / height) * 2 + 1;
}

canvas.addEventListener("mousemove", onMouseMove);

function updateHoverObject() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const hoverObject = intersects.length > 0 ? intersects[0].object : null;
  if (hoverObject !== lastHoverObject) {
    if (hoverObject) {
      console.log(hoverObject.name)
      if (hoverObject.name == 'macintosh128' && zoomed == 1) {
        animateCamera('back')
      }
    }
    lastHoverObject = hoverObject;
  }
}

//Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
})

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    console.log("Camera position:", camera.position);
    console.log("Camera rotation:", camera.rotation);
    console.log("Azimuth:", controls.getAzimuthalAngle())
  }
});


let minPosition = -5; // Minimum position value
let maxPosition = 3; // Maximum position value
let period = 10000; // Time period of the oscillation in milliseconds
let amplitude = ((maxPosition - minPosition) / 2) * (1 - zoomed) // Amplitude of the oscillation

let ticker=0

const loop = () => {
  requestAnimationFrame(loop)
  controls.update()
  updateHoverObject()
  CSSRenderer.render(scene, camera)
  renderer.render(scene,camera)
  const float = Math.sin(ticker * 0.0011) * bounce;
  scene.position.y = float
  ticker += 20 * (1-zoomed)
}
loop()
