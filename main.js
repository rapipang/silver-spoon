import './style.css'

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

import * as THREE from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Vector3 } from 'three';

let composer, effect;

var boost = 0;
var EaseVal = 0;
var particle1Count = 600;


function lerp(v0, v1, amt, maxMove = 0, minDiff = 0.0001) {
  let diff = v1 - v0;
  if (maxMove > 0) {
    diff = Math.min(diff, maxMove);
    diff = Math.max(diff, -maxMove);
  }
  if (Math.abs(diff) < minDiff) {
    return v1;
  }
  return v0 + diff * amt;
};


var checkScrollSpeed = (function (settings) {
  settings = settings || {};

  var lastPos, newPos, timer, delta,
    delay = settings.delay || 50; // in "ms" (higher means lower fidelity )

  function clear() {
    lastPos = null;
    delta = 0;
  }

  clear();

  return function () {
    newPos = window.scrollY;
    if (lastPos != null) { // && newPos < maxScroll /lastPos != null
      delta = newPos - lastPos;
    }
    lastPos = newPos;
    clearTimeout(timer);
    timer = setTimeout(clear, delay);
    return delta;
  };
})();

window.addEventListener( 'resize', onWindowResize );

window.addEventListener('scroll', e => {
  var scrSpeed = checkScrollSpeed();
  EaseVal = lerp(0, scrSpeed * 15, 0.0001, 0, 0.0000001);
  boost += 1 * EaseVal;
  // console.log("User speed is " + scrSpeed);
  // console.log("Push Boost " + boost);
  

});

const clock = new THREE.Clock();
const scene = new THREE.Scene();
var particles = [];
for(var i = 0; i < particle1Count; i++){
  particles.push(new Particle(scene));
  // console.log("X particle Added!!");
}

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}



const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.setZ(40);



const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(ambient);
ambient.intensity = 0.3;


scene.fog = new THREE.Fog("rgb(30, 60, 120)", 1, 65);

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


//RenderPass
const renderScene = new RenderPass( scene, camera );

//PostProcessing Bloom
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0, 0, 0 );
bloomPass.threshold = 0.001;
bloomPass.strength = 1.4;
bloomPass.radius = 0.4;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );


// window.addEventListener('touchstart', function (evt) {

//   dcontrols.enabled = true;
//   evt.preventDefault();
//   console.log('touch test');
//   dcontrols.enabled = true;
//   instructions.style.display = 'none';
//   blocker.style.display = 'none';

// }, false);

//GrannyKnot
class GrannyKnot extends THREE.Curve {

  getPoint(t, optionalTarget = new THREE.Vector3()) {

    const point = optionalTarget;
    t = 2 * Math.PI * t;
    const x = -0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t);
    const y = -0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t);
    const z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);
    return point.set(x, y, z).multiplyScalar(20);
  }
}


//Wall
const curve = new GrannyKnot(1);
const geometry0 = new THREE.TubeBufferGeometry(curve, 80, 2.5, 14, true);
const material0 = new THREE.MeshStandardMaterial({
  color: "rgb(44, 51, 152)",
  fog: true,

  side: THREE.BackSide
});
const tubeWall = new THREE.Mesh(geometry0, material0);
scene.add(tubeWall);


//WireFrame
const geometry1 = new THREE.TubeBufferGeometry(curve, 120, 2, 16, true);
const material1 = new THREE.MeshBasicMaterial({
  wireframe: true,
  fog: false,
  color: 0xffffff,
  side: THREE.DoubleSide
});
const tubeWire = new THREE.Mesh(geometry1, material1);
scene.add(tubeWire);


