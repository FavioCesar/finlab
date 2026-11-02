// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CompoundInterestCalculator } from './CompoundInterestCalculator'
import { CompoundInterestPractice } from './CompoundInterestPractice'
import { ModulePage } from './ModulePage'
import { modules } from '../data/modules'

afterEach(cleanup)

describe('interfaz de Matemáticas Financieras', () => {
  it('navega entre Aprender, Practicar y Analizar', () => {
    render(<ModulePage module={modules[0]} />)
    expect(screen.getByText('¿Qué es el interés compuesto?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /practicar/i }))
    expect(screen.getByText('Dificultad Básica')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /analizar/i }))
    expect(screen.getByText('Calculadora de interés compuesto')).toBeTruthy()
  })

  it('calcula VF y muestra el resultado', () => {
    render(<CompoundInterestCalculator />)
    fireEvent.change(screen.getByLabelText('Valor presente (VP)'), { target: { value: '1000' } })
    fireEvent.change(screen.getByLabelText('Tasa por período (%)'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Número de períodos'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calcular Valor futuro' }))
    expect(screen.getAllByText(/1\.210,00/).length).toBeGreaterThan(0)
    expect(screen.getByText('Capitalización período a período')).toBeTruthy()
  })

  it('muestra validación de calculadora con campos incompletos', () => {
    render(<CompoundInterestCalculator />)
    fireEvent.click(screen.getByRole('button', { name: 'Calcular Valor futuro' }))
    expect(screen.getByRole('alert').textContent).toContain('Completa todos los campos solicitados.')
  })

  it('muestra pista, corrección y procedimiento en un ejercicio', () => {
    render(<CompoundInterestPractice />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver pista' }))
    expect(screen.getByText('Usa VF = VP × (1 + i)ⁿ.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Tu respuesta/), { target: { value: '1100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText('Aún no es correcto.')).toBeTruthy()
    expect(screen.getByText('Procedimiento completo')).toBeTruthy()
  })
})
