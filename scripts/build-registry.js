const path = require("path");

const buildAsset = require("./build-asset");

const { readFile } = require("./shared");

const PKG_DIR = path.join(__dirname, "../");
const REGISTRY_DIR = path.join(PKG_DIR, "node_modules", "@walletconnect", "mobile-registry");

const registryLoader = input => {
  const array = JSON.parse(input.toString("utf8"));
  return Promise.all(
    array.map(async entry => {
      const buffer = await readFile(path.join(REGISTRY_DIR, entry.logo));
      const ext = path.extname(entry.logo).replace(".", "");
      const logo = `data:image/${ext};base64,${buffer.toString("base64")}`;
      return { ...entry, logo };
    }),
  );
};

console.log(``);
console.log("------------------------------------------------log");
console.log(`REGISTRY_DIR:`, REGISTRY_DIR);
console.log(`----------------------`);

buildAsset({
  assetDir: REGISTRY_DIR,
  assetFile: "registry.json",
  targetFile: "registry.ts",
  targetVar: "MOBILE_REGISTRY",
  loader: registryLoader,
});
