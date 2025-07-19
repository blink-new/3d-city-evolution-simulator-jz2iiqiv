import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import type { CellData, BuildingType } from './CitySimulator'

interface BuildingMeshProps {
  position: Vector3
  cellData: CellData
  onClick: () => void
}

const getBuildingConfig = (type: BuildingType) => {
  const configs = {
    empty: { 
      color: '#475569', 
      height: 0.1, 
      shape: 'box',
      cubes: 1,
      baseSize: 1.8
    },
    residential: { 
      color: '#10b981', 
      height: 1.5, 
      shape: 'box',
      cubes: 3,
      baseSize: 1.6
    },
    commercial: { 
      color: '#3b82f6', 
      height: 2.5, 
      shape: 'box',
      cubes: 5,
      baseSize: 1.7
    },
    industrial: { 
      color: '#f59e0b', 
      height: 1.8, 
      shape: 'box',
      cubes: 3,
      baseSize: 1.8
    },
    park: { 
      color: '#22c55e', 
      height: 0.3, 
      shape: 'cylinder',
      cubes: 1,
      baseSize: 1.5
    },
    road: { 
      color: '#6b7280', 
      height: 0.2, 
      shape: 'box',
      cubes: 1,
      baseSize: 1.9
    },
    power: { 
      color: '#ef4444', 
      height: 4.0, 
      shape: 'cylinder',
      cubes: 8,
      baseSize: 1.2
    },
    water: { 
      color: '#06b6d4', 
      height: 3.5, 
      shape: 'cylinder',
      cubes: 7,
      baseSize: 1.3
    },
    hospital: { 
      color: '#ec4899', 
      height: 2.8, 
      shape: 'box',
      cubes: 6,
      baseSize: 1.6
    },
    school: { 
      color: '#8b5cf6', 
      height: 2.2, 
      shape: 'box',
      cubes: 4,
      baseSize: 1.7
    },
    police: { 
      color: '#1e40af', 
      height: 2.0, 
      shape: 'box',
      cubes: 4,
      baseSize: 1.5
    },
    fire: { 
      color: '#dc2626', 
      height: 2.3, 
      shape: 'box',
      cubes: 5,
      baseSize: 1.5
    }
  }
  return configs[type] || configs.empty
}

const BuildingMesh: React.FC<BuildingMeshProps> = ({ position, cellData, onClick }) => {
  const groupRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const config = getBuildingConfig(cellData.type)
  
  // Animation for growth and hover effects
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation for some building types
      if (cellData.type === 'power' || cellData.type === 'water') {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + position.x) * 0.05
      }
      
      // Hover effect with smooth transition
      const targetScale = hovered ? 1.05 : 1.0
      groupRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1)
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    onClick()
  }

  const renderStackedCubes = () => {
    const cubes = []
    const cubeHeight = config.height / config.cubes
    
    for (let i = 0; i < config.cubes; i++) {
      const yPos = (i * cubeHeight) + (cubeHeight / 2)
      const sizeVariation = Math.max(0.3, 1 - (i * 0.1)) // Smaller cubes as we go up
      const currentSize = config.baseSize * sizeVariation
      
      // Different colors for different levels to create depth
      const levelBrightness = 1 - (i * 0.1)
      const baseColor = config.color
      
      if (config.shape === 'cylinder') {
        cubes.push(
          <mesh
            key={i}
            position={[0, yPos, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[currentSize * 0.5, currentSize * 0.5, cubeHeight, 8]} />
            <meshLambertMaterial 
              color={baseColor}
              transparent
              opacity={0.9 * levelBrightness}
            />
          </mesh>
        )
      } else {
        cubes.push(
          <mesh
            key={i}
            position={[0, yPos, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[currentSize, cubeHeight, currentSize]} />
            <meshLambertMaterial 
              color={baseColor}
              transparent
              opacity={0.9 * levelBrightness}
            />
          </mesh>
        )
      }
    }
    
    return cubes
  }

  if (cellData.type === 'empty') {
    return (
      <group
        ref={groupRef}
        position={[position.x, position.y, position.z]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, config.height / 2, 0]}>
          <boxGeometry args={[config.baseSize, config.height, config.baseSize]} />
          <meshLambertMaterial 
            color={hovered ? '#64748b' : config.color} 
            transparent 
            opacity={0.2}
            wireframe={hovered}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Stacked building cubes */}
      {renderStackedCubes()}

      {/* Population indicator (floating yellow spheres) */}
      {cellData.population > 0 && (
        <mesh position={[0.8, config.height + 0.3, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}

      {/* Energy indicator (floating blue spheres) */}
      {cellData.energy > 50 && (
        <mesh position={[-0.8, config.height + 0.3, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      )}

      {/* Age indicator (small green cubes for older buildings) */}
      {cellData.age > 10 && (
        <mesh position={[0, config.height + 0.5, 0.8]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}

      {/* Special effects for certain building types */}
      {cellData.type === 'power' && cellData.energy > 70 && (
        <mesh position={[0, config.height + 0.8, 0]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}

      {cellData.type === 'water' && cellData.energy > 60 && (
        <mesh position={[0, config.height + 0.6, 0]}>
          <sphereGeometry args={[0.25, 6, 6]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Hover outline effect */}
      {hovered && (
        <mesh position={[0, config.height / 2, 0]}>
          <boxGeometry args={[config.baseSize + 0.1, config.height + 0.1, config.baseSize + 0.1]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}

export default BuildingMesh