import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCatAnimator } from './animations.js';
import './style.css';
import { createGrounding } from './grounding.js';

const canvas = document.querySelector('#scene');
const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-action]')];
const reset = document.querySelector('#reset');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#adc4c0');
scene.fog = new THREE.Fog('#adc4c0', 12, 30);
const camera = new THREE.PerspectiveCamera(38, 1, .01, 80);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 1.8;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI / 2 - .03;
controls.enablePan = false;
function restoreCamera() {
  camera.position.set(-2.6, 1.65, 3.4);
  controls.target.set(0, .55, 0);
  controls.update();
}
restoreCamera();
scene.add(new THREE.HemisphereLight('#fff8ea', '#637e79', 2));
function light(color, intensity, position) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...position); scene.add(l); return l;
}
const key = light('#fff1dd', 3.1, [3,5,4]);
key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera, {left:-4,right:4,top:4,bottom:-4,near:.1,far:20});
key.shadow.bias = -.0002;
key.shadow.normalBias = .015;
key.shadow.radius = 4;
light('#dcecff', 1.5, [-4,3,1]);
light('#ffffff', 2, [0,4,-4]);
const studioMaterial = new THREE.MeshStandardMaterial({color:'#adc4c0',roughness:1});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), studioMaterial);
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
// Caixa aberta na frente: piso e três paredes discretas formam o estúdio.
for (const [x,z,ry] of [[0,-9,0],[-12,0,Math.PI/2],[12,0,-Math.PI/2]]) {
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(24,14), studioMaterial);
  wall.position.set(x,7,z); wall.rotation.y = ry; wall.receiveShadow = true; scene.add(wall);
}
let animator;
let groundCat;
let speed = 1;
function play(name) {
  if (!animator) return;
  animator.play(name);
  status.textContent = animator.labels[name];
  for (const b of buttons) { const active = b.dataset.action === name; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); }
}
new GLTFLoader().load(`${import.meta.env.BASE_URL}source/Cat.glb`, gltf => {
  try {
    const cat = gltf.scene;
    cat.traverse(o => { if (o.isMesh) {o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;} });
    const box = new THREE.Box3().setFromObject(cat);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.05 / size.y;
    cat.scale.setScalar(scale);
    box.setFromObject(cat);
    const center = box.getCenter(new THREE.Vector3());
    cat.position.set(-center.x, -box.min.y + .006, -center.z);
    scene.add(cat);
    animator = createCatAnimator(cat);
    groundCat = createGrounding(cat);
    buttons.forEach(b => b.disabled = false); reset.disabled = false;
    play('idle');
    // Permite inspecionar a cena durante estudo e testes no console do navegador.
    window.catStudio = {scene, cat, animator, camera, play, renderer};
  } catch (error) { status.textContent = `Erro ao preparar o gato: ${error.message}`; console.error(error); }
}, undefined, error => {status.textContent = 'Não foi possível carregar source/Cat.glb. Confira o arquivo e use npm run dev.';console.error(error);});
buttons.forEach(b => b.addEventListener('click', () => play(b.dataset.action)));
reset.addEventListener('click', () => play('idle'));
document.querySelector('#camera').addEventListener('click', restoreCamera);
document.querySelector('#color').addEventListener('input', e => {studioMaterial.color.set(e.target.value);scene.background.set(e.target.value);scene.fog.color.set(e.target.value);});
document.querySelector('#speed').addEventListener('input', e => {speed = Number(e.target.value);document.querySelector('#rate').textContent = `${speed}×`;});
window.addEventListener('keydown', e => {if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;const map={'0':'idle','1':'tail','2':'groom','3':'lie'};if(map[e.key]) play(map[e.key]);});
function resize(){camera.aspect = innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
window.addEventListener('resize',resize);resize();
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => { const delta = Math.min(clock.getDelta(), .05); animator?.update(delta * speed);groundCat?.();controls.update();renderer.render(scene,camera); });
