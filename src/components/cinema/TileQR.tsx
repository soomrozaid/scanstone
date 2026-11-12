"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMatrix } from "@/lib/qr/matrix";

/**
 * Hero scene: a real, scannable QR code built from stone tiles. Tiles fly in
 * and settle on load, lift under the cursor, flip in a wave whenever the
 * destination changes (the pattern itself never changes), and drift apart
 * as the hero scrolls away.
 */

const INK = new THREE.Color("#171512");
const STONE = new THREE.Color("#efe7d6");
const QUIET = 3;

type Tile = {
  home: THREE.Vector3;
  start: THREE.Vector3;
  spin: THREE.Euler;
  delay: number;
  col: number;
  dark: boolean;
};

// Scratch objects reused every frame (module scope keeps hooks lint happy).
const dummy = new THREE.Object3D();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ray = new THREE.Raycaster();
const local = new THREE.Vector3();

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Tiles({
  url,
  flipAt,
  onSettled,
}: {
  url: string;
  flipAt: React.RefObject<number>;
  onSettled: () => void;
}) {
  const darkRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const settled = useRef(false);
  const pointer = useRef(new THREE.Vector3(99, 99, 0));
  const { viewport, camera, size } = useThree();

  const { dark, light, span } = useMemo(() => {
    const m = buildMatrix(url, "M");
    const n = m.size + QUIET * 2;
    const unit = 1 / n;
    const dark: Tile[] = [];
    const light: Tile[] = [];
    let i = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const mr = r - QUIET;
        const mc = c - QUIET;
        const isDark =
          mr >= 0 && mc >= 0 && mr < m.size && mc < m.size && m.get(mr, mc);
        const home = new THREE.Vector3(
          (c - n / 2 + 0.5) * unit,
          (n / 2 - r - 0.5) * unit,
          isDark ? 0.012 : 0,
        );
        const a = rand(i + 1) * Math.PI * 2;
        const rad = 1.2 + rand(i + 7) * 2.2;
        const start = new THREE.Vector3(
          Math.cos(a) * rad,
          Math.sin(a) * rad * 0.7,
          2.5 + rand(i + 3) * 3,
        );
        const spin = new THREE.Euler(
          rand(i + 11) * 6,
          rand(i + 13) * 6,
          rand(i + 17) * 6,
        );
        const dist = Math.hypot(c - n / 2, r - n / 2) / (n / 2);
        const t: Tile = {
          home,
          start,
          spin,
          delay: dist * 0.9 + rand(i + 19) * 0.35,
          col: c / n,
          dark: isDark,
        };
        (isDark ? dark : light).push(t);
        i++;
      }
    }
    return { dark, light, span: n, unit };
  }, [url]);


  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (ray.ray.intersectPlane(plane, hit)) pointer.current.copy(hit);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [camera]);

  const wide = size.width >= 900;
  const scale = wide
    ? Math.min(viewport.height * 0.66, viewport.width * 0.34)
    : Math.min(viewport.width * 0.66, viewport.height * 0.36);
  const cx = wide ? viewport.width * 0.27 : 0;
  const cy = wide ? viewport.height * 0.02 : viewport.height * 0.22;
  const tile = 1 / span;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.4);
    g.position.set(cx, cy + scroll * 0.6, -scroll * 0.6);
    g.rotation.x = -0.12 + scroll * 0.9 + Math.cos(t * 0.3) * 0.03;
    g.rotation.y = -0.22 + Math.sin(t * 0.25) * 0.06 + (wide ? 0 : 0.15);
    g.scale.setScalar(scale);

    // pointer in group space
    g.updateMatrixWorld();
    local.copy(pointer.current);
    g.worldToLocal(local);

    const since = performance.now() / 1000 - (flipAt.current ?? -99);
    let allIn = true;

    const write = (mesh: THREE.InstancedMesh | null, list: Tile[]) => {
      if (!mesh) return;
      for (let i = 0; i < list.length; i++) {
        const k = list[i]!;
        const p = ease((t - 0.25 - k.delay) / 1.5);
        if (p < 1) allIn = false;
        const q = 1 - p;
        dummy.position.set(
          k.home.x + (k.start.x - k.home.x) * q,
          k.home.y + (k.start.y - k.home.y) * q,
          k.home.z + (k.start.z - k.home.z) * q,
        );
        dummy.rotation.set(k.spin.x * q, k.spin.y * q, k.spin.z * q);

        // cursor lift
        const d = Math.hypot(local.x - k.home.x, local.y - k.home.y);
        const lift = Math.max(0, 1 - d / 0.22);
        dummy.position.z += lift * lift * 0.09;
        dummy.rotation.x += lift * 0.25 * (local.y - k.home.y > 0 ? 1 : -1);

        // destination flip wave, left to right
        const w = smooth(k.col * 0.7, k.col * 0.7 + 0.45, since);
        dummy.rotation.y += w * Math.PI * 2;
        dummy.position.z += Math.sin(w * Math.PI) * 0.05;

        // scroll scatter
        if (scroll > 0.15) {
          const s = (scroll - 0.15) * 1.2;
          dummy.position.x += (k.start.x - k.home.x) * s * 0.35;
          dummy.position.y += (k.start.y - k.home.y) * s * 0.35;
          dummy.position.z += s * k.delay * 0.8;
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    write(darkRef.current, dark);
    write(lightRef.current, light);
    if (allIn && !settled.current) {
      settled.current = true;
      onSettled();
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={lightRef} args={[undefined, undefined, light.length]}>
        <boxGeometry args={[tile * 0.96, tile * 0.96, tile * 0.6]} />
        <meshStandardMaterial color={STONE} roughness={0.7} metalness={0.02} />
      </instancedMesh>
      <instancedMesh ref={darkRef} args={[undefined, undefined, dark.length]}>
        <boxGeometry args={[tile * 0.96, tile * 0.96, tile * 0.9]} />
        <meshPhysicalMaterial
          color={INK}
          roughness={0.25}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </instancedMesh>
    </group>
  );
}

function CursorLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ pointer, viewport }) => {
    light.current?.position.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      1.6,
    );
  });
  return <pointLight ref={light} intensity={6} distance={6} color="#e08a46" />;
}

export default function TileQR({
  url,
  flipAt,
  onReady,
  onSettled,
  active = true,
}: {
  active?: boolean;
  url: string;
  flipAt: React.RefObject<number>;
  onReady: () => void;
  onSettled: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 5]} intensity={2.2} />
      <directionalLight position={[-4, -1, 2]} intensity={0.8} color="#4fae9b" />
      <CursorLight />
      <Tiles url={url} flipAt={flipAt} onSettled={onSettled} />
    </Canvas>
  );
}
