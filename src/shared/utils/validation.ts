// Form validation utilities

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== ''
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} ist erforderlich`]
  }
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  return {
    isValid,
    errors: isValid ? [] : ['Bitte geben Sie eine gültige E-Mail-Adresse ein']
  }
}

export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url)
    return { isValid: true, errors: [] }
  } catch {
    return { isValid: false, errors: ['Bitte geben Sie eine gültige URL ein'] }
  }
}

export const validateLength = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult => {
  const length = value?.length || 0
  const isValid = length >= min && length <= max
  
  if (!isValid) {
    if (length < min) {
      return {
        isValid: false,
        errors: [`${fieldName} muss mindestens ${min} Zeichen lang sein`]
      }
    } else {
      return {
        isValid: false,
        errors: [`${fieldName} darf maximal ${max} Zeichen lang sein`]
      }
    }
  }
  
  return { isValid: true, errors: [] }
}

export const validateDate = (date: string): ValidationResult => {
  const parsedDate = new Date(date)
  const isValid = !isNaN(parsedDate.getTime())
  return {
    isValid,
    errors: isValid ? [] : ['Bitte geben Sie ein gültiges Datum ein']
  }
}

export const validateTime = (time: string): ValidationResult => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  const isValid = timeRegex.test(time)
  return {
    isValid,
    errors: isValid ? [] : ['Bitte geben Sie eine gültige Uhrzeit ein (HH:MM)']
  }
}

export const validateNumber = (
  value: number, 
  min?: number, 
  max?: number, 
  fieldName: string = 'Wert'
): ValidationResult => {
  const errors: string[] = []
  
  if (isNaN(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} muss eine gültige Zahl sein`]
    }
  }
  
  if (min !== undefined && value < min) {
    errors.push(`${fieldName} muss mindestens ${min} sein`)
  }
  
  if (max !== undefined && value > max) {
    errors.push(`${fieldName} darf maximal ${max} sein`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Combine multiple validation results
export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors)
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

// Event-specific validations
export const validateEventDates = (startDate: string, endDate: string): ValidationResult => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start > end) {
    return {
      isValid: false,
      errors: ['Das Enddatum darf nicht vor dem Startdatum liegen']
    }
  }
  
  return { isValid: true, errors: [] }
}

export const validateEventTimes = (
  startTime: string, 
  endTime: string, 
  isSameDay: boolean
): ValidationResult => {
  if (!isSameDay) {
    return { isValid: true, errors: [] }
  }
  
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes
  
  if (startTotalMinutes >= endTotalMinutes) {
    return {
      isValid: false,
      errors: ['Die Endzeit muss nach der Startzeit liegen']
    }
  }
  
  return { isValid: true, errors: [] }
} 