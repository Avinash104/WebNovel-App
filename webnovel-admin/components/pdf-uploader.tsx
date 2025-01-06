import { FilePlus, Trash } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "./ui/button"

interface PDFUploaderProps {
  disabled?: boolean
  onChange: (data: { pdfLink: string; thumbnail: string }) => void
  onRemove: () => void
  value: string | null
}

const PDFUploader: React.FC<PDFUploaderProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const allowedFormats = ["pdf"]
  const [isMounted, setIsMounted] = useState(false)
  const [thumbnailURL, setThumbnailURL] = useState<string>("")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const generateThumbnailUrl = (pdfUrl: string) => {
    return pdfUrl.replace(/\.pdf$/, ".jpg")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    if (result.info.bytes > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB. Please upload a smaller PDF.")
      return
    }

    if (!allowedFormats.includes(result.info.format)) {
      toast.error("Uploaded file must be a PDF.")
      return
    }

    const pdfLink = result.info.secure_url
    const thumbnail = generateThumbnailUrl(pdfLink)
    setThumbnailURL(thumbnail)
    onChange({ pdfLink, thumbnail })
  }

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-center">
        {value ? (
          <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={onRemove}
                variant={"destructive"}
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {/* Display a placeholder or PDF icon */}
            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
              <Image
                fill
                sizes="200px"
                className="object-cover"
                src={thumbnailURL}
                alt="Uploaded PDF"
              />
            </div>
          </div>
        ) : null}
      </div>

      <CldUploadWidget onSuccess={onUpload} uploadPreset="PDFuploads">
        {({ open }) => {
          const onClick = () => {
            open()
          }
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Upload a PDF
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default PDFUploader
