// ============================================================================
// GREEN AI DATA CENTER - EVS 3D INTERACTIVE DIORAMA
// Group 21 | Sachin Yadav, Prince Sharma, Aaryan Singh | Guide: Dr. Rakhi Akhare
// Dept. of Computer Engineering, LTCE Navi Mumbai (VEC301)
// ============================================================================

let scene, camera, renderer, controls;
let sun, hemi, ambient;
let autoRotate = true;
let roofUp = false;
let cutaway = false;
let cameraAnimating = false;
let showHotspots = false;
let currentTheme = 'day';

const clickableMeshes = [];

const animState = {
  turbineRotor: null,
  roofGroup: null,
  roofBaseY: 7.2,
  targetRoofY: 7.2,
  heatPulses: [],
  coolPulses: [],
  leds: [],
  cutGroups: []
};

// Target Camera Presets mapped to EVS Presentation Concepts (Comfortably Zoomed Out)
const targets = {
  overview: { cam: [48, 34, 48], look: [0, 3, 0], id: 'overview' },
  isometric: { cam: [54, 40, 54], look: [0, 3, 0], id: 'isometric' },
  cinematic: { cam: [36, 24, 30], look: [0, 3, 2], id: 'cinematic' },
  topdown: { cam: [0, 88, 0.01], look: [0, 0, 0], id: 'topdown' },
  aerial: { cam: [58, 48, 0], look: [0, 3, 0], id: 'aerial' },
  servers: { cam: [-5, 14, 24], look: [-9, 4, 0], id: 'servers' },
  heatex: { cam: [16, 13, 14], look: [5.5, 3.5, -1], id: 'heatex' },
  piping: { cam: [24, 18, 24], look: [13, 4.5, 1.5], id: 'piping' },
  greenhouse: { cam: [40, 20, 26], look: [26, 4.5, 5], id: 'greenhouse' },
  microgrid: { cam: [-34, 26, 36], look: [-14, 3.5, 18], id: 'microgrid' },
  wind: { cam: [-50, 32, -32], look: [-34, 14, -18], id: 'wind' },
  substation: { cam: [-38, 19, 19], look: [-26, 3.5, 4], id: 'substation' },
  smr: { cam: [-42, 17, -4], look: [-31, 3.5, -7], id: 'smr' }
};

// 3D Hotspot Anchor Positions for floating UI pins (clean text, no emojis)
const hotspots = [
  { id: 'servers', label: 'Immersion Hall', pos: [-10, 8.5, -2] },
  { id: 'heatex', label: 'Heat Exchanger', pos: [5.5, 5.0, -2.5] },
  { id: 'piping', label: 'Heat Gantry', pos: [13.5, 6.2, 1.0] },
  { id: 'greenhouse', label: 'Greenhouse', pos: [26, 8.5, 5] },
  { id: 'microgrid', label: 'Solar & BESS', pos: [-18, 4.8, 18] },
  { id: 'wind', label: 'Wind Turbine', pos: [-34, 27.5, -18] },
  { id: 'substation', label: 'Substation', pos: [-28, 5.2, 6] },
  { id: 'smr', label: 'SMR Baseload', pos: [-32, 5.2, -6] }
];

let targetCamPos = new THREE.Vector3(...targets.overview.cam);
let targetLookPos = new THREE.Vector3(...targets.overview.look);

