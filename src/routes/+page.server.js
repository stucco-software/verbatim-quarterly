import { getVolumes } from '$lib/content.js'

export const load = async () => {
  const volumes = await getVolumes()
  return {
    volumes
  }
}