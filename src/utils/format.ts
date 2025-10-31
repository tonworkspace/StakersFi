// Format large numbers with appropriate suffixes
export const formatLargeNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const suffixes = [
    { value: 1e72, symbol: 'Q' }, // Quintillion
    { value: 1e69, symbol: 'Q' }, // Quadrillion
    { value: 1e66, symbol: 'Q' }, // Quintillion
    { value: 1e63, symbol: 'V' }, // Vigintillion
    { value: 1e60, symbol: 'N' }, // Novemdecillion
    { value: 1e57, symbol: 'O' }, // Octodecillion
    { value: 1e54, symbol: 'S' }, // Septendecillion
    { value: 1e51, symbol: 'S' }, // Sedecillion
    { value: 1e48, symbol: 'Q' }, // Quindecillion
    { value: 1e45, symbol: 'Q' }, // Quattuordecillion
    { value: 1e42, symbol: 'T' }, // Tredecillion
    { value: 1e39, symbol: 'D' }, // Duodecillion
    { value: 1e36, symbol: 'U' }, // Undecillion
    { value: 1e33, symbol: 'D' }, // Decillion
    { value: 1e30, symbol: 'N' }, // Nonillion
    { value: 1e27, symbol: 'O' }, // Octillion
    { value: 1e24, symbol: 'S' }, // Septillion
    { value: 1e21, symbol: 'S' }, // Sextillion
    { value: 1e18, symbol: 'Q' }, // Quintillion
    { value: 1e15, symbol: 'Q' }, // Quadrillion
    { value: 1e12, symbol: 'T' }, // Trillion
    { value: 1e9, symbol: 'B' },  // Billion
    { value: 1e6, symbol: 'M' },  // Million
    { value: 1e3, symbol: 'K' }   // Thousand
  ];

  for (const suffix of suffixes) {
    if (num >= suffix.value) {
      const formatted = (num / suffix.value).toFixed(2);
      // Remove trailing zeros after decimal
      const cleanFormatted = formatted.replace(/\.?0+$/, '');
      return `${cleanFormatted}${suffix.symbol}`;
    }
  }

  // For numbers less than 1000, just return the number
  return num.toFixed(2).replace(/\.?0+$/, '');
};

// Format token amounts specifically for display
export const formatTokenAmount = (amount: number, decimals: number = 2): string => {
  if (amount === 0) return '0';
  
  // For very large numbers, use scientific notation with better formatting
  if (amount >= 1e15) {
    const exp = Math.floor(Math.log10(amount));
    const mantissa = amount / Math.pow(10, exp);
    return `${mantissa.toFixed(2)} × 10^${exp}`;
  }
  
  // For large but manageable numbers, use the suffix system
  if (amount >= 1e6) {
    return formatLargeNumber(amount);
  }
  
  // For smaller numbers, use regular formatting
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}; 