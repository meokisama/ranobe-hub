"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

export interface StageBook {
  id: string;
  /** Same-origin texture URL (see `coverTextureUrl`). */
  texture: string;
}

export interface StageControls {
  /** Rotate the ring by one book. */
  step: (direction: 1 | -1) => void;
}

interface HeroStageProps {
  books: StageBook[];
  controlsRef: RefObject<StageControls | null>;
  /** Index of the book now closest to the viewer. */
  onFront: (index: number) => void;
  /** A book was clicked (not dragged). */
  onSelect: (index: number) => void;
  /** First frame with something worth showing has been drawn. */
  onReady: () => void;
  /** Hold the fly-in until this turns true (the splash has lifted). */
  play: boolean;
}

const PAPER = "#f3eee4";
const SUMI = "#17130f";
const SHU = "#d9481c";
const AI = "#223457";

// Bunko proportions, in world units.
const BOOK_W = 1.15;
const BOOK_H = 1.63;
const BOOK_D = 0.15;
const RADIUS = 2.3;
const FOV = 30;
const CAMERA_Z = 11;

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Suminagashi: ink floated on water and pulled into rings, the marbling of old endpapers.
// A domain-warped noise field is sliced into contour bands; each contour is one ink line.
const BACKDROP_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uSide;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uShu;
  uniform vec3 uAi;
  varying vec2 vUv;

  // Sine-free hash (Dave Hoskins): fract(sin(x) * big) falls apart on GPUs with a coarse sin().
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = mat2(1.6, 1.2, -1.2, 1.6) * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.035;

    vec2 q = vec2(fbm(p * 1.2 + vec2(0.0, t)), fbm(p * 1.2 + vec2(5.2, 1.3 - t * 0.8)));
    vec2 r = vec2(fbm(p * 1.0 + 2.4 * q + vec2(1.7, 9.2) + t * 0.5), fbm(p * 1.0 + 2.4 * q + vec2(8.3, 2.8) - t * 0.4));

    float md = length(p - m);
    float field = fbm(p * 0.8 + 2.2 * r) + 0.1 * exp(-md * md * 5.0);

    float bands = field * 22.0;
    float id = floor(bands + 0.5);
    float dist = abs(bands - id);
    float aa = fwidth(bands) * 1.2 + 0.001;
    float line = 1.0 - smoothstep(0.04, 0.04 + aa, dist);

    // Every fifth contour is drawn in vermilion, another in indigo; the rest in diluted sumi.
    float slot = mod(id, 5.0);
    vec3 lineColor = uInk;
    float strength = 0.2;
    if (slot < 0.5) {
      lineColor = uShu;
      strength = 0.62;
    } else if (slot > 2.5 && slot < 3.5) {
      lineColor = uAi;
      strength = 0.3;
    }

    // Stronger where the books float, quiet behind the headline, gone before the fold.
    // Wide: the ring sits on the right. Narrow: it sits below the copy, and the ink runs lighter.
    float beside = smoothstep(-0.45, 0.35, p.x / aspect * 2.0);
    float below = 1.0 - smoothstep(0.3, 0.72, vUv.y);
    float side = mix(below * 0.7, beside, uSide);
    float mask = (0.22 + 0.78 * side) * smoothstep(0.02, 0.3, vUv.y);

    // Faint wash inside some bands, like diluted ink pooling.
    float wash = step(0.8, hash(vec2(floor(bands), 3.0))) * 0.035 * mask;

    vec3 col = uPaper;
    col = mix(col, uAi, wash);
    col = mix(col, lineColor, line * strength * mask);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const BOOK_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Hand-rolled lighting so covers keep their printed colours: a gentle diffuse term,
