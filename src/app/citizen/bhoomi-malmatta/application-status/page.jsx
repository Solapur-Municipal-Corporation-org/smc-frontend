"use client"

import CitizenBhoomiAuthBridge from "@/features/bhoomi-malmatta/context/CitizenBhoomiAuthBridge"
import ApplicationStatusPage from "@/features/bhoomi-malmatta/legacy-pages/ApplicationStatusPage"
import "@/features/bhoomi-malmatta/index.css"

export default function CitizenApplicationStatusPage() {
  return (
    <CitizenBhoomiAuthBridge>
      <div className="bhoomi-malmatta"><ApplicationStatusPage /></div>
    </CitizenBhoomiAuthBridge>
  )
}