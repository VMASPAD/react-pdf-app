import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import './assets/index.css'
import Start from './components/Start'
import Editor from './components/Editor'
import { Button } from '@/components/ui/button'
import './components/app.css'
import { FaHome } from 'react-icons/fa'

type Tab = {
  id: string
  name: string
  content: JSX.Element
}

function App(): JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'Inicio', name: 'Inicio', content: <Start /> }])
  const [activeTab, setActiveTab] = useState<string>('Inicio')

  const handleAddTab = () => {
    const newTabId = `Editor-${tabs.length}` // Unique id for each new tab
    setTabs([
      ...tabs,
      {
        id: newTabId,
        name: `Editor ${tabs.length}`,
        content: <Editor />
      }
    ])
    setActiveTab(newTabId) // Automatically switch to the new tab
  }

  const handleRemoveTab = (tabId: string) => {
    const filteredTabs = tabs.filter((tab) => tab.id !== tabId)
    setTabs(filteredTabs)

    if (activeTab === tabId && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0].id)
    } else if (filteredTabs.length === 0) {
      setActiveTab('') // No active tab if all are closed
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="flex flex-col"
          >
            <TabsList className="bg-white z-20 flex items-center gap-2 justify-start px-4 h-10 sticky top-0">
              {tabs.map((tab) => (
                <div key={tab.id} className="flex items-center tab-properties">
                  <TabsTrigger
                    value={tab.id}
                    className={`h-10 px-3 py-1 flex items-center tab-properties ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                  >
                    {tab.id === 'Inicio' ? (
                      <FaHome
                        className="w-5 h-5"
                        style={{ color: activeTab === tab.id ? 'white' : 'black' }}
                      />
                    ) : (
                      tab.name
                    )}
                  </TabsTrigger>
                  {tab.id !== 'Inicio' && (
                    <Button
                      size="sm"
                      className="ml-1 text-red-500 bg-gray-300 shadow-none "
                      onClick={() => handleRemoveTab(tab.id)}
                    >
                      x
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" className="ml-4" onClick={handleAddTab}>
                +
              </Button>
            </TabsList>
            <div className="w-full h-4 bg-gray-300 fixed mt-10"></div>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="h-full overflow-y-auto">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <div className="w-full"></div>
      </div>
    </div>
  )
}

export default App
