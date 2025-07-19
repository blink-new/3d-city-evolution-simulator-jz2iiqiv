import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Play, Pause, RotateCcw, Settings, Info, Shuffle } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import ConstructionPalette from './ConstructionPalette'
import StatsPanel from './StatsPanel'
import CityGrid from './CityGrid'
import { evolveCity } from '../utils/cityEvolution'

export type BuildingType = 
  | 'empty' | 'residential' | 'commercial' | 'industrial' | 'park' | 'road'
  | 'power' | 'water' | 'hospital' | 'school' | 'police' | 'fire'

export interface CellData {
  type: BuildingType
  age: number
  population: number
  energy: number
}

const GRID_SIZE = 20

const CitySimulator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [selectedTool, setSelectedTool] = useState<BuildingType>('residential')
  const [grid, setGrid] = useState<CellData[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({
        type: 'empty' as BuildingType,
        age: 0,
        population: 0,
        energy: 0
      }))
    )
  )
  const [generation, setGeneration] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  // SimCity-style evolution with realistic city growth
  const evolveCityStep = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = evolveCity(prevGrid)
      return newGrid
    })
    
    setGeneration(prev => prev + 1)
  }, [])

  const handleCellClick = useCallback((x: number, y: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid]
      newGrid[x] = [...newGrid[x]]
      newGrid[x][y] = {
        type: selectedTool,
        age: 0,
        population: selectedTool === 'empty' ? 0 : Math.floor(Math.random() * 50),
        energy: selectedTool === 'empty' ? 0 : Math.floor(Math.random() * 100)
      }
      return newGrid
    })
  }, [selectedTool])

  const toggleSimulation = () => {
    setIsPlaying(!isPlaying)
  }

  const resetCity = () => {
    setIsPlaying(false)
    setGeneration(0)
    setGrid(Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({
        type: 'empty' as BuildingType,
        age: 0,
        population: 0,
        energy: 0
      }))
    ))
  }

  const generateRandomSetup = () => {
    setIsPlaying(false)
    setGeneration(0)
    
    const patterns = [
      'clusters',
      'downtown',
      'suburban',
      'industrial_zone',
      'mixed_development'
    ]
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({
        type: 'empty' as BuildingType,
        age: 0,
        population: 0,
        energy: 0
      }))
    )

    const buildingTypes: BuildingType[] = [
      'residential', 'commercial', 'industrial', 'park', 'road',
      'power', 'water', 'hospital', 'school', 'police', 'fire'
    ]

    switch (selectedPattern) {
      case 'clusters': {
        // Create 3-4 random clusters of buildings
        for (let cluster = 0; cluster < 4; cluster++) {
          const centerX = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3
          const centerY = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3
          const clusterType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)]
          
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              if (Math.random() < 0.6) {
                const x = centerX + dx
                const y = centerY + dy
                if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                  newGrid[x][y] = {
                    type: clusterType,
                    age: Math.floor(Math.random() * 10),
                    population: Math.floor(Math.random() * 100),
                    energy: Math.floor(Math.random() * 100)
                  }
                }
              }
            }
          }
        }
        break
      }

      case 'downtown': {
        // Dense urban core with infrastructure first
        const coreSize = 10
        const startX = Math.floor((GRID_SIZE - coreSize) / 2)
        const startY = Math.floor((GRID_SIZE - coreSize) / 2)
        
        // First, place essential infrastructure
        // Power plant
        newGrid[startX][startY] = {
          type: 'power',
          age: 5,
          population: 20,
          energy: 90
        }
        
        // Water tower
        newGrid[startX + 1][startY] = {
          type: 'water',
          age: 3,
          population: 15,
          energy: 85
        }
        
        // Create road network
        for (let i = 0; i < coreSize; i++) {
          // Horizontal roads
          if (startY + 2 < GRID_SIZE) {
            newGrid[startX + i][startY + 2] = {
              type: 'road',
              age: 2,
              population: 0,
              energy: 80
            }
          }
          if (startY + 5 < GRID_SIZE) {
            newGrid[startX + i][startY + 5] = {
              type: 'road',
              age: 2,
              population: 0,
              energy: 80
            }
          }
          
          // Vertical roads
          if (startX + 3 < GRID_SIZE) {
            newGrid[startX + 3][startY + i] = {
              type: 'road',
              age: 2,
              population: 0,
              energy: 80
            }
          }
          if (startX + 6 < GRID_SIZE) {
            newGrid[startX + 6][startY + i] = {
              type: 'road',
              age: 2,
              population: 0,
              energy: 80
            }
          }
        }
        
        // Then place buildings near roads
        for (let x = startX; x < startX + coreSize && x < GRID_SIZE; x++) {
          for (let y = startY; y < startY + coreSize && y < GRID_SIZE; y++) {
            if (newGrid[x][y].type === 'empty' && Math.random() < 0.7) {
              const types = ['commercial', 'residential', 'hospital', 'school', 'police', 'park']
              const weights = [0.3, 0.25, 0.1, 0.1, 0.05, 0.2] // Weighted selection
              let rand = Math.random()
              let selectedType = types[0]
              
              for (let i = 0; i < types.length; i++) {
                if (rand < weights[i]) {
                  selectedType = types[i]
                  break
                }
                rand -= weights[i]
              }
              
              newGrid[x][y] = {
                type: selectedType as BuildingType,
                age: Math.floor(Math.random() * 10),
                population: selectedType === 'park' ? 0 : Math.floor(Math.random() * 100) + 20,
                energy: Math.floor(Math.random() * 40) + 60
              }
            }
          }
        }
        break
      }

      case 'suburban': {
        // Suburban development with infrastructure
        // First place power and water
        newGrid[2][2] = { type: 'power', age: 8, population: 25, energy: 85 }
        newGrid[17][17] = { type: 'water', age: 6, population: 20, energy: 80 }
        
        // Create main roads
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i % 4 === 0) {
            newGrid[i][GRID_SIZE / 2] = { type: 'road', age: 3, population: 0, energy: 75 }
            newGrid[GRID_SIZE / 2][i] = { type: 'road', age: 3, population: 0, energy: 75 }
          }
        }
        
        // Place residential clusters near roads
        for (let cluster = 0; cluster < 6; cluster++) {
          const centerX = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2
          const centerY = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2
          
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const x = centerX + dx
              const y = centerY + dy
              if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && 
                  newGrid[x][y].type === 'empty' && Math.random() < 0.8) {
                newGrid[x][y] = {
                  type: 'residential',
                  age: Math.floor(Math.random() * 5),
                  population: Math.floor(Math.random() * 60) + 20,
                  energy: Math.floor(Math.random() * 30) + 70
                }
              }
            }
          }
        }
        
        // Add some services and parks
        const serviceTypes: BuildingType[] = ['school', 'hospital', 'park', 'commercial', 'fire', 'police']
        for (let i = 0; i < 12; i++) {
          const x = Math.floor(Math.random() * GRID_SIZE)
          const y = Math.floor(Math.random() * GRID_SIZE)
          
          if (newGrid[x][y].type === 'empty') {
            const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
            newGrid[x][y] = {
              type: serviceType,
              age: Math.floor(Math.random() * 6),
              population: serviceType === 'park' ? 0 : Math.floor(Math.random() * 40) + 10,
              energy: Math.floor(Math.random() * 30) + 70
            }
          }
        }
        break
      }

      case 'industrial_zone': {
        // Industrial area with supporting infrastructure
        for (let i = 0; i < 40; i++) {
          const x = Math.floor(Math.random() * GRID_SIZE)
          const y = Math.floor(Math.random() * GRID_SIZE)
          
          if (newGrid[x][y].type === 'empty') {
            const rand = Math.random()
            let type: BuildingType
            
            if (rand < 0.5) type = 'industrial'
            else if (rand < 0.7) type = 'power'
            else if (rand < 0.85) type = 'water'
            else if (rand < 0.95) type = 'road'
            else type = 'fire'
            
            newGrid[x][y] = {
              type,
              age: Math.floor(Math.random() * 12),
              population: Math.floor(Math.random() * 60),
              energy: Math.floor(Math.random() * 100)
            }
          }
        }
        break
      }

      case 'mixed_development': {
        // Balanced mix of all building types
        for (let i = 0; i < 80; i++) {
          const x = Math.floor(Math.random() * GRID_SIZE)
          const y = Math.floor(Math.random() * GRID_SIZE)
          
          if (newGrid[x][y].type === 'empty') {
            const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)]
            newGrid[x][y] = {
              type,
              age: Math.floor(Math.random() * 10),
              population: Math.floor(Math.random() * 100),
              energy: Math.floor(Math.random() * 100)
            }
          }
        }
        break
      }
    }

    setGrid(newGrid)
  }

  // Evolution loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(evolveCityStep, 1000 / speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, evolveCityStep])

  return (
    <div className="w-full h-screen bg-slate-900 flex">
      {/* Left Panel - Controls */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">3D City Evolution</h1>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              Generation {generation}
            </Badge>
          </div>

          {/* Control Panel */}
          <Card className="p-4 bg-slate-700 border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Controls
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={toggleSimulation}
                  variant={isPlaying ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={resetCity} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={generateRandomSetup}
                variant="secondary"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Generate Random Setup
              </Button>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Speed: {speed}x
                </label>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={4}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Construction Palette */}
          <ConstructionPalette
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
          />

          {/* Statistics */}
          <StatsPanel grid={grid} />
        </div>
      </div>

      {/* Main 3D Isometric Canvas */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-700 to-slate-900">
        <Canvas
          shadows
          camera={{ position: [30, 30, 30], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #334155, #1e293b)' }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[20, 20, 10]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            
            {/* Isometric Camera Setup */}
            <PerspectiveCamera
              makeDefault
              position={[25, 25, 25]}
              fov={50}
            />
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={15}
              maxDistance={60}
              maxPolarAngle={Math.PI / 2.2}
              target={[0, 0, 0]}
            />
            
            {/* 3D City Grid */}
            <CityGrid
              grid={grid}
              onCellClick={handleCellClick}
              gridSize={GRID_SIZE}
            />
          </Suspense>
        </Canvas>

        {/* Overlay Info */}
        <div className="absolute top-4 right-4 space-y-3">
          <Card className="p-3 bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white">
              <Info className="w-4 h-4" />
              <div className="text-sm">
                <div>Click cubes to build • Drag to rotate • Scroll to zoom</div>
                <div className="text-xs text-gray-300 mt-1">Cities need roads, power & water to grow!</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <div className="text-white text-sm">
              <div className="font-medium mb-1">3D Isometric View</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>• Building height shows type & importance</div>
                <div>• Yellow spheres = population</div>
                <div>• Blue spheres = high energy</div>
                <div>• Buildings evolve based on neighbors</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CitySimulator