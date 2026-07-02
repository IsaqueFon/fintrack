/**
 * Formata um valor numérico para a moeda brasileira (R$).
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata um valor numérico para representação percentual.
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

/**
 * Formata uma string de data (YYYY-MM-DD ou ISO) para o formato brasileiro DD/MM/YYYY.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Ajuste de fuso horário para evitar problemas com fuso local
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  // Se a data for inválida, retorna o valor original formatado se possível
  if (isNaN(date.getTime())) {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      return dateString;
    }
    return dateString;
  }
  
  return new Intl.DateTimeFormat('pt-BR').format(utcDate);
};
