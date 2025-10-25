import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from './pagination'

interface PaginationProps {
  totalPages: number // Total number of pages
  currentPage: number // Current active page
  onPageChange: (page: number) => void // Callback for page change
}

const FilmsaPagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  // Helper to generate an array of page numbers
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        )
      }
    }
    return pages
  }

  const handlePageClick = (page: number | '...') => {
    if (page === '...' || page === currentPage) return
    onPageChange(page as number)
  }

  return (
    <Pagination className="">
      <PaginationContent className="flex items-center justify-end gap-2">
        <PaginationItem>
          <PaginationLink
            onClick={() => {
              if (currentPage === 1) {
                return
              } else handlePageClick(currentPage - 1)
            }}
            className={cn(
              'border border-primary hover:bg-primary cursor-pointer text-white  hover:text-white rounded-[4px]',
              currentPage === 1 &&
                'cursor-not-allowed bg-[#E3E3E3] text-black border-0  pointer-events-none'
            )}
          >
            <ChevronLeft
              className={cn('h-4 w-4', currentPage === 1 && 'text-[#B0B0B0]')}
            />
          </PaginationLink>
        </PaginationItem>

        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              onClick={() => handlePageClick(page)}
              className={cn(
                'border cursor-pointer border-[#525773] hover:bg-[rgb(66,69,230)] hover:text-white rounded-[4px]',
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'hover:bg-[rgb(66,69,230)] text-white hover:text-white'
              )}
            >
              {page === '...' ? '...' : page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            onClick={() => {
              if (totalPages === currentPage) {
                return
              } else {
                handlePageClick(currentPage + 1)
              }
            }}
            className={cn(
              'border border-[#525773] hover:bg-primary cursor-pointer  hover:text-white rounded-[4px]',
              currentPage === totalPages &&
                'cursor-not-allowed bg-[#E3E3E3] text-black border-0  pointer-events-none'
            )}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default FilmsaPagination
