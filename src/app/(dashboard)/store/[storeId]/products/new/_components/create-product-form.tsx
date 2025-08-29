"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
// Removed StoredFile import - now using UploadedFile from hook
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { addProduct } from "@/lib/actions/product"
import { getErrorMessage } from "@/lib/handle-error"
import {
  type getCategories,
  type getSubcategories,
} from "@/lib/queries/product"
import {
  createProductSchema,
  type CreateProductSchema,
} from "@/lib/validations/product"
import { usePocketbaseUpload } from "@/hooks/use-pocketbase-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { PocketbaseFiles } from "@/components/pocketbase-files"
import { Icons } from "@/components/icons"

interface CreateProductFormProps {
  storeId: string
  promises: Promise<{
    categories: Awaited<ReturnType<typeof getCategories>>
    subcategories: Awaited<ReturnType<typeof getSubcategories>>
  }>
}

export function CreateProductForm({
  storeId,
  promises,
}: CreateProductFormProps) {
  const { categories, subcategories } = React.use(promises)
  const router = useRouter()

  const [loading, setLoading] = React.useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const { uploadFiles, progresses, uploadedFiles, isUploading, clearFiles, removeFile } =
    usePocketbaseUpload({ maxFiles: 4, maxFileSize: 4 * 1024 * 1024 })

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      inventory: NaN,
      categoryId: "",
      subcategoryId: "",
      images: [],
    },
  })

  async function onSubmit(input: CreateProductSchema) {
    setLoading(true)

    try {
      // Upload files first if any
      let filesToUpload = uploadedFiles
      if (input.images && input.images.length > 0) {
        filesToUpload = await uploadFiles(input.images)
      }

      const result = await addProduct(storeId, {
        ...input,
        images: filesToUpload,
      })

      if (result?.success) {
        form.reset()
        clearFiles()
        router.push(`/store/${storeId}/products`)
        toast.success("Product added successfully!")
      } else {
        toast.error(result?.error || "Failed to add product")
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-2xl gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Type product name here." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type product description here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value: typeof field.value) =>
                    field.onChange(value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className="capitalize"
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Subcategory</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {subcategories.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Type product price here."
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Type product inventory here."
                    value={Number.isNaN(field.value) ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <div className="space-y-6">
                <FormItem className="w-full">
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Upload files</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Upload files</DialogTitle>
                          <DialogDescription>
                            Drag and drop your files here or click to browse.
                          </DialogDescription>
                        </DialogHeader>
                        <FileUploader
                          value={field.value ?? []}
                          onValueChange={(files) => {
                            field.onChange(files)
                          }}
                          onUpload={async (files) => {
                            await uploadFiles(files)
                            field.onChange([]) // Clear form field
                            setIsUploadDialogOpen(false) // Close dialog
                            toast.success(`${files.length} file(s) uploaded successfully`)
                          }}
                          maxFiles={4}
                          maxSize={4 * 1024 * 1024}
                          progresses={progresses}
                          disabled={isUploading}
                        />
                      </DialogContent>
                    </Dialog>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                {uploadedFiles.length > 0 ? (
                  <PocketbaseFiles files={uploadedFiles} onRemove={removeFile} />
                ) : null}
              </div>
            )}
          />
        <Button
          onClick={() =>
            void form.trigger(["name", "description", "price", "inventory"])
          }
          className="w-fit"
          disabled={loading}
        >
          {loading && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Add Product
          <span className="sr-only">Add Product</span>
        </Button>
      </form>
    </Form>
  )
}
