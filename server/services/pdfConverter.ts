import { execFile } from "child_process";
import * as fs from "fs/promises";
import { promisify } from "util";
import { ENV } from "../_core/env";

const execFileAsync = promisify(execFile);

export async function convertMarkdownToPdf(
  markdownPath: string,
  pdfPath: string
): Promise<void> {
  const converterCmd = ENV.pdfConverterCmd.trim();

  if (!converterCmd) {
    throw new Error("PDF_CONVERTER_CMD is not configured");
  }

  await execFileAsync(converterCmd, [markdownPath, pdfPath]);
  await fs.access(pdfPath);
}
