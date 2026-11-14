import { HttpTypes } from "@medusajs/types"
import { imagenGenerica } from "@lib/tienda"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  // Handle del producto: si no tiene fotos, se muestra la imagen genérica
  // (ver lib/tienda.ts).
  seed?: string | null
}

const ImageGallery = ({ images, seed }: ImageGalleryProps) => {
  const conUrl = images.filter((i) => !!i.url)

  if (conUrl.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-biobackup-paper">
        {seed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagenGenerica(seed)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-biobackup-navy/15 via-transparent to-transparent" />
      </div>
    )
  }

  const [principal, ...resto] = conUrl

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl bg-biobackup-paper"
        id={principal.id}
      >
        <Image
          src={principal.url}
          priority
          className="absolute inset-0"
          alt="Imagen del producto 1"
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          style={{ objectFit: "cover" }}
        />
      </div>
      {resto.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {resto.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-biobackup-paper"
              id={image.id}
            >
              <Image
                src={image.url}
                className="absolute inset-0"
                alt={`Imagen del producto ${index + 2}`}
                fill
                sizes="140px"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
