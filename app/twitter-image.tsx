import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "SpectroTrace";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function TwitterImage() {
  const imagePath = join(process.cwd(), "public", "icon.jpg");
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  return new ImageResponse(
    <img
      src={dataUrl}
      alt={alt}
      width={size.width}
      height={size.height}
      style={{
        width: "100%",
        height: "100%",
      }}
    />,
    {
      ...size,
    },
  );
}
