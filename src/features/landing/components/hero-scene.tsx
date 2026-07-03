"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/**
 * Wide "node network" hero backdrop for the public landing page, built with
 * Three.js. Reuses the brand metaphor (Nexus = connected nodes) from the login
 * scene, tuned for a full-bleed hero: more nodes, gentle depth fog, pointer
 * parallax, and a slow auto-rotation. Honours prefers-reduced-motion by
 * rendering a single static frame.
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    // Subtle depth fog so distant nodes fade into the dark hero — adds richness.
    scene.fog = new THREE.FogExp2(0x0b0a0e, 0.0065);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1000);
    camera.position.z = 78;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Post-processing: a restrained bloom so the nodes and links glow softly
    // against the dark hero — dialled well below the default for a premium,
    // not overblown, look.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.62, // strength
      0.6, // radius
      0.18, // threshold
    );
    composer.addPass(bloom);

    const group = new THREE.Group();
    scene.add(group);

    // --- Nodes ---------------------------------------------------------------
    const COUNT = 130;
    const SPREAD = 74;
    const LINK_DIST = 15;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const bases = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * SPREAD * 1.9;
      const y = (Math.random() - 0.5) * SPREAD;
      const z = (Math.random() - 0.5) * SPREAD;
      positions[i * 3] = bases[i * 3] = x;
      positions[i * 3 + 1] = bases[i * 3 + 1] = y;
      positions[i * 3 + 2] = bases[i * 3 + 2] = z;
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    // Institutional red accent, warmed toward pink for the glowing links.
    const accent = new THREE.Color(0xe11d33);

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: new THREE.Color(0xf8d4da),
      size: 1.5,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    // --- Connections ---------------------------------------------------------
    const maxLines = COUNT * COUNT;
    const linePositions = new Float32Array(maxLines * 3);
    const lineColors = new Float32Array(maxLines * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    const updateLines = () => {
      let v = 0;
      let c = 0;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        for (let j = i + 1; j < COUNT; j++) {
          const jx = j * 3;
          const dx = positions[ix] - positions[jx];
          const dy = positions[ix + 1] - positions[jx + 1];
          const dz = positions[ix + 2] - positions[jx + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < LINK_DIST) {
            const strength = 1 - dist / LINK_DIST;
            linePositions[v++] = positions[ix];
            linePositions[v++] = positions[ix + 1];
            linePositions[v++] = positions[ix + 2];
            linePositions[v++] = positions[jx];
            linePositions[v++] = positions[jx + 1];
            linePositions[v++] = positions[jx + 2];
            for (let k = 0; k < 2; k++) {
              lineColors[c++] = accent.r * strength + 0.05;
              lineColors[c++] = accent.g * strength + 0.05;
              lineColors[c++] = accent.b * strength + 0.05;
            }
          }
        }
      }
      lineGeo.setDrawRange(0, v / 3);
      (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    };

    // --- Pointer parallax ----------------------------------------------------
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("pointermove", onPointer);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Pause the render loop while the hero is scrolled out of view — no point
    // spending GPU/battery on an invisible canvas.
    let visible = true;
    let raf = 0;
    const animate = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        for (let a = 0; a < 3; a++) {
          positions[ix + a] += velocities[ix + a];
          // Soft tether to the base position so the cloud never disperses.
          const drift = positions[ix + a] - bases[ix + a];
          if (Math.abs(drift) > 10) velocities[ix + a] *= -1;
        }
      }
      (pointsGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      updateLines();

      group.rotation.y += (target.x - group.rotation.y) * 0.03 + 0.0007;
      group.rotation.x += (target.y * 0.4 - group.rotation.x) * 0.03;

      composer.render();
      raf = requestAnimationFrame(animate);
    };

    const vis = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visible;
        visible = entry.isIntersecting;
        // Resume the loop only on an off→on transition (and never in reduced motion).
        if (visible && !wasVisible && !prefersReduced && raf === 0) animate();
      },
      { threshold: 0 },
    );
    vis.observe(mount);

    if (prefersReduced) {
      updateLines();
      composer.render();
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      vis.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      pointsGeo.dispose();
      pointsMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
