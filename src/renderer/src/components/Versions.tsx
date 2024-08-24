import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'

function Start(): JSX.Element {
  return (
    <div className="flex h-screen">
      <div className="border-r-green-600 border-2 w-52 flex flex-col items-center">
        <ul className="flex flex-col items-center w-full overflow-auto">
          <li className='mb-10 bg-slate-400 w-full text-center'>Recientes</li>
          <li className='mb-10 w-full text-center'>Herramientas</li>
          <li className='mb-10 w-full text-center'>Preferencias</li>
          <li className='mb-10 w-full text-center'>Anotaciones</li>
        </ul>
      </div>

      <div className="flex flex-col w-full h-full">
        <div className="flex flex-row border-b-green-600 border-2 p-10 gap-10 w-full">
          <Input className='w-60'/>
          <Button>1</Button>
          <Button>2</Button>
        </div>
        <div className="flex flex-row w-full p-10 gap-4">
        <Toggle><a href={`/editor`}>Your Name</a></Toggle>
          <Toggle>Carpeta</Toggle>
          <Toggle>Carpeta</Toggle>
          <Toggle>Carpeta</Toggle>
          <Toggle>Carpeta</Toggle>
        </div>
      </div>
    </div>
  )
}

export default Start
