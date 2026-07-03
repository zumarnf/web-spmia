"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Animated "node network" backdrop for the login screen, built with Three.js.
 *
 * Visualises the brand metaphor (Nexus = connected nodes): drifting points are
 * linked by lines whose brightness scales with proximity, with a slow parallax
 * rotation. Honours prefers-reduced-motion by rendering a single static frame.
 */
export function LoginScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 70;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // --- Nodes ---------------------------------------------------------------
    const COUNT = 90;
    const SPREAD = 60;
    const LINK_DIST = 16;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD * 1.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
      velocities[i * 3] = (Math.random() - 0.5) * 0.06;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }

    const accent = new THREE.Color(0xe11d33);
    const light = new THREE.Color(0xf8d4da);

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: light,
      size: 1.4,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
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
      opacity: 0.5,
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
              lineColors[c++] = accent.r * strength + 0.06;
              lineColors[c++] = accent.g * strength + 0.06;
              lineColors[c++] = accent.b * strength + 0.06;
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
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.6;
    };
    window.addEventListener("pointermove", onPointer);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    const animate = () => {
      for (let i = 0; i < COUNT * 3; i++) {
        positions[i] += velocities[i];
        if (positions[i] > SPREAD || positions[i] < -SPREAD) velocities[i] *= -1;
      }
      (pointsGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      updateLines();

      group.rotation.y += (target.x - group.rotation.y) * 0.04 + 0.0009;
      group.rotation.x += (target.y - group.rotation.x) * 0.04;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    if (prefersReduced) {
      updateLines();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      pointsGeo.dispose();
      pointsMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
