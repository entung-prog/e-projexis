'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function CalendarPage() {
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  // Generate calendar days (simplified)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const calendarDays = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kalender</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium px-4">{currentMonth}</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`p-2 h-20 border border-gray-100 ${
                  day ? 'hover:bg-gray-50 cursor-pointer' : ''
                } ${
                  day === currentDate.getDate() ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {day && (
                  <div>
                    <div className="text-sm font-medium">{day}</div>
                    {/* Sample tasks */}
                    {day === 15 && (
                      <div className="mt-1">
                        <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate">
                          Meeting
                        </div>
                      </div>
                    )}
                    {day === 20 && (
                      <div className="mt-1">
                        <div className="text-xs bg-green-100 text-green-800 px-1 rounded truncate">
                          Deadline
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tugas Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Review Design System</h4>
                <p className="text-sm text-muted-foreground">15 April 2024</p>
              </div>
              <div className="text-sm text-muted-foreground">3 hari lagi</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Launch Website</h4>
                <p className="text-sm text-muted-foreground">20 April 2024</p>
              </div>
              <div className="text-sm text-muted-foreground">8 hari lagi</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}