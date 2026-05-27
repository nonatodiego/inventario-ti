import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

import {
  Settings,
  Home,
  FileText,
  BarChart3,
} from 'lucide-react';

export function Navigation() {

  return (

    <nav className="bg-white border-b border-gray-200 shadow-sm">

      <div className="container py-4">

        <div className="flex justify-between items-center">

          <div className="flex items-center gap-8">

            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700"
            >
               Inventário de TI - iTracker
            </Link>

            <div className="flex gap-1">

              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>

              {/*<Link href="/licenses">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Licenças
                </Button>
              </Link>*/}

              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>

            </div>

          </div>

        </div>

      </div>

    </nav>
  );
}