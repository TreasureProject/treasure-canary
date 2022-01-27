import Image from "next/image";
import { generateIpfsLink } from "../utils";

type ImageWrapperProps = Pick<
  JSX.IntrinsicElements["img"],
  "aria-hidden" | "className" | "height" | "width"
> & {
  src?: string;
  token: {
    name?: string | null;
    image?: string | null;
  };
};

export default function ImageWrapper({
  src,
  token,
  ...props
}: ImageWrapperProps) {
  return (
    <Image
      alt=""
      src={src ?? (token.image?.includes("ipfs") ? generateIpfsLink(token.image) : token.image ?? "")}
      layout={Boolean(props.width) ? undefined : "fill"}
      {...props}
    />
  );
}
