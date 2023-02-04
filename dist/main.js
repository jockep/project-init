"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_console_1 = __importDefault(require("node:console"));
const node_process_1 = require("node:process");
const promises_1 = require("node:readline/promises");
const cliInterface = (0, promises_1.createInterface)({ input: node_process_1.stdin, output: node_process_1.stdout });
node_console_1.default.read = (msg) => cliInterface.question(msg);
node_console_1.default.close = () => cliInterface.close();
async function createPackageJson() {
    const dependencies = {};
    const devDependencies = {};
    const packageJson = {};
    packageJson.name = await node_console_1.default.read('Name: ');
    packageJson.description = await node_console_1.default.read('Description: ');
    packageJson.version = await node_console_1.default.read('Version: ');
    await addNPMPackages(['typescript', 'ts-node', '@types/node'], devDependencies);
    packageJson.devDependencies = devDependencies;
    packageJson.dependencies = dependencies;
    node_console_1.default.log(JSON.stringify(packageJson, null, 4));
    // await writeFile('package-dev.json', JSON.stringify(packageJson, null, '\t'));
}
async function addNPMPackages(packages, dependencyObject) {
    packages = packages.sort();
    for (const p of packages) {
        await addNPMPackage(p, dependencyObject);
    }
}
async function addNPMPackage(name, dependencyObject) {
    const request = await axios_1.default.get(`https://registry.npmjs.org/${name}`);
    const data = request.data;
    dependencyObject[data.name] = `^${data['dist-tags'].latest}`;
}
async function main() {
    await createPackageJson();
    await addNPMPackage('jockescoolapaket', {});
    node_console_1.default.close();
}
main();