//Particle
function Particle(scene) {
  this.pRRandom = Math.random();
  this.icosSpehe = new THREE.IcosahedronGeometry( 0.3 * (this.pRRandom + 0.3), 0);
  this.diamon =  new THREE.OctahedronGeometry(0.2 * (this.pRRandom + 0.3), 0);
  this.tVal = 0;

  //Randomize Geo
  if (this.pRRandom < 0.5) {
    this.pGeo = this.icosSpehe;
    this.pMat = new THREE.MeshStandardMaterial({color: 0xff4242, fog: true, transparent: true, opacity: 1, roughness:0.2, emissive: 0x1722ba});
    // console.log("icos PPP!!")
  }
  else if (this.pRRandom > 0.5){
    this.pGeo = this.diamon;
    this.pMat = new THREE.MeshStandardMaterial({color: 0xff4242, fog: true, transparent: true, opacity: 1, roughness:0.2, emissive: 0xb235bb});
    // console.log("diamons PPP!!")
  }
  


  this.pMesh = new THREE.Mesh(this.pGeo, this.pMat);
  this.pMesh.position.set(0,0,0);
  this.offset = new THREE.Vector3((Math.random()-0.5)* 2.5, (Math.random()-0.5) * 3, (Math.random()-0.5) * 2);
  this.rotate = new THREE.Vector3(-Math.random()* 0.01 + 0.01, Math.random()* 0.005 ,Math.random()*0.01);
  scene.add(this.pMesh);
  // console.log("Mesh added");
}





Particle.prototype.update = function () {
  this.spdOfset = this.pRRandom + 0.5;
  this.addOfset = this.pRRandom * 1000;
  this.tVal += 0.01;
  this.sin =Math.sin(this.tVal + this.addOfset);

  this.movemnt = new THREE.Vector3 ( this.sin * 0.1,  this.sin * -0.3 ,  this.sin * this.spdOfset/10 );
  // - boost/2 vvv
  this.time = clock.getElapsedTime() * this.spdOfset;
  this.looptime = 150 + this.pRRandom * 70;

  this.t = ((this.time + this.addOfset) % this.looptime) / this.looptime;

  // this.pos = tubeWire.geometry.parameters.path.getPointAt(this.t).add(this.offset);
  
  this.pos = tubeWire.geometry.parameters.path.getPointAt(this.t);

  this.pMesh.position.x = this.pos.x + this.offset.x + this.movemnt.x;
  this.pMesh.position.y = this.pos.y + this.offset.y + this.movemnt.y;
  this.pMesh.position.z = this.pos.z + this.offset.z + this.movemnt.z;

  this.pMesh.rotation.x += this.rotate.x;
  this.pMesh.rotation.y += this.rotate.y;
  this.pMesh.rotation.z += this.rotate.z;
  // console.log("Moved!!" + "  _this T is _" +  this.t);
}

//Helper
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);
// const controls = new OrbitControls(camera, renderer.domElement);




function updateCamera() {
  const camOffset = 1000;
  const time = clock.getElapsedTime() + boost + camOffset;
  const looptime = 100;

  const t = (time % looptime) / looptime;
  const t2 = ((time + 0.2) % looptime) / looptime

  const pos = tubeWire.geometry.parameters.path.getPointAt(t);
  const pos2 = tubeWire.geometry.parameters.path.getPointAt(t2);

  camera.position.copy(pos);
  camera.lookAt(pos2);

}

function trackCamera(obj)
{
  camera.lookAt(obj);
}



function animate() {
  requestAnimationFrame(animate);
  updateCamera();
  // ambintUpdate();
  // controls.update();
 
  


  for(var i = 0; i < particles.length; i++){
   particles[i].update();
  //  console.log(particles[0].t);
  }

  

  // console.log("intensity is__" + ambient.intensity);
  renderer.render(scene, camera);
  composer.render();
  // effect.setSize( window.innerWidth, window.innerHeight );
}

function ambintUpdate()
{
  if(ambient.intensity > 0.5)
  {
    ambient.intensity -= 0.0001;
  }

  if(ambient.intensity > 0.7)
  {
    ambient.intensity -= 0.01;
  }

  if(ambient.intensity > 0.9)
  {
    ambient.intensity -= 0.03;
  }
}

animate()