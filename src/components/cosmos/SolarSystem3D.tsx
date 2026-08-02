import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ZODIACS, type Aspect, type PlacedPlanet } from "@/lib/astro";

const DEG = Math.PI / 180;
const SIGN_RADIUS = 4.35;
const HOUSE_RADIUS = 3.85;

/** longitude (sidereal degrees) -> position on the ecliptic plane */
function place(longitude: number, radius: number, lift = 0): [number, number, number] {
  const a = longitude * DEG;
  return [Math.cos(a) * radius, Math.sin(a) * radius, lift];
}

function OrbitRing({ radius, color, opacity }: { radius: number; color: string; opacity: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return pts;
  }, [radius]);
  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />;
}

function SignWheel({ ascendant }: { ascendant: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.z += d * 0.012;
  });
  return (
    <group ref={group}>
      <OrbitRing radius={SIGN_RADIUS} color="#f0c674" opacity={0.35} />
      <OrbitRing radius={HOUSE_RADIUS} color="#b98bff" opacity={0.25} />
      {ZODIACS.map((z, i) => {
        const mid = i * 30 + 15;
        const [x, y] = place(mid, SIGN_RADIUS + 0.42);
        const [bx, by] = place(i * 30, HOUSE_RADIUS);
        const [ex, ey] = place(i * 30, SIGN_RADIUS);
        const house = ((z.id - 1 - Math.floor(ascendant / 30) + 12) % 12) + 1;
        return (
          <group key={z.id}>
            <Line
              points={[new THREE.Vector3(bx, by, 0), new THREE.Vector3(ex, ey, 0)]}
              color="#f0c674"
              transparent
              opacity={0.22}
              lineWidth={1}
            />
            <Html position={[x, y, 0]} center distanceFactor={10} zIndexRange={[8, 0]}>
              <div className="pointer-events-none select-none text-center">
                <div className="text-[22px] leading-none text-[#ffd894]">{z.symbol}</div>
                <div className="text-[9px] tracking-wide text-[#e7d6ff]">{z.th}</div>
                <div className="text-[8px] text-[#bda6ff]">ภพ {house}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function AscendantMarker({ longitude }: { longitude: number }) {
  const [x, y] = place(longitude, SIGN_RADIUS + 0.05);
  return (
    <group>
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, 0)]}
        color="#ffd894"
        transparent
        opacity={0.5}
        lineWidth={1.6}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      <Html position={place(longitude, SIGN_RADIUS - 0.55)} center distanceFactor={9}>
        <div className="pointer-events-none rounded-full border border-[#ffd894]/50 bg-black/50 px-2 py-0.5 text-[9px] text-[#ffd894]">
          ลัคนา
        </div>
      </Html>
    </group>
  );
}

function PlanetBody({
  planet,
  transit,
  active,
  onSelect,
}: {
  planet: PlacedPlanet;
  transit: boolean;
  active: boolean;
  onSelect: (p: PlacedPlanet) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const radius = transit ? planet.orbit + 0.42 : planet.orbit;
  const target = useRef(0);

  useFrame(({ clock }, d) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const drift = planet.retrograde ? -t * 0.012 : t * 0.02;
    const a = (planet.longitude + drift * 6) * DEG;
    group.current.position.set(
      Math.cos(a) * radius,
      Math.sin(a) * radius,
      Math.sin(t * 0.5 + planet.num) * 0.08 + (transit ? 0.35 : 0),
    );
    target.current = active ? 1.45 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target.current, 6, d);
    group.current.scale.setScalar(s);
  });

  const glow = 0.5 + planet.strength * 1.4;

  return (
    <group ref={group} onClick={(e) => { e.stopPropagation(); onSelect(planet); }}>
      <mesh>
        <sphereGeometry args={[planet.size, 24, 24]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={transit ? glow * 0.7 : glow}
          roughness={0.35}
          metalness={0.1}
          transparent
          opacity={transit ? 0.75 : 1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[planet.size * 1.9, 16, 16]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.1 + planet.strength * 0.12}
          depthWrite={false}
        />
      </mesh>
      <Html center distanceFactor={9} position={[0, -planet.size - 0.22, 0]} zIndexRange={[9, 0]}>
        <div
          className="pointer-events-none flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10px]"
          style={{
            background: transit ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.5)",
            color: planet.color,
            border: `1px solid ${planet.color}44`,
          }}
        >
          <span>{planet.thaiNumeral}</span>
          <span className="text-[#f3e6c8]">{planet.th}</span>
          {planet.retrograde && <span className="text-[#ff9c7a]">พักร์</span>}
        </div>
      </Html>
    </group>
  );
}

function AspectLines({ planets, aspects }: { planets: PlacedPlanet[]; aspects: Aspect[] }) {
  const byNum = useMemo(() => new Map(planets.map((p) => [p.num, p])), [planets]);
  return (
    <group>
      {aspects.map((asp, i) => {
        const a = byNum.get(asp.a);
        const b = byNum.get(asp.b);
        if (!a || !b) return null;
        const pa = place(a.longitude, a.orbit);
        const pb = place(b.longitude, b.orbit);
        return (
          <Line
            key={`${asp.a}-${asp.b}-${i}`}
            points={[new THREE.Vector3(...pa), new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pb)]}
            color={asp.benefic ? "#7ef0c2" : "#ff7d5c"}
            transparent
            opacity={0.22}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}

function Core({ label, sub }: { label: string; sub: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * 0.2;
  });
  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[0.62, 0.012, 10, 64]} />
        <meshBasicMaterial color="#f0c674" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#ffcf6b" emissive="#ffb347" emissiveIntensity={2.2} />
      </mesh>
      <pointLight color="#ffd27a" intensity={14} distance={9} />
      <Html center distanceFactor={9} position={[0, -0.95, 0]}>
        <div className="pointer-events-none text-center">
          <div className="display text-[15px] text-[#ffd894]">{label}</div>
          <div className="text-[9px] tracking-[0.18em] text-[#e7d6ff]">{sub}</div>
        </div>
      </Html>
    </group>
  );
}

export type SolarSystemProps = {
  planets: PlacedPlanet[];
  transitPlanets?: PlacedPlanet[];
  aspects?: Aspect[];
  ascendant: number;
  ascendantLabel: string;
  selected: PlacedPlanet | null;
  showAspects?: boolean;
  lowPower?: boolean;
  onSelect: (p: PlacedPlanet) => void;
};

export default function SolarSystem3D({
  planets,
  transitPlanets = [],
  aspects = [],
  ascendant,
  ascendantLabel,
  selected,
  showAspects = true,
  lowPower = false,
  onSelect,
}: SolarSystemProps) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.2] : [1, 1.9]}
      camera={{ position: [0, -3.2, 8.6], fov: 46 }}
      gl={{ alpha: true, antialias: !lowPower }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 6]} intensity={0.8} color="#c9a2ff" />
      <group rotation={[0.55, 0, 0]}>
        <Core label={`ลัคนาราศี${ascendantLabel}`} sub="โหราศาสตร์ไทย" />
        <SignWheel ascendant={ascendant} />
        <AscendantMarker longitude={ascendant} />
        {planets.map((p) => (
          <OrbitRing key={`o-${p.num}`} radius={p.orbit} color="#8f7bd8" opacity={0.14} />
        ))}
        {showAspects && <AspectLines planets={planets} aspects={aspects} />}
        {planets.map((p) => (
          <PlanetBody
            key={`n-${p.num}`}
            planet={p}
            transit={false}
            active={selected?.num === p.num}
            onSelect={onSelect}
          />
        ))}
        {transitPlanets.map((p) => (
          <PlanetBody key={`t-${p.num}`} planet={p} transit active={false} onSelect={onSelect} />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5.5}
        maxDistance={13}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={!lowPower}
        autoRotateSpeed={0.35}
        makeDefault
      />
    </Canvas>
  );
}