// Explanations for presentation slides
// Subsystem data for engineering telemetry and slide presentation
const subsystemData = {
  overview: {
    title: "Eco-AI Hyperscale Campus",
    tagline: "Overview • EVS VEC301 Group 21",
    metrics: "PUE ~1.03 | WUE < 0.02 L/kWh | Net-Zero",
    desc: "Closed-loop circular AI campus harmonizing 100 kW/rack compute density with planetary boundaries.",
    specs: [
      "Liquid immersion cuts cooling energy by 90% vs legacy air",
      "60°C waste effluent transferred to district agricultural reuse",
      "24/7 on-site clean microgrid: Solar, Wind, BESS, and SMR baseload"
    ]
  },
  servers: {
    title: "Liquid Immersion Server Hall",
    tagline: "Cooling • Slide 5",
    metrics: "Density: 100 kW/rack | PUE: 1.03 | Fan Power: -90%",
    desc: "Compute blades submerged in synthetic dielectric fluid with direct die-level thermal capture.",
    specs: [
      "Eliminates noisy chassis fans and evaporative chillers",
      "Thermal capture at source reduces cooling overhead from 40% to 3%",
      "Primary coolant supply at 35°C, exiting to heat exchanger at 60°C"
    ]
  },
  heatex: {
    title: "Plate Heat Exchanger (PHE)",
    tagline: "Zero Water Loss • Slide 4 & 5",
    metrics: "WUE < 0.02 L/kWh | 0 L Evaporated | 60°C Water Out",
    desc: "Stainless steel brazed PHE decoupling primary dielectric coolant from secondary water circuit.",
    specs: [
      "Closed hydronic loop eliminates evaporative tower water waste",
      "Recovers 95%+ of compute thermal energy into circulating water",
      "Replaces millions of liters of potable water loss daily"
    ]
  },
  piping: {
    title: "Waste Heat Pipe Gantry",
    tagline: "Thermal Transport • Slide 6",
    metrics: "Supply: 60°C | Return: 35°C | Losses < 1.2%",
    desc: "Elevated structural bridge carrying thermal energy across campus in a continuous thermodynamic loop.",
    specs: [
      "Orange insulated conduit delivers 60°C supply to greenhouse",
      "Cyan conduit returns 35°C recirculated water to heat exchanger",
      "Dual continuous circuit prevents thermal pollution to atmosphere"
    ]
  },
  greenhouse: {
    title: "Agricultural Greenhouse",
    tagline: "Heat Valorization • Slide 6",
    metrics: "450 kWth Reused | Soil Temp 22–25°C | 0% Fossil Fuel",
    desc: "Year-round hydroponic crop cultivation heated by reclaimed server thermal effluent.",
    specs: [
      "Hydronic radiant coils embedded beneath crop root zones",
      "Displaces fossil gas/oil heating with zero-carbon data center heat",
      "Direct industrial symbiosis between compute and food systems"
    ]
  },
  microgrid: {
    title: "Solar PV & BESS Microgrid",
    tagline: "24/7 Matching • Slide 6",
    metrics: "Solar: 1.2 MWp | BESS: 4 MWh | Rooftop: 350 kWp",
    desc: "On-site clean generation paired with multi-container battery storage for continuous operation.",
    specs: [
      "Bifacial ground and rooftop PV arrays capture direct and albedo light",
      "4 MWh BESS buffers peak solar output for evening discharge",
      "Real-time hourly carbon-free matching for AI workloads"
    ]
  },
  wind: {
    title: "Utility Wind Generation",
    tagline: "Aerodynamic Power • Slide 6",
    metrics: "Capacity: 1.5 MW | Hub: 26m | Clean Baseload",
    desc: "Perimeter wind turbine harvesting nocturnal and seasonal wind currents.",
    specs: [
      "Counter-cyclical profile complements midday solar generation",
      "Reduces battery deep-cycling during overnight hours",
      "Feeds directly into campus medium-voltage distribution ring"
    ]
  },
  substation: {
    title: "MV/LV Substation",
    tagline: "Grid Decoupling • Slide 2",
    metrics: "415V to 11kV Step-Up | Dual Bus | Surge Isolated",
    desc: "Solid-state transformers and switchgear isolating high-density AI loads from public grid.",
    specs: [
      "Buffers rapid AI training load surges from municipal networks",
      "Synchronizes on-site microgrid with external utility feed",
      "Automatic islanding protection for campus grid resilience"
    ]
  },
  smr: {
    title: "Clean SMR Baseload",
    tagline: "Baseload Decoupling • Slide 6",
    metrics: "50 MWe | Zero Carbon | Compact Footprint",
    desc: "Dedicated Small Modular Reactor providing continuous, weather-independent baseload.",
    specs: [
      "Decouples exponential AI compute scaling from fossil peaker plants",
      "Small geographic footprint with passive safety containment",
      "Guarantees 24/7 carbon-free power at 99.999% availability"
    ]
  },
  topdown: {
    title: "Master Site Plan",
    tagline: "Macro Layout • Group 21",
    metrics: "Radius: 48m | Circular Flow | Net-Zero Site",
    desc: "Zoned circular campus topology balancing compute, heat recovery, and clean generation.",
    specs: [
      "Center compute hall minimizes thermal piping transmission run",
      "Elevated gantry directs effluent directly to agricultural zone",
      "Perimeter renewable ring delivers resilient distributed microgrid"
    ]
  }
};

// Lighting themes
const themes = {
  day: {
    bg: 0x72aee6,
    sunColor: 0xfff6e3,
    sunIntensity: 1.6,
    hemiSky: 0xd9eeff,
    hemiGround: 0x224824,
    hemiIntensity: 0.85,
    ambient: 0.45
  },
  sunset: {
    bg: 0xd97757,
    sunColor: 0xffaa44,
    sunIntensity: 1.85,
    hemiSky: 0xffd2aa,
    hemiGround: 0x2a1608,
    hemiIntensity: 0.9,
    ambient: 0.42
  },
  night: {
    bg: 0x080e1c,
    sunColor: 0x3b82f6,
    sunIntensity: 0.7,
    hemiSky: 0x0f244a,
    hemiGround: 0x051307,
    hemiIntensity: 0.45,
    ambient: 0.38
  }
};

function startDiorama() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;
  init(canvas);
  build();
  setupInteractions(canvas);
  animate();
}

