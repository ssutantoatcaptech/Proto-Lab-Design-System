"use client"

import * as React from "react"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/registry/proto-lab/ui/pagination"

const total = 10

export default function PaginationDemo() {
  const [page, setPage] = React.useState(2)
  const go = (next: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setPage(Math.min(total, Math.max(1, next)))
  }
  const pages = [...new Set([1, page - 1, page, page + 1, total])].filter((n) => n >= 1 && n <= total)

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">Findings {page * 10 - 9} to {page * 10} of {total * 10}</p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page === 1} />
          </PaginationItem>
          {pages.map((n, i) => (
            <React.Fragment key={n}>
              {i > 0 && n - pages[i - 1] > 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationLink href="#" isActive={page === n} onClick={go(n)}>{n}</PaginationLink>
              </PaginationItem>
            </React.Fragment>
          ))}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page === total} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
