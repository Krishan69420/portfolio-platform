export function SectionSkeleton() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <div className="h-3 w-20 skeleton rounded mx-auto mb-3" />
          <div className="h-8 w-64 skeleton rounded mx-auto mb-4" />
          <div className="h-4 w-96 skeleton rounded mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    </section>
  )
}