function init(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(themes.day.bg);

  camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(48, 34, 48);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 8;
  controls.maxDistance = 220;
  controls.minPolarAngle = 0.08;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.enablePan = true;
  controls.screenSpacePanning = true;

  sun = new THREE.DirectionalLight(themes.day.sunColor, themes.day.sunIntensity);
  sun.position.set(55, 65, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 180;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  hemi = new THREE.HemisphereLight(themes.day.hemiSky, themes.day.hemiGround, themes.day.hemiIntensity);
  scene.add(hemi);

  ambient = new THREE.AmbientLight(0xffffff, themes.day.ambient);
  scene.add(ambient);
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.1 }, opts));
}

function registerClickable(group, subsystemId) {
  group.userData.subsystemId = subsystemId;
  clickableMeshes.push(group);
}

function build() {
  const campus = new THREE.Group();
  scene.add(campus);

  const islandRadius = 48;

  // Lawn Surface
  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(islandRadius, islandRadius - 1, 1.6, 96),
    mat(0x2f6f36, { roughness: 0.96 })
  );
  grass.position.y = 0.8;
  grass.receiveShadow = true;
  campus.add(grass);

  // Plinth Base
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(islandRadius - 1, islandRadius - 10, 8.0, 72),
    mat(0x212529, { roughness: 0.6, metalness: 0.25, flatShading: true })
  );
  plinth.position.y = -4.0;
  campus.add(plinth);

  // Roads & Walkways (strictly on lawn surface)
  const paveMat = mat(0xe5e7eb, { roughness: 0.9 });
  const roadMat = mat(0x374151, { roughness: 0.85 });

  const road1 = new THREE.Mesh(new THREE.BoxGeometry(42, 0.04, 4.4), roadMat);
  road1.position.set(0, 1.62, 12);
  campus.add(road1);

  const road2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.04, 30), roadMat);
  road2.position.set(-2, 1.62, -2);
  campus.add(road2);

  const road3 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.04, 26), roadMat);
  road3.position.set(-24, 1.62, 14);
  campus.add(road3);

  const walk1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.05, 2.6), paveMat);
  walk1.position.set(13, 1.625, 4);
  campus.add(walk1);

  const walk2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 16), paveMat);
  walk2.position.set(24, 1.625, 13);
  campus.add(walk2);

  // --------------------------------------------------------------------------
  // DATA CENTER FACILITY
  // --------------------------------------------------------------------------
  const dc = new THREE.Group();
  dc.position.set(-10, 1.6, -2);
  campus.add(dc);
  registerClickable(dc, 'servers');

  const dcPad = new THREE.Mesh(new THREE.BoxGeometry(25, 0.5, 17), mat(0x1e293b));
  dcPad.position.y = 0.25;
  dc.add(dcPad);

  const dcWalls = new THREE.Group();
  dc.add(dcWalls);

  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(24.8, 6.6, 0.45), mat(0x0f172a));
  rearWall.position.set(0, 3.55, -8.2);
  dcWalls.add(rearWall);

  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.6, 16.8), mat(0x0f172a));
  westWall.position.set(-12.2, 3.55, 0);
  dcWalls.add(westWall);

  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.6, 16.8), mat(0x0f172a));
  eastWall.position.set(12.2, 3.55, 0);
  dcWalls.add(eastWall);

  const accessFloor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 16), mat(0x64748b, { roughness: 0.7 }));
  accessFloor.position.y = 1.0;
  dc.add(accessFloor);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8e6ff,
    transparent: true,
    opacity: 0.32,
    transmission: 0.88,
    roughness: 0.08,
    metalness: 0.1
  });
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(24.2, 6.6, 0.18), glassMat);
  frontGlass.position.set(0, 3.55, 8.2);
  dc.add(frontGlass);

  for (let m = -10; m <= 10; m += 4) {
    const mull = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.6, 0.24), mat(0x0f172a));
    mull.position.set(m, 3.55, 8.22);
    dc.add(mull);
  }

  // Liftable Roof Deck
  const roof = new THREE.Group();
  roof.position.set(0, 7.2, 0);
  dc.add(roof);

  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(25.4, 0.45, 17.4), mat(0x1e293b));
  roof.add(roofSlab);

  const pvMat = mat(0x0c1e3a, { metalness: 0.95, roughness: 0.15 });
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const pvMod = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 2.4), pvMat);
      pvMod.position.set(-9.3 + c * 3.1, 0.3, -4.5 + r * 3.0);
      pvMod.rotation.x = -Math.PI / 14;
      roof.add(pvMod);
    }
  }
  animState.roofGroup = roof;
  animState.roofBaseY = 7.2;
  animState.targetRoofY = 7.2;

  // Lifting hydraulic guide posts
  for (let px of [-11.5, 11.5]) {
    for (let pz of [-7.5, 7.5]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 8, 12), mat(0x94a3b8, { metalness: 0.8 }));
      post.position.set(px, 4.0, pz);
      dc.add(post);
    }
  }

  // IMMERSION COOLING RACKS (2 Rows)
  const rackRows = [-3.2, 2.6];
  for (let rIdx = 0; rIdx < rackRows.length; rIdx++) {
    const rowZ = rackRows[rIdx];
    for (let i = 0; i < 6; i++) {
      const tankX = -9.0 + i * 3.4;
      const tank = new THREE.Group();
      tank.position.set(tankX, 1.1, rowZ);
      dc.add(tank);

      const tankBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.6), mat(0x0f172a, { metalness: 0.7 }));
      tankBody.position.y = 0.8;
      tank.add(tankBody);

      const fluid = new THREE.Mesh(
        new THREE.BoxGeometry(2.32, 0.2, 2.52),
        new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.95,
          roughness: 0.1
        })
      );
      fluid.position.y = 1.55;
      tank.add(fluid);

      for (let s = 0; s < 5; s++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 2.2), mat(0x38bdf8, { metalness: 0.9 }));
        blade.position.set(-0.8 + s * 0.4, 1.7, 0);
        tank.add(blade);
      }

      const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      led.position.set(1.0, 1.5, 1.32);
      tank.add(led);
      animState.leds.push(led);

      const cDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 10), mat(0x00e5ff));
      cDrop.position.set(-0.6, 2.1, -1.35);
      tank.add(cDrop);

      const hRiser = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.2, 10), mat(0xff6b00));
      hRiser.position.set(0.6, 2.2, -1.35);
      tank.add(hRiser);
    }
  }

  // Internal Header Manifolds
  const dcColdHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 22, 16), mat(0x00e5ff));
  dcColdHeader.rotation.z = Math.PI / 2;
  dcColdHeader.position.set(0, 3.2, -0.5);
  dc.add(dcColdHeader);

  const dcHotHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 22, 16), mat(0xff6b00));
  dcHotHeader.rotation.z = Math.PI / 2;
  dcHotHeader.position.set(0, 3.7, -0.5);
  dc.add(dcHotHeader);

  // Cable Ladders
  for (let z of [-3.2, 2.6]) {
    const ladder = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 0.6), mat(0x475569));
    ladder.position.set(0, 5.8, z);
    dc.add(ladder);
  }

  // --------------------------------------------------------------------------
  // PLATE HEAT EXCHANGER (PHE) SKID
  // --------------------------------------------------------------------------
  const phe = new THREE.Group();
  phe.position.set(5.5, 1.6, -2.5);
  campus.add(phe);
  registerClickable(phe, 'heatex');

  const phePad = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 3.6), mat(0x334155));
  phePad.position.y = 0.175;
  phe.add(phePad);

  const pheBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 2.2), mat(0xe2e8f0, { metalness: 0.85, roughness: 0.2 }));
  pheBody.position.set(0, 1.55, 0);
  phe.add(pheBody);

  const plateF = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.5, 0.1), mat(0x1d4ed8));
  plateF.position.set(0, 1.55, 1.15);
  phe.add(plateF);

  const plateB = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.5, 0.1), mat(0x1d4ed8));
  plateB.position.set(0, 1.55, -1.15);
  phe.add(plateB);

  for (let pz of [-0.9, 0.9]) {
    const pump = new THREE.Group();
    pump.position.set(-1.2, 0.35, pz);
    phe.add(pump);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12), mat(0x0284c7));
    motor.rotation.z = Math.PI / 2;
    pump.add(motor);

    const volute = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 14), mat(0x0369a1));
    volute.position.x = 0.45;
    pump.add(volute);
  }

  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.8), mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.6 }));
  screen.position.set(0.96, 2.0, 0);
  phe.add(screen);

  // --------------------------------------------------------------------------
  // CONTINUOUS CONNECTED PIPE CIRCUITS
  // --------------------------------------------------------------------------
  const primHotPts = [
    new THREE.Vector3(1.5, 5.3, -2.5),
    new THREE.Vector3(2.4, 5.3, -2.5),
    new THREE.Vector3(3.6, 5.3, -2.5),
    new THREE.Vector3(4.5, 3.2, -2.5)
  ];
  const primHotCurve = new THREE.CatmullRomCurve3(primHotPts);
  const primHotTube = new THREE.Mesh(
    new THREE.TubeGeometry(primHotCurve, 32, 0.16, 12, false),
    mat(0xff6b00, { emissive: 0xff6b00, emissiveIntensity: 0.85 })
  );
  campus.add(primHotTube);

  const primColdPts = [
    new THREE.Vector3(4.5, 2.6, -2.8),
    new THREE.Vector3(3.6, 4.8, -2.8),
    new THREE.Vector3(2.4, 4.8, -2.5),
    new THREE.Vector3(1.5, 4.8, -2.5)
  ];
  const primColdCurve = new THREE.CatmullRomCurve3(primColdPts);
  const primColdTube = new THREE.Mesh(
    new THREE.TubeGeometry(primColdCurve, 32, 0.15, 12, false),
    mat(0x00e5ff, { emissive: 0x00e5ff, emissiveIntensity: 0.85 })
  );
  campus.add(primColdTube);

  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 1.2), mat(0x475569));
  sleeve.position.set(2.2, 5.05, -2.5);
  campus.add(sleeve);

  const secHotPts = [
    new THREE.Vector3(6.5, 2.8, -2.2),
    new THREE.Vector3(7.6, 4.8, -1.5),
    new THREE.Vector3(10.0, 5.2, -0.5),
    new THREE.Vector3(14.0, 5.2, 1.5),
    new THREE.Vector3(17.5, 4.6, 3.2),
    new THREE.Vector3(20.0, 3.4, 4.5)
  ];
  const secHotCurve = new THREE.CatmullRomCurve3(secHotPts);
  const secHotTube = new THREE.Mesh(
    new THREE.TubeGeometry(secHotCurve, 54, 0.18, 14, false),
    mat(0xff7700, { emissive: 0xff6600, emissiveIntensity: 1.1 })
  );
  campus.add(secHotTube);
  registerClickable(secHotTube, 'piping');

  const secCoolPts = [
    new THREE.Vector3(20.0, 2.9, 4.5),
    new THREE.Vector3(17.5, 4.1, 3.2),
    new THREE.Vector3(14.0, 4.7, 1.5),
    new THREE.Vector3(10.0, 4.7, -0.5),
    new THREE.Vector3(7.6, 4.3, -1.5),
    new THREE.Vector3(6.5, 2.2, -2.2)
  ];
  const secCoolCurve = new THREE.CatmullRomCurve3(secCoolPts);
  const secCoolTube = new THREE.Mesh(
    new THREE.TubeGeometry(secCoolCurve, 54, 0.16, 14, false),
    mat(0x06b6d4, { emissive: 0x06b6d4, emissiveIntensity: 0.9 })
  );
  campus.add(secCoolTube);

  // Pipe Gantry Structural Trestles
  const gantryPosts = [
    { x: 8.5, z: -1.0 },
    { x: 12.0, z: 0.5 },
    { x: 16.0, z: 2.4 }
  ];
  for (let pt of gantryPosts) {
    const post = new THREE.Group();
    post.position.set(pt.x, 1.6, pt.z);
    campus.add(post);

    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.12), mat(0x475569));
    leg1.position.set(-0.35, 1.8, 0);
    post.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.12), mat(0x475569));
    leg2.position.set(0.35, 1.8, 0);
    post.add(leg2);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.25), mat(0x334155));
    beam.position.set(0, 3.5, 0);
    post.add(beam);
  }

  // --------------------------------------------------------------------------
  // AGRICULTURAL RESEARCH GREENHOUSE
  // --------------------------------------------------------------------------
  const gh = new THREE.Group();
  gh.position.set(26, 1.6, 5);
  campus.add(gh);
  registerClickable(gh, 'greenhouse');

  const ghPlinth = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.4, 16.4), mat(0x334155));
  ghPlinth.position.y = 0.2;
  gh.add(ghPlinth);

  const ghFrame = new THREE.Group();
  gh.add(ghFrame);

  for (let gx of [-6.8, 0, 6.8]) {
    for (let gz of [-7.8, -2.6, 2.6, 7.8]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.4, 0.14), mat(0xf8fafc));
      col.position.set(gx, 2.4, gz);
      ghFrame.add(col);
    }
  }

  for (let gz of [-7.8, 7.8]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.12, 0.14), mat(0xf8fafc));
    beam.position.set(0, 4.4, gz);
    ghFrame.add(beam);
  }
  for (let gx of [-6.8, 0, 6.8]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 15.6), mat(0xf8fafc));
    beam.position.set(gx, 4.4, 0);
    ghFrame.add(beam);
  }

  for (let spanX of [-3.4, 3.4]) {
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 15.6), mat(0xf8fafc));
    r1.rotation.z = Math.PI / 6;
    r1.position.set(spanX - 0.9, 5.2, 0);
    ghFrame.add(r1);

    const r2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 15.6), mat(0xf8fafc));
    r2.rotation.z = -Math.PI / 6;
    r2.position.set(spanX + 0.9, 5.2, 0);
    ghFrame.add(r2);
  }

  const ghGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.35,
    transmission: 0.92,
    roughness: 0.06
  });

  const ghGlassSide = new THREE.Mesh(new THREE.BoxGeometry(13.7, 4.2, 15.7), ghGlassMat);
  ghGlassSide.position.y = 2.4;
  gh.add(ghGlassSide);

  const cropGreen = mat(0x16a34a, { roughness: 0.8 });
  const tableMat = mat(0x475569);

  for (let col = -1; col <= 1; col += 2) {
    for (let row = -2; row <= 2; row += 2) {
      const tableX = col * 3.6;
      const tableZ = row * 2.8;

      const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.2), tableMat);
      table.position.set(tableX, 0.8, tableZ);
      gh.add(table);

      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 2.1), cropGreen);
      bed.position.set(tableX, 1.3, tableZ);
      gh.add(bed);

      for (let cp = 0; cp < 6; cp++) {
        const plant = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 6, 6),
          cp % 2 === 0 ? mat(0x22c55e) : mat(0x15803d)
        );
        plant.position.set(
          tableX - 0.6 + (cp % 3) * 0.6,
          1.55,
          tableZ - 0.5 + Math.floor(cp / 3) * 1.0
        );
        gh.add(plant);
      }

      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.04, 8, 16),
        mat(0xff6b00, { emissive: 0xff6b00, emissiveIntensity: 0.9 })
      );
      coil.rotation.x = Math.PI / 2;
      coil.position.set(tableX, 0.45, tableZ);
      gh.add(coil);
    }
  }

  const growLightMat = new THREE.MeshStandardMaterial({
    color: 0xd946ef,
    emissive: 0xd946ef,
    emissiveIntensity: 1.2
  });
  for (let col = -1; col <= 1; col += 2) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 14), growLightMat);
    strip.position.set(col * 3.6, 4.2, 0);
    gh.add(strip);
  }

  const ghManifold = new THREE.Group();
  ghManifold.position.set(-6.8, 1.6, -0.5);
  gh.add(ghManifold);

  const ghInlet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.2, 12), mat(0xff7700));
  ghInlet.position.set(0, 1.8, 0);
  ghManifold.add(ghInlet);

  const ghOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.2, 12), mat(0x06b6d4));
  ghOutlet.position.set(0, 1.3, 0);
  ghManifold.add(ghOutlet);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 0.1), mat(0x0f172a));
  sign.position.set(0, 4.9, 8.1);
  gh.add(sign);

  // --------------------------------------------------------------------------
  // CLEAN MICROGRID COMPONENTS
  // --------------------------------------------------------------------------
  // BESS
  const bess = new THREE.Group();
  bess.position.set(-20, 1.6, 18);
  campus.add(bess);
  registerClickable(bess, 'microgrid');

  for (let b = 0; b < 3; b++) {
    const pack = new THREE.Group();
    pack.position.set(b * 3.8, 0, 0);
    bess.add(pack);

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 1.8), mat(0xf8fafc, { metalness: 0.6 }));
    body.position.y = 1.3;
    pack.add(body);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.04), mat(0x1e293b));
    grille.position.set(-1.0, 1.3, 0.92);
    pack.add(grille);

    const soc = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.0 })
    );
    soc.position.set(0, 2.2, 0.92);
    pack.add(soc);
  }

  // GROUND SOLAR PV
  const pvFarm = new THREE.Group();
  pvFarm.position.set(-4, 1.6, 22);
  campus.add(pvFarm);
  registerClickable(pvFarm, 'microgrid');

  for (let row = 0; row < 3; row++) {
    const table = new THREE.Group();
    table.position.set(0, 0, row * 3.2);
    pvFarm.add(table);

    for (let legX of [-6, -2, 2, 6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), mat(0x94a3b8));
      leg.position.set(legX, 0.6, 0);
      table.add(leg);
    }

    for (let c = 0; c < 8; c++) {
      const mod = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 2.4), pvMat);
      mod.position.set(-5.6 + c * 1.6, 1.1, 0);
      mod.rotation.x = -Math.PI / 12;
      table.add(mod);
    }
  }

  // WIND TURBINE
  const wind = new THREE.Group();
  wind.position.set(-34, 1.6, -18);
  campus.add(wind);
  registerClickable(wind, 'wind');

  const windBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.6, 24), mat(0x475569));
  windBase.position.y = 0.3;
  wind.add(windBase);

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.85, 26, 20), mat(0xf1f5f9, { metalness: 0.5 }));
  tower.position.y = 13.3;
  wind.add(tower);

  const nacelle = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 2.4), mat(0xffffff));
  nacelle.position.y = 26.5;
  wind.add(nacelle);

  const rotor = new THREE.Group();
  rotor.position.set(0, 26.5, 1.25);
  wind.add(rotor);

  const hub = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 16), mat(0xf8fafc));
  hub.rotation.x = Math.PI / 2;
  rotor.add(hub);

  for (let b = 0; b < 3; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 9.6, 0.08), mat(0xffffff));
    const ang = (b / 3) * Math.PI * 2;
    blade.position.set(Math.sin(ang) * 4.8, Math.cos(ang) * 4.8, 0);
    blade.rotation.z = -ang;
    rotor.add(blade);
  }
  animState.turbineRotor = rotor;

  // SMR BASELOAD
  const smr = new THREE.Group();
  smr.position.set(-32, 1.6, -6);
  campus.add(smr);
  registerClickable(smr, 'smr');

  const smrBase = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 0.5, 32), mat(0x334155));
  smrBase.position.y = 0.25;
  smr.add(smrBase);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0x94a3b8, { metalness: 0.7, roughness: 0.2 })
  );
  dome.position.y = 0.5;
  smr.add(dome);

  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 4.0, 16), mat(0x64748b));
  stack.position.set(2.0, 2.0, -1.2);
  smr.add(stack);

  // SUBSTATION
  const sub = new THREE.Group();
  sub.position.set(-28, 1.6, 6);
  campus.add(sub);
  registerClickable(sub, 'substation');

  const subPad = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 6.4), mat(0x475569));
  subPad.position.y = 0.175;
  sub.add(subPad);

  const trans = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 2.8), mat(0x64748b, { metalness: 0.6 }));
  trans.position.set(0, 1.35, 0);
  sub.add(trans);

  for (let f = -1.2; f <= 1.2; f += 0.4) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 3.2), mat(0x475569));
    fin.position.set(1.68, 1.35, f);
    sub.add(fin);
  }

  for (let b = -0.8; b <= 0.8; b += 0.8) {
    const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 10), mat(0xd97706));
    bush.position.set(b, 3.1, 0);
    sub.add(bush);
  }

  const powerConduit = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 0.4), mat(0xfbbf24));
  powerConduit.position.set(-18, 1.64, 4);
  campus.add(powerConduit);

  // --------------------------------------------------------------------------
  // REALISTIC LANDSCAPE GROVES (NO FLOATING TREES!)
  // --------------------------------------------------------------------------
  const treePositions = [
    [-38, -10], [-38, -26], [-30, -24], [-26, -26], [-36, 0],
    [36, -4], [38, 2], [36, 12], [38, 18], [28, 18], [34, 24],
    [-12, 34], [-4, 36], [6, 36], [16, 32], [-22, 30],
    [-18, -16], [-10, -18], [-2, -18], [8, -16], [16, -14], [22, -12],
    [10, 16], [12, 22], [14, 28]
  ];

  for (let i = 0; i < treePositions.length; i++) {
    const [tx, tz] = treePositions[i];
    const tree = new THREE.Group();
    tree.position.set(tx, 1.55, tz);
    campus.add(tree);

    const scale = 0.85 + (i % 5) * 0.12;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.8, 8), mat(0x5c4033));
    trunk.position.y = 0.9;
    tree.add(trunk);

    const folColor = (i % 3 === 0) ? 0x166534 : ((i % 3 === 1) ? 0x15803d : 0x14532d);
    const folMat = mat(folColor, { roughness: 0.95 });

    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.0, 8), folMat);
    c1.position.y = 2.4;
    tree.add(c1);

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 8), folMat);
    c2.position.y = 3.5;
    tree.add(c2);

    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 8), folMat);
    c3.position.y = 4.4;
    tree.add(c3);

    tree.scale.set(scale, scale, scale);
  }

  for (let bx of [6, 10, 14, 18, 22]) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), mat(0x22c55e));
    bush.position.set(bx, 1.8, 6.2);
    campus.add(bush);
  }

  // --------------------------------------------------------------------------
  // ANIMATED THERMODYNAMIC FLOW PULSES
  // --------------------------------------------------------------------------
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff7700 })
    );
    campus.add(p);
    animState.heatPulses.push({ mesh: p, curve: secHotCurve, t: i / 12, speed: 0.009 });
  }

  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    campus.add(p);
    animState.coolPulses.push({ mesh: p, curve: secCoolCurve, t: i / 12, speed: 0.009 });
  }

  for (let i = 0; i < 6; i++) {
    const pHot = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5500 })
    );
    campus.add(pHot);
    animState.heatPulses.push({ mesh: pHot, curve: primHotCurve, t: i / 6, speed: 0.016 });

    const pCold = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    campus.add(pCold);
    animState.coolPulses.push({ mesh: pCold, curve: primColdCurve, t: i / 6, speed: 0.016 });
  }
}

