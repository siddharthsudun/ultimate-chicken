// Delivery serviceability. We currently only deliver in Hyderabad (500xxx / 501xxx pincodes).
export const SERVICE_AREA = 'Hyderabad'

export function isServiceable(pincode: string): boolean {
  return /^50[01]\d{3}$/.test((pincode || '').trim())
}
