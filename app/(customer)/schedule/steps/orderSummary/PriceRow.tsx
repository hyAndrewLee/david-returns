type PriceRowProps = { label: React.ReactNode; value: React.ReactNode }

export const PriceRow = ({ label, value }: PriceRowProps) => (
  <div className="flex justify-between">
    {label}
    {value}
  </div>
)
