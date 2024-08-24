import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

function Start(): JSX.Element {
  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:1000/getFolders')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex h-screen">
      <div className="border-r-green-600 border-2 w-52 flex flex-col items-center">
        <ul className="flex flex-col items-center w-full overflow-auto">
          <li className="mb-10 bg-slate-400 w-full text-center">Recientes</li>
          <li className="mb-10 w-full text-center">Herramientas</li>
          <li className="mb-10 w-full text-center">Preferencias</li>
          <li className="mb-10 w-full text-center">Anotaciones</li>
        </ul>
      </div>

      <div className="flex flex-col w-full h-full">
        <div className="flex flex-row border-b-green-600 border-2 p-10 gap-10 w-full">
          <Input className="w-60" />
          <Button>1</Button>
          <Button>2</Button>
        </div>
        <div className="p-10">
          <Collapsible className="w-[350px] space-y-2">
            {data.map((item, index) => (
              <>
                <CollapsibleTrigger key={index}><p className='text-red-400'>{item.toUpperCase()}</p></CollapsibleTrigger><br />
                <CollapsibleContent>{item}</CollapsibleContent>
              </>
            ))}
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
export default Start
