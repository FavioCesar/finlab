import { describe, expect, it } from 'vitest'
import { buildCompoundGrowthScenario, calculateCompoundInterest, createPeriodSamples, MAX_SCHEDULE_POINTS } from './compoundInterest'

describe('calculateCompoundInterest', () => {
  it('calcula el valor futuro compuesto', () => expect(calculateCompoundInterest({ mode: 'futureValue', presentValue: 1000, rate: 0.1, periods: 2 }).value).toBeCloseTo(1210))
  it('calcula el valor presente compuesto', () => expect(calculateCompoundInterest({ mode: 'presentValue', futureValue: 1210, rate: 0.1, periods: 2 }).value).toBeCloseTo(1000))
  it('calcula la tasa de interés', () => expect(calculateCompoundInterest({ mode: 'interestRate', presentValue: 1000, futureValue: 1210, periods: 2 }).value).toBeCloseTo(0.1))
  it('calcula los períodos', () => expect(calculateCompoundInterest({ mode: 'periods', presentValue: 1000, futureValue: 1210, rate: 0.1 }).value).toBeCloseTo(2))
  it('admite tasa cero para VF', () => expect(calculateCompoundInterest({ mode: 'futureValue', presentValue: 1000, rate: 0, periods: 5 }).value).toBe(1000))
  it('rechaza una tasa menor o igual a -100%', () => expect(() => calculateCompoundInterest({ mode: 'futureValue', presentValue: 1000, rate: -1, periods: 2 })).toThrow('mayor a -100%'))
  it('rechaza períodos inválidos', () => expect(() => calculateCompoundInterest({ mode: 'futureValue', presentValue: 1000, rate: 0.1, periods: 0 })).toThrow('períodos'))
  it('rechaza valores monetarios inválidos', () => expect(() => calculateCompoundInterest({ mode: 'presentValue', futureValue: 0, rate: 0.1, periods: 2 })).toThrow('mayor que cero'))
  it('rechaza entradas no numéricas', () => expect(() => calculateCompoundInterest({ mode: 'futureValue', presentValue: Number.NaN, rate: 0.1, periods: 2 })).toThrow('número mayor que cero'))
  it('genera la evolución de capital a partir de la misma lógica', () => {
    const scenario = buildCompoundGrowthScenario({ mode: 'futureValue', presentValue: 1000, rate: 0.1, periods: 2 })
    expect(scenario.schedule).toHaveLength(3)
    expect(scenario.schedule[1]).toMatchObject({ initialCapital: 1000, interest: 100, accumulatedCapital: 1100 })
    expect(scenario.schedule[2].accumulatedCapital).toBeCloseTo(1210)
  })
  it('incluye el período fraccionario final y su capital exacto', () => {
    const scenario = buildCompoundGrowthScenario({ mode: 'futureValue', presentValue: 1000, rate: 0.1, periods: 2.5 })
    expect(scenario.schedule.map(row => row.period)).toEqual([0, 1, 2, 2.5])
    expect(scenario.schedule.at(-1)?.accumulatedCapital).toBeCloseTo(1000 * 1.1 ** 2.5)
  })
  it('limita los puntos de la trayectoria sin omitir el período final', () => {
    const samples = createPeriodSamples(10000)
    expect(samples).toHaveLength(MAX_SCHEDULE_POINTS)
    expect(samples[0]).toBe(0)
    expect(samples.at(-1)).toBe(10000)
  })
})
