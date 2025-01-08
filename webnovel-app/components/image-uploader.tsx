import { ImagePlus, Trash } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "./ui/button"

interface ImageUploaderProps {
  disabled?: boolean
  onChange: (url: string) => void
  onRemove: () => void
  value: string | null
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const allowedFormats = ["jpg", "jpeg", "png"]
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    if (result.info.bytes > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.")
      return
    }

    if (!allowedFormats.includes(result.info.format)) {
      toast.error("Image file must be a PNG, JPG or JPEG.")
      return
    }
    onChange(result.info.secure_url)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-center">
        {value && (
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
            <Image
              fill
              sizes="200px"
              className="object-cover"
              src={value}
              alt="Uploaded image"
            />
          </div>
        )}
      </div>

      <CldUploadWidget onSuccess={onUpload} uploadPreset="stroyCovers">
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
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an Image
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUploader
