import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, BufferGeometry, BufferAttribute, PointsMaterial } from 'three'
import type { CellData } from './CitySimulator'

interface ParticleEffectsProps {
  grid: CellData[][]
  gridSize: number
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({ grid, gridSize }) => {
  const pointsRef = useRef<Points>(null)
  
  // Create particles for buildings with high energy or recent changes
  const particles = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []
    
    grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.type !== 'empty' && (cell.energy > 85 || cell.age < 2)) {
          const worldX = (x - gridSize / 2) * 2 + 1
          const worldZ = (y - gridSize / 2) * 2 + 1
          
          // Add single particle per building to reduce memory usage
          for (let i = 0; i < 1; i++) {
            positions.push(
              worldX + (Math.random() - 0.5) * 2,
              Math.random() * 4 + 1,
              worldZ + (Math.random() - 0.5) * 2
            )
            
            // Color based on building type and energy
            if (cell.energy > 80) {
              colors.push(0.2, 0.8, 1.0) // Blue for high energy
            } else if (cell.age < 3) {
              colors.push(0.8, 1.0, 0.2) // Green for new buildings
            } else {
              colors.push(1.0, 0.8, 0.2) // Yellow for normal
            }
            
            sizes.push(Math.random() * 0.5 + 0.1)
          }
        }
      })
    })
    
    return { positions, colors, sizes }
  }, [grid, gridSize])
  
  // Animate particles
  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.geometry.attributes.position) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        // Gentle floating motion
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 2 + positions[i]) * 0.01
        
        // Reset particles that float too high
        if (positions[i + 1] > 8) {
          positions[i + 1] = 1
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  if (particles.positions.length === 0) return null
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={new Float32Array(particles.positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={new Float32Array(particles.colors)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.sizes.length}
          array={new Float32Array(particles.sizes)}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export default ParticleEffects