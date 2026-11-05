export const toTradeDto = (trade) => ({
  id: trade._id.toString(),
  name: trade.name,
  stock: trade.stock,
  shares: trade.shares,
  pricePerShare: trade.pricePerShare,
  totalSpent: trade.totalSpent,
});
