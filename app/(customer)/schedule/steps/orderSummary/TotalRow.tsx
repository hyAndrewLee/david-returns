export const TotalRow = ({ amount }: { amount: number }) => (
  <div className="border-t border-border pt-3 mt-3">
    <div className="flex justify-between text-base">
      <span className="font-semibold text-foreground">Total</span>
      <span className={`font-semibold ${amount === 0 ? "text-emerald-600" : "text-foreground"}`}>
        {amount === 0 ? "FREE" : `$${amount.toFixed(2)}`}
      </span>
    </div>
  </div>
)
