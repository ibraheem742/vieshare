import * as React from "react"
import { toast } from "sonner"

import { pb } from "@/lib/pocketbase"
import { getErrorMessage } from "@/lib/handle-error"

interface UseUploadFileProps {
  maxFiles?: number
  maxFileSize?: number // in bytes
}

export interface UploadedFile {
  file: File
  name: string
  size: number
  type: string
}

export function usePocketbaseUpload({ 
  maxFiles = 4, 
  maxFileSize = 4 * 1024 * 1024 // 4MB default
}: UseUploadFileProps = {}) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [progresses, setProgresses] = React.useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = React.useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`
    }
    
    if (!file.type.startsWith('image/')) {
      return `File ${file.name} is not an image`
    }
    
    return null
  }

  const uploadFiles = React.useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    if (files.length === 0) return []
    
    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return []
    }

    // Validate all files first
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return []
      }
    }

    setIsUploading(true)
    
    try {
      const uploadedFiles: UploadedFile[] = []
      
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update progress
        setProgresses(prev => ({
          ...prev,
          [file!.name]: 0
        }))
        
        // Create uploaded file object
        const uploadedFile: UploadedFile = {
          file: file!,
          name: file!.name,
          size: file!.size,
          type: file!.type
        }
        
        uploadedFiles.push(uploadedFile)
        
        // Simulate progress for better UX
        setProgresses(prev => ({
          ...prev,
          [file!.name]: 100
        }))
      }
      
      setUploadedFiles(prev => [...prev, ...uploadedFiles])
      return uploadedFiles
      
    } catch (error) {
      toast.error(getErrorMessage(error))
      return []
    } finally {
      setProgresses({})
      setIsUploading(false)
    }
  }, [maxFiles, maxFileSize])

  const removeFile = React.useCallback((fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
  }, [])

  const clearFiles = React.useCallback(() => {
    setUploadedFiles([])
  }, [])

  return {
    uploadedFiles,
    progresses,
    uploadFiles,
    isUploading,
    removeFile,
    clearFiles,
  }
}