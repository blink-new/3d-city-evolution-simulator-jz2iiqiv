import type { BuildingType, CellData } from '../components/CitySimulator'

const GRID_SIZE = 20

export interface EvolutionContext {
  grid: CellData[][]
  x: number
  y: number
  neighbors: CellData[]
  nearbyBuildings: Map<BuildingType, number>
  resources: {
    power: number
    water: number
    happiness: number
    pollution: number
  }
}

// SimCity-style evolution rules
export const evolveCity = (grid: CellData[][]): CellData[][] => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
  
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const context = createEvolutionContext(grid, x, y)
      const newCell = evolveCellSimCity(grid[x][y], context)
      newGrid[x][y] = newCell
    }
  }
  
  return newGrid
}

const createEvolutionContext = (grid: CellData[][], x: number, y: number): EvolutionContext => {
  const neighbors = getNeighbors(grid, x, y)
  const nearbyBuildings = getNearbyBuildingCounts(grid, x, y, 3) // 3-cell radius
  
  // Calculate local resources
  const resources = {
    power: calculatePowerSupply(nearbyBuildings),
    water: calculateWaterSupply(nearbyBuildings),
    happiness: calculateHappiness(nearbyBuildings),
    pollution: calculatePollution(nearbyBuildings)
  }
  
  return {
    grid,
    x,
    y,
    neighbors,
    nearbyBuildings,
    resources
  }
}

const evolveCellSimCity = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources, nearbyBuildings } = context
  
  // Age all buildings
  const newCell = { ...cell, age: cell.age + 1 }
  
  switch (cell.type) {
    case 'empty':
      return evolveEmptyLand(newCell, context)
    
    case 'residential':
      return evolveResidential(newCell, context)
    
    case 'commercial':
      return evolveCommercial(newCell, context)
    
    case 'industrial':
      return evolveIndustrial(newCell, context)
    
    case 'park':
      return evolvePark(newCell, context)
    
    case 'road':
      return evolveRoad(newCell, context)
    
    case 'power':
    case 'water':
    case 'hospital':
    case 'school':
    case 'police':
    case 'fire':
      return evolveServiceBuilding(newCell, context)
    
    default:
      return newCell
  }
}

const evolveEmptyLand = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources, nearbyBuildings } = context
  
  // Natural growth based on nearby development
  const residentialNearby = nearbyBuildings.get('residential') || 0
  const commercialNearby = nearbyBuildings.get('commercial') || 0
  const roadNearby = nearbyBuildings.get('road') || 0
  
  // Roads enable development
  if (roadNearby === 0) return cell
  
  // Residential growth in areas with good conditions
  if (residentialNearby > 0 && resources.power > 50 && resources.water > 50 && resources.happiness > 30) {
    if (Math.random() < 0.15) { // 15% chance per generation
      return {
        type: 'residential',
        age: 0,
        population: Math.floor(Math.random() * 30) + 10,
        energy: 80
      }
    }
  }
  
  // Commercial growth near residential areas
  if (residentialNearby >= 2 && commercialNearby < 3 && resources.power > 40) {
    if (Math.random() < 0.10) { // 10% chance
      return {
        type: 'commercial',
        age: 0,
        population: Math.floor(Math.random() * 20) + 5,
        energy: 70
      }
    }
  }
  
  // Industrial growth in less populated areas
  if (residentialNearby < 2 && resources.power > 60 && resources.water > 40) {
    if (Math.random() < 0.08) { // 8% chance
      return {
        type: 'industrial',
        age: 0,
        population: Math.floor(Math.random() * 40) + 20,
        energy: 90
      }
    }
  }
  
  return cell
}

