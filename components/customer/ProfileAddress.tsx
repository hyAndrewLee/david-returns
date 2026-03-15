"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useProfile } from "@/app/(customer)/profile/ProfileContext"

export const ProfileAddress = () => {
  const { formData, setFormData } = useProfile()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Default Pickup Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address</Label>
          <Input
            id="streetAddress"
            value={formData.streetAddress}
            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
            placeholder="123 Main St"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="apt">Apt / Suite (optional)</Label>
            <Input
              id="apt"
              value={formData.apt}
              onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
              placeholder="Apt 4B"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buildingName">Building Name (optional)</Label>
            <Input
              id="buildingName"
              value={formData.buildingName}
              onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
              placeholder="The Towers"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="10001"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Delivery Notes (optional)</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Leave at front desk, call when arriving, etc."
          />
        </div>
      </CardContent>
    </Card>
  )
}