// ----------------------------------------------------------------------------
// INTERACTION & RAYCASTING (Clicking 3D Models in Scene)
// ----------------------------------------------------------------------------
function setupInteractions(canvas) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let downPos = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    downPos = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('click', (e) => {
    // Prevent click trigger if user was dragging/orbiting the camera
    const dx = Math.abs(e.clientX - downPos.x);
    const dy = Math.abs(e.clientY - downPos.y);
    if (dx > 5 || dy > 5) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickableMeshes, true);
    if (hits.length > 0) {
      let cur = hits[0].object;
      while (cur && !cur.userData.subsystemId) {
        cur = cur.parent;
      }
      if (cur && cur.userData.subsystemId) {
        window.focusComponent(cur.userData.subsystemId);
      }
    }
  });
}

// ----------------------------------------------------------------------------
// ANIMATION LOOP
// ----------------------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  if (autoRotate && !cameraAnimating) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
  } else {
    controls.autoRotate = false;
  }
  controls.update();

  if (animState.turbineRotor) {
    animState.turbineRotor.rotation.z -= 0.038;
  }

  const now = Date.now() * 0.005;
  if (animState.leds) {
    animState.leds.forEach((led, idx) => {
      led.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(now + idx));
    });
  }

  if (animState.heatPulses) {
    animState.heatPulses.forEach(p => {
      p.t = (p.t + p.speed) % 1;
      p.mesh.position.copy(p.curve.getPoint(p.t));
    });
  }
  if (animState.coolPulses) {
    animState.coolPulses.forEach(p => {
      p.t = (p.t + p.speed) % 1;
      p.mesh.position.copy(p.curve.getPoint(p.t));
    });
  }

  if (cameraAnimating) {
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookPos, 0.08);
    if (camera.position.distanceTo(targetCamPos) < 0.15 && controls.target.distanceTo(targetLookPos) < 0.15) {
      cameraAnimating = false;
    }
  }

  if (animState.roofGroup) {
    animState.roofGroup.position.y = THREE.MathUtils.lerp(
      animState.roofGroup.position.y,
      animState.targetRoofY,
      0.1
    );
  }

  // Update Screen-Projected 3D Floating Hotspots
  if (window.updateHotspotScreenPositions && showHotspots && camera) {
    const list = hotspots.map(h => {
      const v = new THREE.Vector3(...h.pos);
      v.project(camera);
      const visible = v.z < 1.0;
      const x = (v.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
      return { id: h.id, label: h.label, icon: h.icon, x, y, visible };
    });
    window.updateHotspotScreenPositions(list);
  }

  renderer.render(scene, camera);
}

