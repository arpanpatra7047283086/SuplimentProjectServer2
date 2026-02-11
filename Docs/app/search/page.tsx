import { Suspense } from "react"
import { SearchPageContent } from "./search-content"

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  )
}
