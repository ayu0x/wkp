/**
 * Utility functions for formatting numbers in the application
 */

/**
 * Formats a number to a readable string with appropriate precision
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted string
 */
export function formatNumber(
  value: number | string,
  options: {
    maxDecimals?: number
    minDecimals?: number
    compact?: boolean
    significantDigits?: number
  } = {},
): string {
  const { maxDecimals = 6, minDecimals = 0, compact = false, significantDigits } = options

  // Convert to number if string
  const num = typeof value === "string" ? Number.parseFloat(value) : value

  // Handle NaN, null, undefined
  if (isNaN(num) || num === null || num === undefined) {
    return "0"
  }

  // Handle zero
  if (num === 0) {
    return "0"
  }

  // For very large numbers, use compact notation
  if (compact && Math.abs(num) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(num)
  }

  // For very small non-zero numbers, use scientific notation
  if (Math.abs(num) > 0 && Math.abs(num) < 0.0001) {
    return num.toExponential(4)
  }

  // If significantDigits is specified, use it
  if (significantDigits !== undefined) {
    return num.toPrecision(significantDigits)
  }

  // Otherwise use standard formatting with min/max decimals
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(num)
}

/**
 * Formats a token balance for display
 * @param balance The balance to format
 * @param decimals The number of decimals for the token
 * @returns Formatted balance string
 */
export function formatTokenBalance(
  balance: string | number,
  options: {
    decimals?: number
    compact?: boolean
  } = {},
): string {
  const { decimals = 18, compact = true } = options

  // Convert string to number if needed
  let numBalance: number
  if (typeof balance === "string") {
    // Handle empty or invalid strings
    if (!balance || balance === "0") return "0"

    try {
      numBalance = Number.parseFloat(balance)
    } catch (e) {
      return "0"
    }
  } else {
    numBalance = balance
  }

  // Format based on size
  if (numBalance >= 1_000_000 && compact) {
    return formatNumber(numBalance, { compact: true })
  } else if (numBalance >= 1) {
    return formatNumber(numBalance, { maxDecimals: 4, minDecimals: 2 })
  } else if (numBalance >= 0.0001) {
    return formatNumber(numBalance, { maxDecimals: 6, minDecimals: 2 })
  } else if (numBalance > 0) {
    return numBalance.toExponential(4)
  } else {
    return "0"
  }
}

/**
 * Formats a price ratio for display
 * @param ratio The ratio to format
 * @returns Formatted ratio string
 */
export function formatRatio(ratio: number): string {
  if (ratio === 0) return "0"

  if (ratio > 1_000_000) {
    return formatNumber(ratio, { significantDigits: 6, compact: true })
  } else if (ratio < 0.000001 && ratio > 0) {
    return ratio.toExponential(4)
  } else {
    return formatNumber(ratio, { maxDecimals: 6 })
  }
}

/**
 * Truncates a long number string for display
 * @param value The number string to truncate
 * @param maxLength Maximum length before truncating
 * @returns Truncated string
 */
export function truncateNumber(value: string, maxLength = 10): string {
  if (!value) return "0"

  // If it's already short enough, return as is
  if (value.length <= maxLength) return value

  // Check if it contains a decimal point
  const decimalIndex = value.indexOf(".")

  if (decimalIndex === -1) {
    // No decimal point, use compact notation
    return formatNumber(Number.parseFloat(value), { compact: true })
  } else {
    // Has decimal point
    const integerPart = value.substring(0, decimalIndex)

    // If integer part is already long, use compact notation
    if (integerPart.length >= maxLength - 2) {
      return formatNumber(Number.parseFloat(value), { compact: true })
    }

    // Otherwise truncate the decimal part
    const availableLength = maxLength - integerPart.length - 1 // -1 for the decimal point
    const decimalPart = value.substring(decimalIndex + 1, decimalIndex + 1 + availableLength)

    return `${integerPart}.${decimalPart}`
  }
}
