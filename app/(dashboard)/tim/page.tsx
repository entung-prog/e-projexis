'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Mail } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tim</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Undang Anggota
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Anggota Tim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'MEMBER' },
                { name: 'Bob Wilson', email: 'bob@example.com', role: 'MEMBER' }
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Undang Anggota Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Fitur ini akan segera tersedia. Anda akan dapat mengundang anggota tim baru melalui email.
            </p>
            <Button disabled className="w-full">
              Segera Hadir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}