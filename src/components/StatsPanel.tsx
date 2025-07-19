import React, { useMemo } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { BarChart3, Users, Zap, Building } from 'lucide-react'
import type { CellData, BuildingType } from './CitySimulator'

interface StatsPanelProps {
  grid: CellData[][]
}

const StatsPanel: React.FC<StatsPanelProps> = ({ grid }) => {
  const stats = useMemo(() => {
    let totalPopulation = 0
    let totalEnergy = 0
    let totalBuildings = 0
    const buildingCounts: Record<BuildingType, number> = {
      empty: 0, residential: 0, commercial: 0, industrial: 0,
      park: 0, road: 0, power: 0, water: 0,
      hospital: 0, school: 0, police: 0, fire: 0
    }

    grid.forEach(row => {
      row.forEach(cell => {
        buildingCounts[cell.type]++
        if (cell.type !== 'empty') {
          totalBuildings++
          totalPopulation += cell.population
          totalEnergy += cell.energy
        }
      })
    })

    const totalCells = grid.length * grid[0].length
    const occupancyRate = (totalBuildings / totalCells) * 100
    const avgPopulation = totalBuildings > 0 ? totalPopulation / totalBuildings : 0
    const avgEnergy = totalBuildings > 0 ? totalEnergy / totalBuildings : 0

    return {
      totalPopulation,
      totalEnergy,
      totalBuildings,
      occupancyRate,
      avgPopulation,
      avgEnergy,
      buildingCounts
    }
  }, [grid])

  const topBuildingTypes = useMemo(() => {
    return Object.entries(stats.buildingCounts)
      .filter(([type]) => type !== 'empty')
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [stats.buildingCounts])

  return (
    <Card className="p-4 bg-slate-700 border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        City Statistics
      </h3>
      
      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-300">Population</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.totalPopulation.toLocaleString()}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300">Energy</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.totalEnergy.toLocaleString()}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-300">Buildings</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.totalBuildings}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-300">Occupancy</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.occupancyRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Avg Population</span>
              <span>{stats.avgPopulation.toFixed(0)}</span>
            </div>
            <Progress value={Math.min(stats.avgPopulation, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Avg Energy</span>
              <span>{stats.avgEnergy.toFixed(0)}</span>
            </div>
            <Progress value={Math.min(stats.avgEnergy, 100)} className="h-2" />
          </div>
        </div>

        {/* Top Building Types */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Building Distribution</h4>
          <div className="space-y-2">
            {topBuildingTypes.map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                <Badge variant="secondary" className="bg-slate-600 text-white">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default StatsPanel