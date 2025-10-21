import Image from 'next/image'
import React from 'react'

const reelsData = [
  {
    id: 1,
    image : "/assets/images/reels1.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 2,
    image : "/assets/images/reels2.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 3,
    image : "/assets/images/reels1.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 4,
    image : "/assets/images/reels2.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 5,
    image : "/assets/images/reels1.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 6,
    image : "/assets/images/reels2.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 7,
    image : "/assets/images/reels1.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
  {
    id: 8,
    image : "/assets/images/reels2.png",
    name : "Pushpa",
    director : "Action / Drama",
  },
]

const ReelsContainer = () => {
  return (
    <div className='container mx-auto py-10'>
      <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-[120%] pb-4 md:pb-6 lg:pb-8'>Reels</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10'>
        {
          reelsData?.map((reel)=>{
            return <div key={reel.id} className='relative'>
              <Image src={reel.image} alt={reel.name} width={300} height={300} className='w-full h-[320px] object-cover rounded-[10px]'/>
             <div className='absolute bottom-3 left-0 right-0'>
               <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-white leading-[120%] text-center'>{reel.name}</h3>
              <p className='text-base md:text-lg font-normal text-gray-400 leading-[120%] text-center'>{reel.director}</p>
             </div>
            </div>
          })
        }
      </div>
    </div>
  )
}

export default ReelsContainer