// ----------------------------------------------------------------------------
// EXPOSED API METHODS
// ----------------------------------------------------------------------------

window.focusComponent = (key) => {
  if (!targets[key]) return;
  autoRotate = false;
  cameraAnimating = true;
  targetCamPos.set(targets[key].cam[0], targets[key].cam[1], targets[key].cam[2]);
  targetLookPos.set(targets[key].look[0], targets[key].look[1], targets[key].look[2]);

  if (window.onViewChanged) window.onViewChanged(key);

  if (window.showSubsystemInfo && subsystemData[key]) {
    window.showSubsystemInfo(subsystemData[key], key);
  }
};

window.resetView = () => {
  autoRotate = true;
  cameraAnimating = true;
  targetCamPos.set(targets.overview.cam[0], targets.overview.cam[1], targets.overview.cam[2]);
  targetLookPos.set(targets.overview.look[0], targets.overview.look[1], targets.overview.look[2]);
  if (window.onViewChanged) window.onViewChanged('overview');
  if (window.showSubsystemInfo) {
    window.showSubsystemInfo(subsystemData.overview, 'overview');
  }
};

window.zoomIn = () => {
  camera.fov = Math.max(24, camera.fov - 4);
  camera.updateProjectionMatrix();
};

window.zoomOut = () => {
  camera.fov = Math.min(65, camera.fov + 4);
  camera.updateProjectionMatrix();
};

