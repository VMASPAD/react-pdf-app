import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import './assets/index.css'
import Start from './components/Versions'
import Editor from './components/Editor'
function App(): JSX.Element {
  return (
    <>
      <Tabs defaultValue="Inicio" className="w-screen">
        <TabsList>
          <TabsTrigger value="Inicio">Inicio</TabsTrigger>
          <TabsTrigger value="Editor">Editor</TabsTrigger>
        </TabsList>
        <TabsContent value="Inicio" className="border-red-400 border-2 h-screen">
          <Start />
        </TabsContent>
        <TabsContent value="Editor"><Editor /></TabsContent>
      </Tabs>
    </>
  )
}

export default App
