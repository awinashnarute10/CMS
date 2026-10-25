import { apiClient } from './client'

export async function startSimulation() {
  return apiClient.get('/sim/start')
}

export async function stopSimulation() {
  return apiClient.get('/sim/stop')
}