window.toggleAutoRotate = () => {
  autoRotate = !autoRotate;
  cameraAnimating = false;
  return autoRotate;
};

window.toggleRoof = () => {
  if (!animState.roofGroup) return false;
  roofUp = !roofUp;
  if (roofUp) {
    animState.targetRoofY = animState.roofBaseY + 10;
  } else {
    animState.targetRoofY = animState.roofBaseY;
  }
  return roofUp;
};

window.cutaway = () => {
  cutaway = !cutaway;
  if (cutaway) {
    roofUp = true;
    animState.targetRoofY = animState.roofBaseY + 10;
  } else {
    roofUp = false;
    animState.targetRoofY = animState.roofBaseY;
  }
  return cutaway;
};

window.toggleHotspots = (enabled) => {
  if (enabled !== undefined) showHotspots = enabled;
  else showHotspots = !showHotspots;
  return showHotspots;
};

window.setTheme = (themeName) => {
  if (!themes[themeName] || !scene) return currentTheme;
  currentTheme = themeName;
  const t = themes[themeName];
  scene.background.setHex(t.bg);
  if (sun) {
    sun.color.setHex(t.sunColor);
    sun.intensity = t.sunIntensity;
  }
  if (hemi) {
    hemi.color.setHex(t.hemiSky);
    hemi.groundColor.setHex(t.hemiGround);
    hemi.intensity = t.hemiIntensity;
  }
  if (ambient) {
    ambient.intensity = t.ambient;
  }
  return currentTheme;
};

window.addEventListener('resize', () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startDiorama);
} else {
  startDiorama();
}
