import React from 'react'
import GenreContainer from './_components/genre-container'

const GenrePage = ({ params }: { params: { id: string }}) => {
  return (
    <div>
      <GenreContainer id={params.id}/>
    </div>
  )
}

export default GenrePage
