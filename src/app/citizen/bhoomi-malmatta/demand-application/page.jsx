"use client"

import CitizenBhoomiAuthBridge from "@/features/bhoomi-malmatta/context/CitizenBhoomiAuthBridge"
import DemandApplicationPage from "@/features/bhoomi-malmatta/legacy-pages/DemandApplicationPage"
import "@/features/bhoomi-malmatta/index.css"

export default function CitizenDemandApplicationPage() {
  return (
    <CitizenBhoomiAuthBridge>
      <div className="bhoomi-malmatta"><DemandApplicationPage /></div>
    </CitizenBhoomiAuthBridge>
  )
}