const evolveResidential = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources, nearbyBuildings } = context
  
  // Check if basic needs are met
  const hasRoad = (nearbyBuildings.get('road') || 0) > 0
  const hasPower = resources.power > 30
  const hasWater = resources.water > 30
  const pollution = resources.pollution
  const happiness = resources.happiness
  
  // Abandon if basic needs not met
  if (!hasRoad || !hasPower || !hasWater || pollution > 80) {
    if (Math.random() < 0.20) { // 20% chance to abandon
      return {
        type: 'empty',
        age: 0,
        population: 0,
        energy: 0
      }
    }
  }
  
  // Population growth/decline based on conditions
  let populationChange = 0
  
  if (happiness > 60 && pollution < 40) {
    populationChange = Math.floor(Math.random() * 10) + 2 // Growth
  } else if (happiness < 30 || pollution > 70) {
    populationChange = -(Math.floor(Math.random() * 8) + 1) // Decline
  } else {
    populationChange = Math.floor(Math.random() * 6) - 2 // Slight variation
  }
  
  const newPopulation = Math.max(0, Math.min(200, cell.population + populationChange))
  
  // Energy based on population and conditions
  const energyChange = happiness > 50 ? 5 : -3
  const newEnergy = Math.max(0, Math.min(100, cell.energy + energyChange))
  
  return {
    ...cell,
    population: newPopulation,
    energy: newEnergy
  }
}

const evolveCommercial = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources, nearbyBuildings } = context
  
  const residentialNearby = nearbyBuildings.get('residential') || 0
  const hasRoad = (nearbyBuildings.get('road') || 0) > 0
  const hasPower = resources.power > 40
  
  // Commercial needs customers (residential) and infrastructure
  if (!hasRoad || !hasPower || residentialNearby === 0) {
    if (Math.random() < 0.15) {
      return {
        type: 'empty',
        age: 0,
        population: 0,
        energy: 0
      }
    }
  }
  
  // Business success based on nearby population
  const customerBase = residentialNearby * 20 // Rough estimate
  const businessSuccess = Math.min(100, customerBase + resources.happiness - resources.pollution)
  
  const populationChange = businessSuccess > 60 ? 
    Math.floor(Math.random() * 8) + 1 : 
    -(Math.floor(Math.random() * 5))
  
  const newPopulation = Math.max(0, Math.min(150, cell.population + populationChange))
  const newEnergy = Math.max(0, Math.min(100, cell.energy + (businessSuccess > 50 ? 3 : -2)))
  
  return {
    ...cell,
    population: newPopulation,
    energy: newEnergy
  }
}

const evolveIndustrial = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources, nearbyBuildings } = context
  
  const hasRoad = (nearbyBuildings.get('road') || 0) > 0
  const hasPower = resources.power > 50
  const hasWater = resources.water > 40
  
  // Industrial needs good infrastructure
  if (!hasRoad || !hasPower || !hasWater) {
    if (Math.random() < 0.12) {
      return {
        type: 'empty',
        age: 0,
        population: 0,
        energy: 0
      }
    }
  }
  
  // Industrial growth is steady but creates pollution
  const productionEfficiency = Math.min(100, resources.power + resources.water - 20)
  
  const populationChange = productionEfficiency > 60 ? 
    Math.floor(Math.random() * 6) + 2 : 
    Math.floor(Math.random() * 4) - 1
  
  const newPopulation = Math.max(0, Math.min(180, cell.population + populationChange))
  const newEnergy = Math.max(0, Math.min(100, cell.energy + (productionEfficiency > 50 ? 4 : -1)))
  
  return {
    ...cell,
    population: newPopulation,
    energy: newEnergy
  }
}

const evolvePark = (cell: CellData, context: EvolutionContext): CellData => {
  // Parks are stable and improve over time if maintained
  const newEnergy = Math.min(100, cell.energy + 2)
  
  return {
    ...cell,
    energy: newEnergy,
    population: 0 // Parks don't have population
  }
}

