import * as React from "react"
import Image from "next/image"
import { Cross2Icon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { type UploadedFile } from "@/hooks/use-pocketbase-upload"

interface PocketbaseFilesProps {
  files: UploadedFile[]
  onRemove?: (fileName: string) => void
}

export function PocketbaseFiles({ files, onRemove }: PocketbaseFilesProps) {
  if (!files.length) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {files.map((file) => (
        <div
          key={file.name}
          className="relative overflow-hidden rounded-lg border bg-background p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {file.type.startsWith("image/") ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded">
                    <Image
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                    <span className="text-xs font-medium">
                      {file.type.split("/")[1]?.toUpperCase() ?? "FILE"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemove(file.name)}
              >
                <Cross2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}