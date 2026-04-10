export const getCurrencySymbol = (currency) => {
  const symbols = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }
  return symbols[currency] || '$'
}