// a lamination sheen that slides across as the book turns, and a fade into the paper
// for books at the back of the ring.
const BOOK_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uUseMap;
  uniform float uLoaded;
  uniform vec3 uColor;
  uniform float uPages;
  uniform float uPagesAxis;
  uniform float uSheen;
  uniform float uFade;
  uniform vec3 uPaper;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 col = uColor;

    if (uUseMap > 0.5) {
      col = mix(uColor, texture2D(uMap, vUv).rgb, uLoaded);
      // Hinge shadow next to the spine (books bind on the right).
      col *= 1.0 - 0.22 * smoothstep(0.955, 1.0, vUv.x);
    }

    if (uPages > 0.5) {
      float coord = mix(vUv.x, vUv.y, uPagesAxis);
      float leaf = 0.5 + 0.5 * sin(coord * 180.0);
      col = mix(vec3(0.78, 0.74, 0.66), vec3(0.96, 0.94, 0.89), leaf);
    }

    vec3 light = normalize(vec3(-0.5, 0.65, 0.8));
    float diffuse = max(dot(n, light), 0.0);
    col *= 0.76 + 0.3 * diffuse;

    vec3 halfway = normalize(light + v);
    float spec = pow(max(dot(n, halfway), 0.0), 48.0);
    col += uSheen * spec * 0.3;

    col = mix(col, uPaper, clamp(uFade, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

interface BookEntry {
  mesh: THREE.Mesh;
  fade: { value: number };
  loaded: { value: number };
  loadedTarget: number;
  hover: number;
  materials: THREE.ShaderMaterial[];
  texture: THREE.Texture | null;
}

function averageColor(image: unknown): THREE.Color | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image as CanvasImageSource, 0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
    }
    const count = data.length / 4;
    return new THREE.Color().setRGB(r / count / 255, g / count / 255, b / count / 255, THREE.SRGBColorSpace);
  } catch {
    return null;
  }
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function HeroStage({ books, controlsRef, onFront, onSelect, onReady, play }: HeroStageProps) {
  const mount = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onFront, onSelect, onReady });
  const playing = useRef(play);

  useEffect(() => {
    callbacks.current = { onFront, onSelect, onReady };
    playing.current = play;
  }, [onFront, onSelect, onReady, play]);

  useEffect(() => {
    const container = mount.current;
    if (!container || books.length === 0) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      // No WebGL: the static cover fan underneath stays visible.
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = renderer.domElement;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color(PAPER), 1);
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "pan-y";
    canvas.style.cursor = "grab";
    container.appendChild(canvas);

    const paper = new THREE.Color(PAPER);

    // ---- Backdrop ----
    const backdropScene = new THREE.Scene();
    const backdropCamera = new THREE.Camera();
    const backdropMaterial = new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERT,
      fragmentShader: BACKDROP_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.7, 0.5) },
        uSide: { value: 1 },
        uPaper: { value: paper },
        uInk: { value: new THREE.Color(SUMI) },
        uShu: { value: new THREE.Color(SHU) },
        uAi: { value: new THREE.Color(AI) },
      },
    });
    const backdropGeometry = new THREE.PlaneGeometry(2, 2);
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.frustumCulled = false;
    backdropScene.add(backdrop);

    // ---- Books ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.set(0, 0, CAMERA_Z);

    const rig = new THREE.Group();
    const ring = new THREE.Group();
    ring.rotation.set(0.2, 0, -0.05);
    rig.add(ring);
    scene.add(rig);

    const geometry = new THREE.BoxGeometry(BOOK_W, BOOK_H, BOOK_D);
    const loader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const placeholder = new THREE.Color("#d8cfbf");

    const makeMaterial = (
      shared: { fade: { value: number }; loaded: { value: number } },
      options: { color: THREE.Color; useMap?: boolean; pages?: boolean; pagesAxis?: number; sheen?: number },
    ) =>
      new THREE.ShaderMaterial({
        vertexShader: BOOK_VERT,
        fragmentShader: BOOK_FRAG,
        uniforms: {
          uMap: { value: null },
          uUseMap: { value: options.useMap ? 1 : 0 },
          uLoaded: shared.loaded,
          uColor: { value: options.color },
          uPages: { value: options.pages ? 1 : 0 },
          uPagesAxis: { value: options.pagesAxis ?? 0 },
          uSheen: { value: options.sheen ?? 0 },
          uFade: shared.fade,
          uPaper: { value: paper },
        },
      });

    let disposed = false;
    let ready = false;
    const markReady = () => {
      if (ready || disposed) return;
      ready = true;
      callbacks.current.onReady();
    };

    const count = books.length;
    const entries: BookEntry[] = books.map((book) => {
      const shared = { fade: { value: 1 }, loaded: { value: 0 } };
      const spineColor = placeholder.clone();
      const backColor = placeholder.clone();
      const cover = makeMaterial(shared, { color: placeholder.clone(), useMap: true, sheen: 1 });
      const spine = makeMaterial(shared, { color: spineColor, sheen: 0.5 });
      const back = makeMaterial(shared, { color: backColor, sheen: 0.6 });
      const foreEdge = makeMaterial(shared, { color: placeholder, pages: true, pagesAxis: 0 });
      const topEdge = makeMaterial(shared, { color: placeholder, pages: true, pagesAxis: 1 });
      // BoxGeometry face order: +x, -x, +y, -y, +z, -z. Spine on the right, as Japanese books bind.
      const mesh = new THREE.Mesh(geometry, [spine, foreEdge, topEdge, topEdge, cover, back]);
      ring.add(mesh);

      const entry: BookEntry = {
        mesh,
        fade: shared.fade,
        loaded: shared.loaded,
        loadedTarget: 0,
        hover: 0,
        materials: [cover, spine, back, foreEdge, topEdge],
        texture: null,
      };

      loader.load(
        book.texture,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAnisotropy;
          entry.texture = texture;
          cover.uniforms.uMap!.value = texture;
          entry.loadedTarget = 1;
          const average = averageColor(texture.image);
          if (average) {
            spineColor.copy(average).lerp(new THREE.Color(SUMI), 0.12);
            backColor.copy(average).lerp(paper, 0.45);
          }
          markReady();
        },
        undefined,
        () => {
          // Leave the placeholder slab; the ring still reads as books.
        },
      );

      return entry;
    });

    // Don't hold the intro hostage to a slow image.
    const readyTimer = window.setTimeout(markReady, 1600);

    // ---- Layout ----
    let wide = true;
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
      const visibleW = visibleH * aspect;
      const span = 2 * RADIUS + BOOK_W * 1.3;
      wide = width >= 1024;
      if (wide) {
        const scale = Math.min(1.2, (visibleW * 0.64) / span, (visibleH * 0.33) / BOOK_H);
        rig.scale.setScalar(scale);
        rig.position.set(visibleW / 2 - (span * scale) / 2 + 0.25 * scale, -0.1, 0);
      } else {
        const scale = Math.min(0.9, (visibleW * 1.5) / span, (visibleH * 0.2) / BOOK_H);
        rig.scale.setScalar(scale);
        rig.position.set(0, -visibleH * 0.14, 0);
      }
      backdropMaterial.uniforms.uRes!.value.set(width, height);
      backdropMaterial.uniforms.uSide!.value = wide ? 1 : 0;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // ---- Interaction ----
    const step = (Math.PI * 2) / count;
    let rotation = 0;
    let velocity = 0;
    let snapTarget: number | null = null;
    const autoSpeed = reduceMotion ? 0 : 0.11;

    let dragging = false;
    let pointerId = -1;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastMoveAt = 0;
    let travelled = 0;
    let hovered = -1;
    let front = -1;

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const meshes = entries.map((e) => e.mesh);
    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 };

    const pick = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      return hit ? meshes.indexOf(hit.object as THREE.Mesh) : -1;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      pointerId = event.pointerId;
      downX = lastX = event.clientX;
      downY = event.clientY;
      lastMoveAt = performance.now();
      travelled = 0;
      snapTarget = null;
      canvas.style.cursor = "grabbing";
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {}
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragging && event.pointerId === pointerId) {
        const now = performance.now();
        const dx = event.clientX - lastX;
        const elapsed = Math.max(1, now - lastMoveAt) / 1000;
        const delta = dx * 0.0055;
        rotation += delta;
        velocity = THREE.MathUtils.clamp(THREE.MathUtils.lerp(velocity, delta / elapsed, 0.5), -5, 5);
        travelled = Math.max(travelled, Math.hypot(event.clientX - downX, event.clientY - downY));
        lastX = event.clientX;
        lastMoveAt = now;
        return;
      }
      if (event.pointerType === "mouse") {
        hovered = pick(event.clientX, event.clientY);
        canvas.style.cursor = hovered >= 0 ? "pointer" : "grab";
      }
    };

    const endDrag = (event: PointerEvent, cancelled: boolean) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {}
      // A drag that stopped before release shouldn't fling.
      if (performance.now() - lastMoveAt > 90) velocity = 0;
      if (!cancelled && travelled < 7) {
        const index = pick(event.clientX, event.clientY);
        if (index >= 0) callbacks.current.onSelect(index);
      }
    };
    const onPointerUp = (event: PointerEvent) => endDrag(event, false);
    const onPointerCancel = (event: PointerEvent) => endDrag(event, true);
    const onPointerLeave = () => {
      hovered = -1;
    };

    const onWindowPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (event.clientX - rect.left) / Math.max(1, rect.width);
      mouse.ty = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });

    controlsRef.current = {
      step: (direction) => {
        const base = snapTarget ?? rotation;
        // Snap to the nearest resting angle, then move one book over.
        snapTarget = (Math.round(base / step) - direction) * step;
        velocity = 0;
      },
    };

    // ---- Loop ----
    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    intersection.observe(container);

    const clock = new THREE.Clock();
    let time = 0;
    let intro = reduceMotion ? 10 : 0;

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      time += dt;
      if (ready && playing.current) intro += dt;

      if (!dragging) {
        if (snapTarget !== null) {
          rotation += (snapTarget - rotation) * Math.min(1, dt * 6);
          if (Math.abs(snapTarget - rotation) < 0.002) {
            rotation = snapTarget;
            snapTarget = null;
          }
        } else {
          velocity += (autoSpeed - velocity) * Math.min(1, dt * 1.6);
          rotation += velocity * dt;
        }
      }

      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);
      if (!reduceMotion) {
        rig.rotation.y += ((mouse.x - 0.5) * 0.22 - rig.rotation.y) * Math.min(1, dt * 2.5);
        rig.rotation.x += ((0.5 - mouse.y) * 0.1 - rig.rotation.x) * Math.min(1, dt * 2.5);
      }

      let best = -1;
      let bestCos = -2;
      for (let i = 0; i < count; i++) {
        const entry = entries[i]!;
        const angle = i * step + rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const arrive = 1 - Math.pow(1 - smoothstep(0, 1, (intro - i * 0.08) / 1.2), 3);
        const facing = Math.max(cos, 0);

        entry.hover += ((hovered === i ? 1 : 0) - entry.hover) * Math.min(1, dt * 9);
        entry.loaded.value += (entry.loadedTarget - entry.loaded.value) * Math.min(1, dt * 4);

        const mesh = entry.mesh;
        mesh.position.set(
          sin * RADIUS,
          Math.sin(time * 0.7 + i * 1.9) * (reduceMotion ? 0 : 0.05) + entry.hover * 0.1 - (1 - arrive) * 3.2,
          cos * RADIUS,
        );
        mesh.rotation.set(Math.sin(time * 0.5 + i) * (reduceMotion ? 0 : 0.025), sin * 0.62 + (1 - arrive) * 1.5, sin * -0.035);
        mesh.scale.setScalar((0.88 + 0.24 * facing * facing) * (1 + entry.hover * 0.045));

        const depthFade = smoothstep(0.12, 1, (1 - cos) / 2) * 0.72;
        entry.fade.value = depthFade + (1 - depthFade) * (1 - arrive);

        if (cos > bestCos) {
          bestCos = cos;
          best = i;
        }
      }

      if (best !== front) {
        front = best;
        callbacks.current.onFront(best);
      }

      backdropMaterial.uniforms.uTime!.value = reduceMotion ? 12 : time;
      backdropMaterial.uniforms.uMouse!.value.set(mouse.x, mouse.y);

      renderer.clear();
      renderer.render(backdropScene, backdropCamera);
      renderer.clearDepth();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      controlsRef.current = null;
      window.clearTimeout(readyTimer);
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointermove", onWindowPointerMove);
      for (const entry of entries) {
        entry.texture?.dispose();
        for (const material of entry.materials) material.dispose();
      }
      geometry.dispose();
      backdropGeometry.dispose();
      backdropMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [books, controlsRef]);

  return <div ref={mount} className="absolute inset-0" aria-hidden />;
}
