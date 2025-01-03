import { ImagePlus, Trash } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
interface ImageUploaderProps {
  disabled?: boolean
  onChange: (url: string) => void
  onRemove: (url: string) => void
  value: string[]
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    onChange(result.info.secure_url)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        {value?.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
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
              src={url}
              alt="Uploaded image"
            />
          </div>
        ))}
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
              Uplaod an Image
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUploader

{
  /* <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
          <div className="z-10 absolute top-2 right-2">
            <Button
              type="button"
              onClick={() => onRemove()}
              variant={"destructive"}
              size="icon"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Image
            fill
            className="object-cover"
            src={url}
            //   layout="fill"
            //   objectFit="cover"
            alt="Uploaded image"
          />
        </div>
      </div> */
}
