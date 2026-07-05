import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import moment from 'moment-timezone'

export const IST_TIMEZONE = 'Asia/Kolkata'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return moment(date).tz(IST_TIMEZONE).format('DD MMM YYYY, hh:mm A')
}

export function formatDateShort(date: Date | string): string {
  return moment(date).tz(IST_TIMEZONE).format('DD MMM YYYY')
}
