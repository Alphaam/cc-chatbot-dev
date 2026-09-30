import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Downloads",
  description: "Download the editable Texas Digital Opportunity Hub slides.",
}

const files = [
  {
    name: "Texas Digital Opportunity Hub",
    detail: "4 editable slides, PowerPoint, 16:9",
    href: "/presentation/texas-digital-opportunity-hub.pptx",
    filename: "texas-digital-opportunity-hub.pptx",
  },
]

export default function DownloadsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 font-sans text-foreground">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <h1 className="text-3xl font-semibold text-balance">Downloads</h1>
        <ul className="flex flex-col gap-4">
          {files.map((file) => (
            <li
              key={file.href}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-5"
            >
              <div className="flex flex-col gap-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.detail}</p>
              </div>
              <a
                href={file.href}
                download={file.filename}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
