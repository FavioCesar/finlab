export type CalculationMode = 'futureValue' | 'presentValue' | 'interestRate' | 'periods'

export interface CompoundInterestInput {
  mode: CalculationMode
  presentValue?: number
  futureValue?: number
  rate?: number
  periods?: number
}

export interface CompoundInterestResult {
  mode: CalculationMode
  value: number
  formula: string
  substitution: string
  interpretation: string
}

export interface CapitalRow { period: number; initialCapital: number; interest: number; accumulatedCapital: number }
export interface CompoundGrowthScenario { presentValue: number; futureValue: number; rate: number; periods: number; schedule: CapitalRow[] }
export const MAX_SCHEDULE_POINTS = 240

const assertPositive = (value: number | undefined, label: string) => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) throw new Error(`${label} debe ser un número mayor que cero.`)
  return value
}
const assertRate = (value: number | undefined) => {
  if (value === undefined || !Number.isFinite(value)) throw new Error('La tasa de interés debe ser un número válido.')
  if (value <= -1) throw new Error('La tasa de interés debe ser mayor a -100%.')
  return value
}
const assertPeriods = (value: number | undefined) => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) throw new Error('El número de períodos debe ser mayor que cero.')
  return value
}
const percent = (rate: number) => `${(rate * 100).toLocaleString('es-BO', { maximumFractionDigits: 6 })}%`
const amount = (value: number) => value.toLocaleString('es-BO', { maximumFractionDigits: 6 })

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { mode } = input
  if (mode === 'futureValue') {
    const presentValue = assertPositive(input.presentValue, 'El valor presente')
    const rate = assertRate(input.rate)
    const periods = assertPeriods(input.periods)
    const value = presentValue * (1 + rate) ** periods
    return { mode, value, formula: 'VF = VP × (1 + i)ⁿ', substitution: `VF = ${amount(presentValue)} × (1 + ${percent(rate)})^${periods} = ${amount(value)}`, interpretation: `Una inversión de ${amount(presentValue)} crecerá hasta ${amount(value)} después de ${periods} período(s), con una tasa de ${percent(rate)} por período.` }
  }
  if (mode === 'presentValue') {
    const futureValue = assertPositive(input.futureValue, 'El valor futuro')
    const rate = assertRate(input.rate)
    const periods = assertPeriods(input.periods)
    const value = futureValue / (1 + rate) ** periods
    return { mode, value, formula: 'VP = VF ÷ (1 + i)ⁿ', substitution: `VP = ${amount(futureValue)} ÷ (1 + ${percent(rate)})^${periods} = ${amount(value)}`, interpretation: `Necesitas invertir hoy ${amount(value)} para alcanzar ${amount(futureValue)} en ${periods} período(s), con una tasa de ${percent(rate)} por período.` }
  }
  if (mode === 'interestRate') {
    const presentValue = assertPositive(input.presentValue, 'El valor presente')
    const futureValue = assertPositive(input.futureValue, 'El valor futuro')
    const periods = assertPeriods(input.periods)
    const value = (futureValue / presentValue) ** (1 / periods) - 1
    return { mode, value, formula: 'i = (VF ÷ VP)^(1/n) − 1', substitution: `i = (${amount(futureValue)} ÷ ${amount(presentValue)})^(1/${periods}) − 1 = ${percent(value)}`, interpretation: `Para que ${amount(presentValue)} se convierta en ${amount(futureValue)} en ${periods} período(s), se requiere una tasa compuesta de ${percent(value)} por período.` }
  }
  const presentValue = assertPositive(input.presentValue, 'El valor presente')
  const futureValue = assertPositive(input.futureValue, 'El valor futuro')
  const rate = assertRate(input.rate)
  if (rate === 0) throw new Error('No se puede determinar un número de períodos con una tasa de 0%, salvo que los valores sean iguales.')
  const value = Math.log(futureValue / presentValue) / Math.log(1 + rate)
  if (!Number.isFinite(value) || value <= 0) throw new Error('Los datos no producen un número de períodos positivo.')
  return { mode, value, formula: 'n = ln(VF ÷ VP) ÷ ln(1 + i)', substitution: `n = ln(${amount(futureValue)} ÷ ${amount(presentValue)}) ÷ ln(1 + ${percent(rate)}) = ${amount(value)}`, interpretation: `Se requieren ${amount(value)} período(s) para que ${amount(presentValue)} alcance ${amount(futureValue)} a una tasa de ${percent(rate)} por período.` }
}

/** Construye una trayectoria de capital solo cuando las cuatro variables pueden deducirse. */
export function buildCompoundGrowthScenario(input: CompoundInterestInput): CompoundGrowthScenario {
  const calculation = calculateCompoundInterest(input)
  const presentValue = input.mode === 'presentValue' ? calculation.value : assertPositive(input.presentValue, 'El valor presente')
  const futureValue = input.mode === 'futureValue' ? calculation.value : assertPositive(input.futureValue, 'El valor futuro')
  const rate = input.mode === 'interestRate' ? calculation.value : assertRate(input.rate)
  const periods = input.mode === 'periods' ? calculation.value : assertPeriods(input.periods)
  const periodSamples = createPeriodSamples(periods)
  const schedule: CapitalRow[] = periodSamples.map((period, index) => {
    const previousPeriod = index === 0 ? 0 : periodSamples[index - 1]
    const initialCapital = index === 0 ? presentValue : presentValue * (1 + rate) ** previousPeriod
    const accumulatedCapital = presentValue * (1 + rate) ** period
    return { period, initialCapital, interest: index === 0 ? 0 : accumulatedCapital - initialCapital, accumulatedCapital }
  })
  return { presentValue, futureValue, rate, periods, schedule }
}

/** Devuelve períodos representativos, preservando siempre el período final exacto. */
export function createPeriodSamples(periods: number, maxPoints = MAX_SCHEDULE_POINTS): number[] {
  const safeMaxPoints = Math.max(2, Math.floor(maxPoints))
  const fullPeriods = Math.floor(periods)
  const hasFraction = !Number.isInteger(periods)
  const totalNaturalPoints = fullPeriods + 1 + (hasFraction ? 1 : 0)
  if (totalNaturalPoints <= safeMaxPoints) {
    const allPeriods = Array.from({ length: fullPeriods + 1 }, (_, period) => period)
    return hasFraction ? [...allPeriods, periods] : allPeriods
  }
  const finalIndex = safeMaxPoints - 1
  return Array.from({ length: safeMaxPoints }, (_, index) => index === finalIndex ? periods : (periods * index) / finalIndex)
}
