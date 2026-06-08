export default function FaqSkeletonItem() {
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 flex-1 rounded" />
        <div className="skeleton h-4 w-4 rounded shrink-0" />
      </div>
    </div>
  )
}
