/**
 * Dynamic Pricing Engine
 * Calculates the effective price for a seat on a trip based on:
 * - Base price
 * - Demand factor (how full the bus is)
 * - Time-to-departure factor (last-minute surcharge / early-bird discount)
 * - Seat-level price multiplier (premium seats)
 */

export interface DynamicPricingConfig {
  peak_hour_factor: number       // e.g. 1.2  (20% up during peak hours)
  last_minute_factor: number     // e.g. 1.3  (30% up if < 6 hrs to departure)
  early_bird_factor: number      // e.g. 0.85 (15% off if > 7 days ahead)
  max_demand_factor: number      // e.g. 1.5  (50% up when nearly full)
  min_price: number              // e.g. 100
  max_price: number              // e.g. 5000
}

export const DEFAULT_PRICING_CONFIG: DynamicPricingConfig = {
  peak_hour_factor: 1.2,
  last_minute_factor: 1.3,
  early_bird_factor: 0.85,
  max_demand_factor: 1.5,
  min_price: 100,
  max_price: 5000,
}

export interface PricingInput {
  base_price: number
  departure_time: string | Date
  available_seats: number
  total_seats: number
  seat_price_multiplier?: number       // per-seat premium (e.g. 1.0 for normal, 1.2 for window)
  config?: Partial<DynamicPricingConfig>
}

export interface PricingResult {
  effective_price: number
  demand_factor: number
  time_factor: number
  is_last_minute: boolean
  is_early_bird: boolean
  is_peak_hour: boolean
  adjustment_reason: string
  discount_percentage: number   // negative means surcharge
}

/**
 * Calculates the effective price for a trip seat.
 */
export function calculateDynamicPrice(input: PricingInput): PricingResult {
  const cfg: DynamicPricingConfig = { ...DEFAULT_PRICING_CONFIG, ...input.config }
  const { base_price, available_seats, total_seats, departure_time, seat_price_multiplier = 1.0 } = input

  const now = new Date()
  const departure = new Date(departure_time)
  const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)

  // ── 1. Demand factor ──────────────────────────────────────────────────
  const bookedRatio = total_seats > 0 ? (total_seats - available_seats) / total_seats : 0
  let demandFactor = 1.0
  if (bookedRatio >= 0.9) {
    demandFactor = cfg.max_demand_factor              // > 90% full → max surge
  } else if (bookedRatio >= 0.75) {
    demandFactor = 1.0 + (cfg.max_demand_factor - 1.0) * 0.7   // 75-90% → 70% of max surge
  } else if (bookedRatio >= 0.5) {
    demandFactor = 1.0 + (cfg.max_demand_factor - 1.0) * 0.3   // 50-75% → 30% of max surge
  }

  // ── 2. Time-to-departure factor ───────────────────────────────────────
  let timeFactor = 1.0
  let isLastMinute = false
  let isEarlyBird = false
  let isPeakHour = false

  if (hoursUntilDeparture <= 6) {
    // Last-minute booking
    timeFactor = cfg.last_minute_factor
    isLastMinute = true
  } else if (hoursUntilDeparture >= 24 * 7) {
    // Early bird (> 7 days ahead)
    timeFactor = cfg.early_bird_factor
    isEarlyBird = true
  } else {
    // Check peak departure hours (6am-10am, 5pm-10pm)
    const departureHour = departure.getHours()
    if ((departureHour >= 6 && departureHour <= 10) || (departureHour >= 17 && departureHour <= 22)) {
      isPeakHour = true
      timeFactor = cfg.peak_hour_factor
    }
  }

  // ── 3. Effective price calculation ────────────────────────────────────
  let effectivePrice = base_price * demandFactor * timeFactor * seat_price_multiplier
  effectivePrice = Math.max(cfg.min_price, Math.min(cfg.max_price, effectivePrice))
  effectivePrice = Math.round(effectivePrice)

  // ── 4. Adjustment reason ─────────────────────────────────────────────
  const reasons: string[] = []
  if (isLastMinute) reasons.push('Last-minute booking surcharge')
  if (isEarlyBird) reasons.push('Early bird discount applied')
  if (isPeakHour) reasons.push('Peak hour pricing')
  if (demandFactor > 1.2) reasons.push(`High demand (${Math.round(bookedRatio * 100)}% full)`)
  if (seat_price_multiplier > 1.0) reasons.push(`Premium seat (${Math.round((seat_price_multiplier - 1) * 100)}% extra)`)

  const overallFactor = demandFactor * timeFactor * seat_price_multiplier
  const discountPercentage = Math.round((overallFactor - 1) * 100)

  return {
    effective_price: effectivePrice,
    demand_factor: Math.round(demandFactor * 100) / 100,
    time_factor: Math.round(timeFactor * 100) / 100,
    is_last_minute: isLastMinute,
    is_early_bird: isEarlyBird,
    is_peak_hour: isPeakHour,
    adjustment_reason: reasons.join('; ') || 'Standard pricing',
    discount_percentage: discountPercentage,
  }
}

/**
 * Formats the price with a currency symbol.
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Returns the pricing badge label for a trip.
 */
export function getPricingBadge(result: PricingResult): { label: string; color: 'success' | 'warning' | 'error' | 'info' } | null {
  if (result.is_early_bird) return { label: '🎉 Early Bird', color: 'success' }
  if (result.is_last_minute) return { label: '⚡ Last Minute', color: 'error' }
  if (result.is_peak_hour) return { label: '🔥 Peak Hours', color: 'warning' }
  if (result.demand_factor > 1.3) return { label: '🔴 High Demand', color: 'error' }
  if (result.demand_factor > 1.1) return { label: '🟡 Filling Fast', color: 'warning' }
  return null
}