const evolveRoad = (cell: CellData, context: EvolutionContext): CellData => {
  const { nearbyBuildings } = context
  
  // Roads degrade with heavy use
  const totalTraffic = Array.from(nearbyBuildings.values()).reduce((sum, count) => sum + count, 0)
  
  const degradation = totalTraffic > 8 ? -2 : -1
  const newEnergy = Math.max(20, Math.min(100, cell.energy + degradation))
  
  return {
    ...cell,
    energy: newEnergy,
    population: 0
  }
}

const evolveServiceBuilding = (cell: CellData, context: EvolutionContext): CellData => {
  const { resources } = context
  
  // Service buildings need power and maintenance
  const hasPower = resources.power > 30
  
  if (!hasPower) {
    // Reduce effectiveness without power
    return {
      ...cell,
      energy: Math.max(0, cell.energy - 10)
    }
  }
  
  // Maintain or improve service quality
  const newEnergy = Math.min(100, cell.energy + 1)
  
  return {
    ...cell,
    energy: newEnergy
  }
}

// Helper functions
const getNeighbors = (grid: CellData[][], x: number, y: number): CellData[] => {
  const neighbors: CellData[] = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        neighbors.push(grid[nx][ny])
      }
    }
  }
  return neighbors
}

const getNearbyBuildingCounts = (grid: CellData[][], x: number, y: number, radius: number): Map<BuildingType, number> => {
  const counts = new Map<BuildingType, number>()
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        const buildingType = grid[nx][ny].type
        counts.set(buildingType, (counts.get(buildingType) || 0) + 1)
      }
    }
  }
  
  return counts
}

const calculatePowerSupply = (nearbyBuildings: Map<BuildingType, number>): number => {
  const powerPlants = nearbyBuildings.get('power') || 0
  const powerDemand = (nearbyBuildings.get('residential') || 0) * 10 + 
                     (nearbyBuildings.get('commercial') || 0) * 15 + 
                     (nearbyBuildings.get('industrial') || 0) * 25
  
  const powerSupply = powerPlants * 100
  return Math.max(0, Math.min(100, (powerSupply / Math.max(1, powerDemand)) * 100))
}

const calculateWaterSupply = (nearbyBuildings: Map<BuildingType, number>): number => {
  const waterTowers = nearbyBuildings.get('water') || 0
  const waterDemand = (nearbyBuildings.get('residential') || 0) * 8 + 
                     (nearbyBuildings.get('commercial') || 0) * 12 + 
                     (nearbyBuildings.get('industrial') || 0) * 20
  
  const waterSupply = waterTowers * 80
  return Math.max(0, Math.min(100, (waterSupply / Math.max(1, waterDemand)) * 100))
}

const calculateHappiness = (nearbyBuildings: Map<BuildingType, number>): number => {
  let happiness = 50 // Base happiness
  
  // Positive factors
  happiness += (nearbyBuildings.get('park') || 0) * 15
  happiness += (nearbyBuildings.get('school') || 0) * 10
  happiness += (nearbyBuildings.get('hospital') || 0) * 8
  happiness += (nearbyBuildings.get('police') || 0) * 5
  happiness += (nearbyBuildings.get('fire') || 0) * 5
  happiness += (nearbyBuildings.get('commercial') || 0) * 3
  
  // Negative factors
  happiness -= (nearbyBuildings.get('industrial') || 0) * 8
  happiness -= Math.max(0, (nearbyBuildings.get('residential') || 0) - 5) * 2 // Overcrowding
  
  return Math.max(0, Math.min(100, happiness))
}

const calculatePollution = (nearbyBuildings: Map<BuildingType, number>): number => {
  let pollution = 0
  
  pollution += (nearbyBuildings.get('industrial') || 0) * 20
  pollution += (nearbyBuildings.get('power') || 0) * 15
  pollution += (nearbyBuildings.get('commercial') || 0) * 5
  pollution += (nearbyBuildings.get('road') || 0) * 3
  
  // Parks reduce pollution
  pollution -= (nearbyBuildings.get('park') || 0) * 10
  
  return Math.max(0, Math.min(100, pollution))
}