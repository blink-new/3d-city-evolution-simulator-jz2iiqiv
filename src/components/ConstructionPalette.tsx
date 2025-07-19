import React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Home, Building, Factory, Trees, Route, Zap, 
  Droplets, Cross, GraduationCap, Shield, Flame,
  Eraser
} from 'lucide-react'
import type { BuildingType } from './CitySimulator'

interface ConstructionPaletteProps {
  selectedTool: BuildingType
  onToolSelect: (tool: BuildingType) => void
}

const buildingTypes: Array<{
  type: BuildingType
  name: string
  icon: React.ReactNode
  description: string
  color: string
}> = [
  { type: 'empty', name: 'Erase', icon: <Eraser className="w-4 h-4" />, description: 'Remove buildings', color: 'bg-gray-500' },
  { type: 'residential', name: 'Residential', icon: <Home className="w-4 h-4" />, description: 'Houses & apartments', color: 'bg-green-500' },
  { type: 'commercial', name: 'Commercial', icon: <Building className="w-4 h-4" />, description: 'Shops & offices', color: 'bg-blue-500' },
  { type: 'industrial', name: 'Industrial', icon: <Factory className="w-4 h-4" />, description: 'Factories & warehouses', color: 'bg-yellow-500' },
  { type: 'park', name: 'Park', icon: <Trees className="w-4 h-4" />, description: 'Green spaces', color: 'bg-green-400' },
  { type: 'road', name: 'Road', icon: <Route className="w-4 h-4" />, description: 'Transportation', color: 'bg-gray-400' },
  { type: 'power', name: 'Power Plant', icon: <Zap className="w-4 h-4" />, description: 'Energy generation', color: 'bg-red-500' },
  { type: 'water', name: 'Water Tower', icon: <Droplets className="w-4 h-4" />, description: 'Water supply', color: 'bg-cyan-500' },
  { type: 'hospital', name: 'Hospital', icon: <Cross className="w-4 h-4" />, description: 'Healthcare', color: 'bg-pink-500' },
  { type: 'school', name: 'School', icon: <GraduationCap className="w-4 h-4" />, description: 'Education', color: 'bg-purple-500' },
  { type: 'police', name: 'Police', icon: <Shield className="w-4 h-4" />, description: 'Law enforcement', color: 'bg-blue-700' },
  { type: 'fire', name: 'Fire Station', icon: <Flame className="w-4 h-4" />, description: 'Emergency services', color: 'bg-red-600' }
]

const ConstructionPalette: React.FC<ConstructionPaletteProps> = ({ selectedTool, onToolSelect }) => {
  return (
    <Card className="p-4 bg-slate-700 border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4">Construction Tools</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {buildingTypes.map((building) => (
          <Button
            key={building.type}
            variant={selectedTool === building.type ? "default" : "outline"}
            className={`h-auto p-3 flex flex-col items-center gap-2 text-xs ${
              selectedTool === building.type 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                : 'bg-slate-600 hover:bg-slate-500 text-gray-200 border-slate-500'
            }`}
            onClick={() => onToolSelect(building.type)}
          >
            <div className={`w-8 h-8 rounded-full ${building.color} flex items-center justify-center text-white`}>
              {building.icon}
            </div>
            <div className="text-center">
              <div className="font-medium">{building.name}</div>
              <div className="text-xs opacity-75">{building.description}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-800 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Evolution Rules</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Empty cells spawn with 3 neighbors</div>
          <div>• Buildings die with &lt;2 or &gt;3 neighbors</div>
          <div>• Buildings age and grow over time</div>
          <div>• Population and energy fluctuate</div>
        </div>
      </div>
    </Card>
  )
}

export default ConstructionPalette