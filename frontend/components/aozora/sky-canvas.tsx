"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// A summer sky: gradient, a soft sun above the frame, and noise clouds that are lit from
// above and drift sideways. Colours are authored in display space, so no conversion on output.
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
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
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = mat2(1.6, 1.2, -1.2, 1.6) * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);

    vec3 zenith = vec3(0.26, 0.54, 0.93);
    vec3 middle = vec3(0.6, 0.8, 0.985);
    vec3 horizon = vec3(0.9, 0.955, 1.0);
    vec3 sky = mix(horizon, middle, smoothstep(0.0, 0.5, uv.y));
    sky = mix(sky, zenith, smoothstep(0.42, 1.15, uv.y));

    vec2 sun = vec2(aspect * 0.5 + (uMouse.x - 0.5) * 0.12, 1.08);
    float sunDistance = length(p - sun);
    sky += vec3(1.0, 0.97, 0.88) * 0.42 * exp(-sunDistance * 2.1);

    float t = uTime * 0.014;
    // Clouds bunch up and shrink toward the horizon.
    float depth = mix(2.5, 1.0, smoothstep(0.0, 0.95, uv.y));
    vec2 q = vec2(p.x * 1.45 + t * 2.2, uv.y * 2.7 + (uMouse.y - 0.5) * 0.06) * depth;
    vec2 warp = vec2(fbm(q * 0.6 + vec2(t, 0.0)), fbm(q * 0.6 + vec2(4.1, t)));
    float density = fbm(q + warp * 0.55);
    float cover = smoothstep(0.5, 0.7, density);

    // Light comes from above: compare with the density a little higher up.
    float above = fbm(q + warp * 0.55 + vec2(0.0, 0.14));
    float lit = clamp((density - above) * 3.2 + 0.55, 0.0, 1.0);
    vec3 cloud = mix(vec3(0.7, 0.8, 0.95), vec3(1.0), lit);

    float band = smoothstep(1.1, 0.2, uv.y);
    vec3 col = mix(sky, cloud, cover * band * 0.94);
    col = mix(col, horizon, smoothstep(0.24, 0.0, uv.y) * 0.75);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Full-viewport animated sky. Without WebGL the CSS gradient behind it remains. */
export default function SkyCanvas() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
    } catch {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = renderer.domElement;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 1.2s ease";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 40 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      material.uniforms.uRes!.value.set(width, height);
      if (reduceMotion) renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onPointerMove = (event: PointerEvent) => {
      mouse.tx = event.clientX / Math.max(1, window.innerWidth);
      mouse.ty = 1 - event.clientY / Math.max(1, window.innerHeight);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const clock = new THREE.Clock();
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      canvas.style.opacity = "1";
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
      reveal();
    } else {
      renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.05);
        if (document.hidden) return;
        material.uniforms.uTime!.value += dt;
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2);
        material.uniforms.uMouse!.value.set(mouse.x, mouse.y);
        renderer.render(scene, camera);
        reveal();
      });
    }

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={mount} className="absolute inset-0" aria-hidden />;
}
