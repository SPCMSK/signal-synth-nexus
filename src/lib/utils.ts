// Utilidades generales para el simulador SimuMod Pro
// ---------------------------------------------------
// Este archivo contiene funciones auxiliares reutilizables en toda la aplicación.
//
// 1. cn(...): Combinador de clases CSS para Tailwind y clsx
// 2. formatNumber(...): Formatea números para visualización didáctica
// 3. isValidNumber(...): Valida números para entradas de usuario

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales y resuelve conflictos de Tailwind.
 * Útil para componer clases dinámicamente en componentes React.
 *
 * @example
 *   <div className={cn('p-2', isActive && 'bg-green-500', 'text-sm')} />
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número para mostrarlo con separador de miles y decimales fijos.
 * @param value Número a formatear
 * @param decimals Cantidad de decimales (default: 2)
 * @returns String formateado
 * @example
 *   formatNumber(12345.6789) // '12,345.68'
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Valida si un valor es un número finito y no NaN.
 * @param value Valor a validar
 * @returns true si es un número válido
 * @example
 *   isValidNumber(5) // true
 *   isValidNumber(NaN) // false
 */
export function isValidNumber(value: any): boolean {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
}
