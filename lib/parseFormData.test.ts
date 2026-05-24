import { validateWithZod } from "@/utils/validation";
import { describe, expect, it } from "vitest";
import { parseFormData } from "./parseFormData";
import { PostFormValues, postSchema } from "./zod/schemas/postSchema";
describe("parseFormData", () => {
  it("images만 배열로 추출한다", () => {
    const fd = new FormData();
    fd.append("title", "test");
    fd.append("images", new File([], "test.jpg"));
    fd.append("studyId", "1");
    fd.append("content", "test");
    const result = parseFormData(fd, { arrayKeys: ["images"] });
    const result2 = validateWithZod(postSchema, result);
    console.log("parseFormData 결과:", result);
    console.log("Zod 결과:", result2);
    expect(result2.success).toBe(true);
    if (result2.success && result2.data) {
      expect((result2.data as PostFormValues).title).toBe("test");
      expect((result2.data as PostFormValues).studyId).toBe(1);
      expect((result2.data as PostFormValues).content).toBe("test");
      expect((result2.data as PostFormValues).images).toHaveLength(1);
    }
  });
});
