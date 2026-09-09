"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { avatarGender } from "@/lib/env";

const modelPath = `/models/avatar-${avatarGender}.glb`;

class AvatarErrorBoundary extends Component<{ children: React.ReactNode; gender: typeof avatarGender }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <ProceduralAvatar gender={this.props.gender} /> : this.props.children;
  }
}

function ModelAvatar() {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const gltf = useGLTF(modelPath);
  const { scene, scale, y } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(cloned);
    const size = bounds.getSize(new THREE.Vector3());
    const fittedScale = size.y > 0 ? 3.8 / size.y : 1.65;
    return { scene: cloned, scale: fittedScale, y: -2.15 - bounds.min.y * fittedScale };
  }, [gltf.scene]);

  useEffect(() => {
    headRef.current = null;
    scene.traverse((node) => {
      if (!headRef.current && /head/i.test(node.name)) headRef.current = node;
    });
  }, [scene]);

  const pointerTarget = usePointerTarget();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerTarget.current.x * 0.32, 0.06);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.06 - pointerTarget.current.y * 0.08, 0.06);
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, pointerTarget.current.x * 0.18, 0.06);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.38 - pointerTarget.current.y * 0.1, 0.06);
    }
  });

  return <primitive ref={group} object={scene} position={[0, y, 0]} scale={scale} />;
}

function ProceduralAvatar({ gender = avatarGender }: { gender?: typeof avatarGender }) {
  void gender;
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const coat = useRef<THREE.Group>(null);

  const pointerTarget = usePointerTarget();

  // Neo (Matrix): abrigo negro largo, gafas oscuras, pelo engominado
  const coatBlack = "#0B0B0C";
  const clothBlack = "#131315";
  const skin = "#E7C29B";
  const hairBlack = "#08080A";
  const lensBlack = "#050505";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (body.current) {
      body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, pointerTarget.current.x * 0.32, 0.05);
      // leve esquiva "bullet-time"
      body.current.rotation.z = Math.sin(t * 0.8) * 0.02;
      body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, -0.05 - pointerTarget.current.y * 0.05, 0.05);
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, pointerTarget.current.x * 0.4, 0.07);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -0.14 - pointerTarget.current.y * 0.16, 0.07);
    }
    if (coat.current) {
      coat.current.rotation.x = Math.sin(t * 1.4) * 0.03;
      coat.current.position.y = Math.sin(t * 1.8) * 0.02;
    }
  });

  return (
    <group ref={body} position={[0, -1.25, 0]}>
      {/* pantalón y botas */}
      <mesh castShadow position={[-0.24, -0.95, 0]}>
        <cylinderGeometry args={[0.17, 0.15, 0.6, 14]} />
        <meshStandardMaterial color={clothBlack} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.24, -0.95, 0]}>
        <cylinderGeometry args={[0.17, 0.15, 0.6, 14]} />
        <meshStandardMaterial color={clothBlack} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.24, -1.24, 0.08]}>
        <boxGeometry args={[0.28, 0.14, 0.44]} />
        <meshStandardMaterial color="#000000" roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.24, -1.24, 0.08]}>
        <boxGeometry args={[0.28, 0.14, 0.44]} />
        <meshStandardMaterial color="#000000" roughness={0.35} />
      </mesh>

      {/* abrigo largo negro */}
      <group ref={coat}>
        <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.55, 0.78, 1.9, 20]} />
          <meshPhysicalMaterial color={coatBlack} roughness={0.45} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.4} sheen={0.5} sheenColor="#3A3A3A" />
        </mesh>
        {/* solapas del cuello */}
        <mesh castShadow position={[-0.22, 0.62, 0.42]} rotation={[0.15, 0.25, -0.2]}>
          <boxGeometry args={[0.22, 0.5, 0.05]} />
          <meshStandardMaterial color={coatBlack} roughness={0.45} />
        </mesh>
        <mesh castShadow position={[0.22, 0.62, 0.42]} rotation={[0.15, -0.25, 0.2]}>
          <boxGeometry args={[0.22, 0.5, 0.05]} />
          <meshStandardMaterial color={coatBlack} roughness={0.45} />
        </mesh>
        {/* jersey interior negro */}
        <mesh position={[0, 0.3, 0.46]}>
          <boxGeometry args={[0.3, 0.85, 0.06]} />
          <meshStandardMaterial color="#0E0E10" roughness={0.7} />
        </mesh>
      </group>

      {/* brazos con mangas negras */}
      <mesh castShadow position={[-0.66, 0.35, 0]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.14, 0.55, 6, 12]} />
        <meshStandardMaterial color={coatBlack} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.66, 0.35, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.14, 0.55, 6, 12]} />
        <meshStandardMaterial color={coatBlack} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.72, -0.15, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0.72, -0.15, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>

      <group ref={head} position={[0, 1.18, 0]} rotation={[-0.14, 0, 0]}>
        <mesh position={[0, -0.52, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.3, 14]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* cara */}
        <mesh castShadow position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.5, 24, 18]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* pelo engominado hacia atrás */}
        <mesh castShadow position={[0, 0.14, -0.1]} rotation={[-0.45, 0, 0]}>
          <sphereGeometry args={[0.56, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshPhysicalMaterial color={hairBlack} roughness={0.28} metalness={0.1} clearcoat={1} clearcoatRoughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.05, -0.42]} scale={[0.9, 0.9, 0.7]}>
          <sphereGeometry args={[0.4, 18, 14]} />
          <meshStandardMaterial color={hairBlack} roughness={0.35} />
        </mesh>
        {/* gafas oscuras Neo */}
        <mesh position={[-0.2, 0.08, 0.5]}>
          <boxGeometry args={[0.24, 0.16, 0.06]} />
          <meshPhysicalMaterial color={lensBlack} roughness={0.05} metalness={0.6} clearcoat={1} emissive="#00FF41" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0.2, 0.08, 0.5]}>
          <boxGeometry args={[0.24, 0.16, 0.06]} />
          <meshPhysicalMaterial color={lensBlack} roughness={0.05} metalness={0.6} clearcoat={1} emissive="#00FF41" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0, 0.1, 0.5]}>
          <boxGeometry args={[0.12, 0.035, 0.05]} />
          <meshStandardMaterial color={lensBlack} roughness={0.2} />
        </mesh>
        <mesh position={[-0.38, 0.09, 0.28]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.03]} />
          <meshStandardMaterial color={lensBlack} roughness={0.3} />
        </mesh>
        <mesh position={[0.38, 0.09, 0.28]} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.03]} />
          <meshStandardMaterial color={lensBlack} roughness={0.3} />
        </mesh>
        {/* brillos verdes Matrix en las gafas */}
        <mesh position={[-0.24, 0.11, 0.535]}>
          <boxGeometry args={[0.06, 0.02, 0.005]} />
          <meshBasicMaterial color="#00FF41" />
        </mesh>
        <mesh position={[0.16, 0.11, 0.535]}>
          <boxGeometry args={[0.06, 0.02, 0.005]} />
          <meshBasicMaterial color="#00FF41" />
        </mesh>
        {/* boca seria + perilla */}
        <mesh position={[0, -0.24, 0.47]}>
          <boxGeometry args={[0.14, 0.025, 0.02]} />
          <meshStandardMaterial color="#4A322A" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.36, 0.4]}>
          <boxGeometry args={[0.12, 0.09, 0.05]} />
          <meshStandardMaterial color={hairBlack} roughness={0.5} />
        </mesh>
        {/* resplandor verde sobre la cara */}
        <pointLight color="#00FF41" intensity={3} distance={3} position={[0, 0.4, 1.2]} />
      </group>
    </group>
  );
}

