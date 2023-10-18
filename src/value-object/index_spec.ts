import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, addProjectConfiguration } from "@nx/devkit";

import { valueObject } from ".";
import { OptionsSchema } from "../core/options-schema";

describe("value-object generator", () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(tree, "project-name", {
      root: "root",
      sourceRoot: "src-root",
      projectType: "application",
    });
  });

  it("should generate files", async () => {
    const options: OptionsSchema = { name: "file-name" };
    await valueObject(tree, options);

    const expectedFiles = [
      "src-root/file-name/index.ts",
      "src-root/file-name/is-file-name-props.ts",
      "src-root/file-name/file-name-props.ts",
      "src-root/file-name/file-name.ts",
    ];

    expect(expectedFiles.every((file) => tree.exists(file))).toBe(true);
  });

  it("should generate files with path", async () => {
    const options: OptionsSchema = { name: "file-name", path: "custom" };
    await valueObject(tree, options);

    const expectedFiles = [
      "src-root/custom/file-name/index.ts",
      "src-root/custom/file-name/is-file-name-props.ts",
      "src-root/custom/file-name/file-name-props.ts",
      "src-root/custom/file-name/file-name.ts",
    ];

    expect(expectedFiles.every((file) => tree.exists(file))).toBe(true);
  });

  it("should generate files with path and flat", async () => {
    const options: OptionsSchema = {
      name: "file-name",
      path: "custom",
      flat: true,
    };
    await valueObject(tree, options);

    const expectedFiles = [
      "src-root/file-name/index.ts",
      "src-root/file-name/is-file-name-props.ts",
      "src-root/file-name/file-name-props.ts",
      "src-root/file-name/file-name.ts",
    ];

    expect(expectedFiles.every((file) => tree.exists(file))).toBe(true);
  });
});
