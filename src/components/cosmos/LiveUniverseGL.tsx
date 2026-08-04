import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Deep starfield built from a single instanced point cloud (cheap on mobile). */
function StarField({ count, tint }: { count: number; tint: string }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 8;
      sizes[i] = 0.015 + Math.random() * 0.05;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [count]);

  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.008;
      ref.current.rotation.x += d * 0.002;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={tint}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.62}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Soft volumetric nebula made of a few additive sprites. */
function Nebula({ hue, energy }: { hue: string; energy: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.05) * 0.25;
      group.current.position.y = Math.sin(t * 0.12) * 0.4;
    }
  });
  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 3.4, i * 1.1 - 1, -6 - i * 2]}>
          <circleGeometry args={[6 + i * 2, 48]} />
          <meshBasicMaterial
            color={hue}
            transparent
            opacity={0.03 + energy * 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A single slow shooting star; the punctuation of the live sky. */
function Comet() {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useRef(Math.random() * 30);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const cycle = 16;
    const t = (clock.getElapsedTime() + seed.current) % cycle;
    const p = t / 3;
    const visible = t < 3;
    ref.current.visible = visible;
    if (visible) {
      ref.current.position.set(-9 + p * 18, 6 - p * 7, -4);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.9;
    }
  });
  return (
    <mesh ref={ref} rotation={[0, 0, -0.4]}>
      <planeGeometry args={[1.6, 0.012]} />
      <meshBasicMaterial color="#fff3cf" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export default function LiveUniverseGL({
  starCount = 1400,
  tint = "#e8dcff",
  hue = "#7b3fe4",
  energy = 0.5,
}: {
  starCount?: number;
  tint?: string;
  hue?: string;
  energy?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      frameloop="always"
    >
      <StarField count={starCount} tint={tint} />
      <Nebula hue={hue} energy={energy} />
      <Comet />
    </Canvas>
  );
}
