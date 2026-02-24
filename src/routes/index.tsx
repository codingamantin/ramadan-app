import { RamadanTest } from '@/components/RamadanTest'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <RamadanTest />
}
