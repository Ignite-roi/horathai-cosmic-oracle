import { Html, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { ZODIACS, type PlacedPlanet } from "@/lib/astro";

function Ring({
  radius,
  thickness,
  color,
  speed,
  opacity = 1,
}: {
  radius: number;
  thickness: number;
  color: string;
  speed: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * speed;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 12, 180]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function SignRing() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.z += d * 0.05;
  });
  return (
    <group ref={g}>
      {ZODIACS.map((z, i) => {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
        return (
          <Html
            key={z.id}
            position={[Math.cos(a) * 1.72, Math.sin(a) * 1.72, 0]}
            center
            distanceFactor={6}
            zIndexRange={[10, 0]}
          >
            <div className="pointer-events-none select-none text-center">
              <div className="text-[26px] leading-none text-[#ffd894]">{z.symbol}</div>
              <div className="mt-0.5 text-[10px] tracking-wide text-[#e7d6ff]">{z.th}</div>
            </div>
          </Html>
        );
      })}
    </group>
  );
}

function HouseRing() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.z -= d * 0.03;
  });
  return (
    <group ref={g}>
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.22, 0.012, 0.012]} />
            <meshBasicMaterial color="#f0c674" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function PlanetNode({
  planet,
  index,
  active,
  onSelect,
}: {
  planet: PlacedPlanet;
  index: number;
  active: boolean;
  onSelect: (p: PlacedPlanet) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const base = ((planet.sign.id - 1) / 12) * Math.PI * 2 + (planet.degree / 30) * (Math.PI / 6);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = base + t * 0.03;
    const r = 2.62 + (index % 3) * 0.22;
    if (ref.current) {
      ref.current.position.set(Math.cos(a) * r, Math.sin(a) * r, Math.sin(t * 0.6 + index) * 0.12);
      const s = active ? 1.35 : 1;
      ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, s, 0.1));
    }
  });
  return (
    <group ref={ref} onClick={() => onSelect(planet)}>
      <mesh>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={active ? 1.6 : 0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color={planet.color} transparent opacity={0.16} />
      </mesh>
      <Html center distanceFactor={7} position={[0, -0.32, 0]} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap text-[10px] text-[#f3e6c8]">
          {planet.th}
        </div>
      </Html>
    </group>
  );
}

function Center() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * 0.15;
  });
  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[0.62, 0.02, 12, 8]} />
        <meshBasicMaterial color="#f0c674" />
      </mesh>
      <Html center distanceFactor={6}>
        <div className="pointer-events-none text-center">
          <div className="display text-[28px] text-[#ffd894]">๙</div>
          <div className="text-[10px] tracking-[0.2em] text-[#e7d6ff]">โหราศาสตร์ไทย</div>
        </div>
      </Html>
      <pointLight color="#ffd27a" intensity={9} distance={7} />
    </group>
  );
}

export default function ZodiacWheel3D({
  planets,
  selected,
  onSelect,
}: {
  planets: PlacedPlanet[];
  selected: PlacedPlanet | null;
  onSelect: (p: PlacedPlanet) => void;
}) {
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, -0.2, 7.6], fov: 46 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 5]} intensity={0.9} color="#c9a2ff" />
      <Stars radius={30} depth={30} count={1400} factor={2.6} fade speed={0.5} />
      <group rotation={[0.32, 0, 0]}>
        <Center />
        <Ring radius={1.2} thickness={0.008} color="#f0c674" speed={0.08} opacity={0.5} />
        <Ring radius={2.0} thickness={0.006} color="#b98bff" speed={-0.05} opacity={0.45} />
        <Ring radius={2.45} thickness={0.006} color="#f0c674" speed={0.04} opacity={0.35} />
        <SignRing />
        <HouseRing />
        {planets.map((p, i) => (
          <PlanetNode
            key={p.num}
            planet={p}
            index={i}
            active={selected?.num === p.num}
            onSelect={onSelect}
          />
        ))}
      </group>
    </Canvas>
  );
}