import Image from "next/image";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Richi's PET Stuff"
      width={size}
      height={size}
      priority
      style={{ width: "auto", height: "auto" }}
      className="rounded-lg"
    />
  );
}