function MatrixRain({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 6 - 2.5;
      positions[i * 3 + 2] = -1 - Math.random() * 3;
      speeds[i] = 0.6 + Math.random() * 1.6;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    const points = ref.current;
    if (!points) return;
    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * delta;
      if (arr[i * 3 + 1] < -2.6) arr[i * 3 + 1] = 3.4;
    }
    attr.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#00FF41" size={0.055} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function Scene() {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(modelPath, { method: "HEAD", signal: controller.signal })
      .then((response) => setModelAvailable(response.ok))
      .catch(() => setModelAvailable(false));
    return () => controller.abort();
  }, []);

  return (
    <>
      <color attach="background" args={["#020805"]} />
      <ambientLight intensity={1.15} />
      <directionalLight castShadow intensity={2.6} position={[3, 5, 4]} shadow-mapSize={[1024, 1024]} />
      <pointLight color="#00FF41" intensity={20} position={[-4, 1.5, 2.5]} />
      <pointLight color="#B8FFC8" intensity={8} position={[4, 2.5, 2]} />
      <MatrixRain />
      <Suspense fallback={<ProceduralAvatar gender={avatarGender} />}>
        {modelAvailable ? <AvatarErrorBoundary gender={avatarGender}><ModelAvatar /></AvatarErrorBoundary> : <ProceduralAvatar gender={avatarGender} />}
      </Suspense>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, 0]}>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </>
  );
}

function usePointerTarget() {
  const target = useRef(new THREE.Vector2());

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      target.current.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    const resetPointer = () => target.current.set(0, 0);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetPointer);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return target;
}

export function AvatarScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.2, 6], fov: 36 }} gl={{ antialias: true, alpha: true }}>
      <Scene />
    </Canvas>
  );
}
