import { Float, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Ring({ radius, speed, opacity }: { radius: number; speed: number; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * speed;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.6, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 12, 160]} />
      <meshBasicMaterial color="#f0c674" transparent opacity={opacity} />
    </mesh>
  );
}

function Glyphs({ radius }: { radius: number }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () => new Array(12).fill(0).map((_, i) => (i / 12) * Math.PI * 2),
    [],
  );
  useFrame((_, d) => {
    if (group.current) group.current.rotation.z -= d * 0.08;
  });
  return (
    <group ref={group} rotation={[Math.PI / 2.6, 0, 0]}>
      {nodes.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color="#ffe6a8" />
        </mesh>
      ))}
    </group>
  );
}

function OrbitPlanet({
  radius,
  size,
  color,
  speed,
  offset,
  tilt,
}: {
  radius: number;
  size: number;
  color: string;
  speed: number;
  offset: number;
  tilt: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius * tilt, Math.sin(t) * 0.6);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.35} />
    </mesh>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.25;
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#f4cf80"
          emissive="#c99530"
          emissiveIntensity={0.9}
          metalness={0.9}
          roughness={0.25}
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#ffdf9e" transparent opacity={0.28} />
      </mesh>
      <pointLight color="#ffd27a" intensity={12} distance={9} />
    </group>
  );
}

export default function CosmicScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.6, 5.2], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#c9a2ff" />
      <Stars radius={40} depth={40} count={2600} factor={3.4} saturation={0} fade speed={0.7} />
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
        <Core />
        <Ring radius={1.35} speed={0.12} opacity={0.55} />
        <Ring radius={1.85} speed={-0.09} opacity={0.35} />
        <Ring radius={2.4} speed={0.06} opacity={0.22} />
        <Glyphs radius={1.85} />
      </Float>
      <OrbitPlanet radius={2.1} size={0.11} color="#ffb3e6" speed={0.32} offset={0} tilt={0.42} />
      <OrbitPlanet radius={2.7} size={0.09} color="#8ef0c9" speed={0.24} offset={2} tilt={0.36} />
      <OrbitPlanet radius={3.2} size={0.14} color="#9b6bff" speed={0.17} offset={4} tilt={0.3} />
      <OrbitPlanet radius={1.6} size={0.07} color="#cfe3ff" speed={0.45} offset={1} tilt={0.5} />
    </Canvas>
  );
}