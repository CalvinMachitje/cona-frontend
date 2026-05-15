// frontend/src/components/NeonBackground.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';

interface NeonBackgroundProps {
  primaryColor?: string;
}

function Scene({ primaryColor = "#22d3ee" }: NeonBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geometryRef = useRef<THREE.Group>(null!);
  const { viewport, mouse } = useThree();

  // Mouse position
  const mousePos = useRef({ x: 0, y: 0 });

  // Particles
  const particleCount = 1200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i]     = (Math.random() - 0.5) * 35;
      pos[i + 1] = (Math.random() - 0.5) * 35;
      pos[i + 2] = (Math.random() - 0.5) * 35;

      // Neon color variation
      const color = new THREE.Color(primaryColor);
      colors[i]     = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    return { pos, colors };
  }, [primaryColor]);

  // Mouse Interaction + Gentle Animation
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.015;
    }

    // Mouse attraction
    if (pointsRef.current) {
      pointsRef.current.position.x = mousePos.current.x * 1.5;
      pointsRef.current.position.y = mousePos.current.y * 1.5;
    }

    // Floating Geometry
    if (geometryRef.current) {
      geometryRef.current.children.forEach((mesh, i) => {
        mesh.rotation.x += 0.002 + i * 0.001;
        mesh.rotation.y += 0.003 + i * 0.001;
        mesh.position.y = Math.sin(state.clock.elapsedTime + i) * 0.3;
      });
    }
  });

  // Track Mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} color="#ffffff" intensity={0.6} />

      {/* Main Neon Particles */}
      <Points ref={pointsRef} positions={positions.pos} stride={3} frustumCulled={false}>
        <PointMaterial
          size={0.085}
          color={primaryColor}
          transparent
          sizeAttenuation
          depthWrite={false}
          opacity={0.9}
        />
      </Points>

      {/* Subtle Floating Geometry */}
      <group ref={geometryRef}>
        {[1, 2, 3, 4].map((_, i) => (
          <mesh
            key={i}
            position={[
              (i - 1.5) * 6,
              Math.random() * 8 - 4,
              -10 - i * 3
            ]}
          >
            <octahedronGeometry args={[1.2]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? "#a855f7" : "#22d3ee"}
              wireframe
              transparent
              opacity={0.15}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function NeonBackground({ primaryColor = "#22d3ee" }: NeonBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: false,
        }}
        style={{ background: 'transparent' }}
      >
        <Scene primaryColor={primaryColor} />
      </Canvas>
    </div>
  );
}