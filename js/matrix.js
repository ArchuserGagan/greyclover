import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Configuration
const COUNT = 20000;
const SPEED_MULT = 0.06; // Reduced to 0.06 to make particle drift extremely slow and subtle
const AUTO_SPIN = true;

// Scene Elements
let scene, camera, renderer, composer, controls, instancedMesh;
let positions = [];
const dummy = new THREE.Object3D();
const color = new THREE.Color();
const target = new THREE.Vector3();
const clock = new THREE.Clock();

// Interactive states
let mouseX = 0;
let mouseY = 0;
let targetCameraX = 0;
let targetCameraY = 0;
const parallaxStrength = 18;

// Galaxy Parameters (extracted and tuned from natural01.html)
const PARAMS = {
    scale: 120,
    gravity: 1.5,
    rotation: 1.0,
    pulse: 1.2,
    distortion: 0.5,
    galaxies: 4.0
};

function init() {
    const container = document.getElementById('matrix-canvas-container');
    if (!container) return;

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.006);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100); // Set exactly as in original natural01.html
    
    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Allow site scrolling over canvas
    controls.autoRotate = AUTO_SPIN;
    controls.autoRotateSpeed = 0.8;

    // 5. Post Processing (Bloom glow)
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.strength = 2.5;    // Keep bloom glow strong and vivid
    bloomPass.radius = 0.65;    // Soft glow spread
    bloomPass.threshold = 0.01;  // Glow as many particles as possible
    composer.addPass(bloomPass);

    // 6. Geometry & Instanced Mesh
    const geometry = new THREE.TetrahedronGeometry(0.22); // Slightly smaller particle size for cosmic dust feel
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // 7. Initial Positions Array
    positions = [];
    for (let i = 0; i < COUNT; i++) {
        positions.push(new THREE.Vector3(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150
        ));
        instancedMesh.setColorAt(i, color.setHex(0x00ff88));
    }

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);

    // Initial scroll sync
    onScroll();
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    targetCameraX = mouseX * parallaxStrength;
    targetCameraY = mouseY * parallaxStrength;
}

function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
    
    // Smooth camera push/pull back as user scrolls
    const baseZ = 100;
    const zoomOffset = scrollPercent * 30;
    camera.position.z = baseZ + zoomOffset;

    // Dynamically adjust canvas container opacity (stronger visibility)
    const container = document.getElementById('matrix-canvas-container');
    if (container) {
        let targetOpacity = 0.95;
        if (scrollPercent > 0.1 && scrollPercent <= 0.8) {
            // Drop slightly to 0.55 opacity in reading zones
            targetOpacity = 0.55 + (1 - (scrollPercent - 0.1) / 0.7) * 0.4;
            targetOpacity = Math.max(0.55, Math.min(0.95, targetOpacity));
        } else if (scrollPercent > 0.8) {
            // Rise back up for final CTA
            targetOpacity = 0.55 + ((scrollPercent - 0.8) / 0.2) * 0.20;
        }
        container.style.opacity = targetOpacity;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime() * SPEED_MULT;
    
    // Smooth camera drift based on mouse parallax
    camera.position.x += (targetCameraX - camera.position.x) * 0.04;
    camera.position.y += (targetCameraY - camera.position.y) * 0.04;
    
    controls.update();

    const scale = PARAMS.scale;
    const gravity = PARAMS.gravity;
    const rotation = PARAMS.rotation;
    const pulse = PARAMS.pulse;
    const distortion = PARAMS.distortion;
    const galaxies = PARAMS.galaxies;

    const t = time * rotation;
    const count = COUNT;

    for (let i = 0; i < COUNT; i++) {
        const p = i / Math.max(count, 1);
        
        // Golden angle spiral distribution
        const golden = 2.399963229728653;
        const arm = p * galaxies * 6.28318530718;
        const theta = i * golden + t * 0.25;
        
        const radiusBase = Math.sqrt(p) * scale;
        const waveA = Math.sin(theta * 2.0 + t * 0.8);
        const waveB = Math.cos(theta * 3.0 - t * 0.6);
        const waveC = Math.sin(arm * 2.0 + t);
        
        const radius = radiusBase * (1.0 + 0.25 * waveA + 0.15 * distortion * waveB);
        const swirl = theta + gravity * radius * 0.015 + 0.5 * waveC;
        
        // Exact original coordinates math from natural01.html
        const x = Math.cos(swirl) * radius + Math.sin(theta * 4.0 + t) * distortion * radius * 0.15;
        const y = (radiusBase - scale * 0.5) * 0.8 + 
                  Math.sin(theta * 1.5 + t * 0.7) * scale * 0.18 + 
                  waveA * distortion * scale * 0.08;
        const z = Math.sin(swirl) * radius + Math.cos(theta * 5.0 - t) * distortion * radius * 0.15;
        
        target.set(x, y, z);
        
        // Exact original energy math from natural01.html
        const energy = 0.5 + 0.5 * Math.sin(radius * 0.05 - t * pulse + waveB);
        
        // Dynamic Emerald & Teal HSL Color calculation to fit brand styling (#00FF88)
        // Hue shifts between 0.38 (Emerald Green) and 0.48 (Teal/Mint)
        const hue = 0.38 + 0.08 * Math.sin(theta * 0.15 + t * 0.1) + 0.02 * energy;
        const sat = 0.85 + 0.15 * Math.abs(Math.sin(theta * 0.5));
        const light = 0.35 + 0.45 * energy + 0.15 * Math.abs(waveA);
        
        color.setHSL(
            ((hue % 1) + 1) % 1,
            Math.min(1, sat),
            Math.min(1, light)
        );

        // Position LERP transition for fluid movement
        positions[i].lerp(target, 0.08);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, color);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;

    composer.render();
}

// Initialize and start
document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
});
