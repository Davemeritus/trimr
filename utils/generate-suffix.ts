import { z } from "zod";
import { shortenLinkSchema } from "@/schemas";
import isCustomSuffixInUse from "@/utils/check-custom-suffix";
import ErrorWithStatus from "@/Exception/custom-error";

const generateUniqueLink = async ({
  link,
  customSuffix,
}: z.infer<typeof shortenLinkSchema>): Promise<string> => {
  let isUnique: boolean = true;
  if (customSuffix) {
    isUnique = await isCustomSuffixInUse(customSuffix);
    if (isUnique) {
      throw new ErrorWithStatus("Custom suffix already in use", 400);
    }
    return `${customSuffix}`;
  }

  let suffix: string = "";
  console.log("Generating unique link");

  while (isUnique) {
    suffix = "";
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 5; i++) {
      suffix += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    isUnique = await isCustomSuffixInUse(suffix);
  }
  return suffix;
};

export default generateUniqueLink;
