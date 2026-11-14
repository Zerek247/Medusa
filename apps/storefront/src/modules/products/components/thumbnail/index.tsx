import { Container, clx } from "@modules/common/components/ui"
import { imagenGenerica } from "@lib/tienda"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  // Si el producto no tiene foto, con `seed` (su handle) se muestra una
  // imagen genérica en vez del ícono vacío. Ver lib/tienda.ts.
  seed?: string | null
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  seed,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden bg-biobackup-paper rounded-2xl",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} seed={seed} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  seed,
}: Pick<ThumbnailProps, "size" | "seed"> & { image?: string }) => {
  if (image) {
    return (
      <Image
        src={image}
        alt="Producto"
        className="absolute inset-0 object-cover object-center"
        draggable={false}
        quality={50}
        sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
        fill
      />
    )
  }

  if (seed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagenGenerica(seed)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
    )
  }

  return (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
