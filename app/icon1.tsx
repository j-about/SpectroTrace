import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default async function Icon1() {
  const iconPath = join(process.cwd(), "public", "icon.jpg");
  const iconBuffer = await readFile(iconPath);
  const base64Image = iconBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires native img element
    <img
      src={dataUrl}
      alt="Icon"
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
