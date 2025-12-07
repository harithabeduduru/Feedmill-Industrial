import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

function Equip({ pos, name, info, onClick, isSelected }) {
  return (
    <mesh
      position={pos}
      onClick={() => onClick(info)}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
      scale={[1.6, 1, 1]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isSelected ? "#38bdf8" : "#818cf8"} />
      <Html position={[0, 0.75, 0]}>
        <div
          style={{
            background: "rgba(15,23,42,0.9)",
            color: "white",
            padding: "2px 6px",
            borderRadius: "999px",
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </Html>
    </mesh>
  );
}

export default function Plant3D({ onSelect, selectedId }) {
  const machines = [
    {
      id: "silos",
      name: "Silos",
      type: "silo",
      kpis: ["Level", "DOC", "LOW_LEVEL events"],
      pos: [-4, 0.5, 0],
    },
    {
      id: "mixer",
      name: "Grinder / Mixer",
      type: "mixer",
      kpis: ["Batch count", "Accuracy"],
      pos: [-1.5, 0.5, 0],
    },
    {
      id: "conditioner",
      name: "Conditioner",
      type: "conditioner",
      kpis: ["Steam flow", "SP–PV stability"],
      pos: [1.0, 0.5, 0],
    },
    {
      id: "pellet",
      name: "Pellet Mill",
      type: "pellet_mill",
      kpis: ["Production rate", "Steam/ton"],
      pos: [3.5, 0.5, 0],
    },
    {
      id: "bagging",
      name: "Bagging Line",
      type: "bagging",
      kpis: ["Bag count", "Rework %"],
      pos: [6, 0.5, 0],
    },
  ];

  return (
    <div className="plant-3d">
      <Canvas camera={{ position: [0, 7, 13], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 5]} intensity={0.9} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, -0.01, 0]}>
          <planeGeometry args={[30, 12]} />
          <meshStandardMaterial color="#020617" />
        </mesh>

        {machines.map((m) => (
          <Equip
            key={m.id}
            pos={m.pos}
            name={m.name}
            info={m}
            onClick={onSelect}
            isSelected={m.id === selectedId}
          />
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
