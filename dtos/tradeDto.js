export function toTradeDto(trade) {
  return {
    name: trade.name,
    stocks: trade.stocks,
    shares: trade.shares,
    pricePerShare: trade.pricePerShare,
    totalSpent: trade.totalSpent,
  };
}
