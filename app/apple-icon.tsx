import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const iconPath = join(process.cwd(), "public", "icon.jpg");
  const iconBuffer = await readFile(iconPath);
  const base64Image = iconBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  return new ImageResponse(
    <img
      src={dataUrl}
      alt="Apple Icon"
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
