import React, { useMemo } from 'react'
import { Vector3 } from 'three'
import BuildingMesh from './BuildingMesh'
import type { CellData } from './CitySimulator'

interface CityGridProps {
  grid: CellData[][]
  onCellClick: (x: number, y: number) => void
  gridSize: number
}

const CityGrid: React.FC<CityGridProps> = ({ grid, onCellClick, gridSize }) => {
  // Create ground plane
  const groundGeometry = useMemo(() => {
    const size = gridSize * 2
    return { width: size, height: size }
  }, [gridSize])

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[groundGeometry.width, groundGeometry.height]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>

      {/* Grid lines for reference */}
      <gridHelper 
        args={[gridSize * 2, gridSize, '#334155', '#475569']} 
        position={[0, 0, 0]}
      />

      {/* 3D Buildings as stacked cubes */}
      {grid.map((row, x) =>
        row.map((cell, y) => (
          <BuildingMesh
            key={`${x}-${y}`}
            position={new Vector3(
              (x - gridSize / 2) * 2 + 1,
              0,
              (y - gridSize / 2) * 2 + 1
            )}
            cellData={cell}
            onClick={() => onCellClick(x, y)}
          />
        ))
      )}
    </group>
  )
}

export default CityGrid