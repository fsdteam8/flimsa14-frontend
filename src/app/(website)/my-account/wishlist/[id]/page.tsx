import React from 'react'
import WishListViewDetails from './_components/wishlist-view-details'

const WishListPageDetailsPage = ({params}:{params:{id:string}}) => {
  return (
    <div>
      <WishListViewDetails wishListId={params.id}/>
    </div>
  )
}

export default WishListPageDetailsPage
