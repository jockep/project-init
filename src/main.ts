#!/usr/bin/env node
import { default as axios } from 'axios';
import console, { Console } from 'node:console';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { writeFile, mkdir } from 'node:fs/promises';
import chalk from 'chalk';
import type { Dependencies, PackageJson, Scripts, TSConfig } from './interfaces';

declare global {
    interface Console {
        read(input: string): Promise<string>,
        close(): void
    }
}

const cliInterface = createInterface({ input, output });
console.read = (msg) => cliInterface.question(msg);
console.close = () => cliInterface.close();

async function setupProjectFiles() {
    await mkdir('src');
    await writeFile('src/main.ts', '', 'utf-8');
}

async function createTSConfig() {
    const tsConfig: TSConfig = {
        compilerOptions: {
            target: 'es2020',
            rootDir: './src',
            outDir: './dist',
            module: 'commonjs',
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            strict: true
        }
    };

    await writeFile('tsconfig.json', JSON.stringify(tsConfig, null, '\t'));
}

async function createPackageJson() {
    const dependencies: Dependencies = {};
    const devDependencies: Dependencies = {};
    const packageJson: Partial<PackageJson> = {};
    const scripts: Scripts = {};

    packageJson.name = await console.read('Name: ');
    packageJson.description = await console.read('Description: ');
    packageJson.version = await console.read('Version: ');
    packageJson.author = await console.read('Author: ');
    packageJson.license = await console.read('License: ');
    packageJson.main = 'dist/main.js';
    scripts.start = 'yarn ts-node src/main.ts';

    await addNPMPackages(['typescript', 'ts-node', '@types/node'], devDependencies);

    const bundle = await console.read('Setup bundler? [Y/n]');

    if (bundle === '' || bundle === 'y' || bundle === 'Y') {
        await addNPMPackage('esbuild', devDependencies);
        packageJson.main = 'dist/main.bundle.js';
        scripts.bundle = 'yarn esbuild src/main.ts --bundle --outfile=dist/main.bundle.js --platform=node';
    }

    const deps = await console.read('Add dependencies separated by space eg. <typescript axios>: ');

    if (deps.length > 0) {
        for (const d of deps.split(' ')) {
            if (d.length > 0 && d.replace(/\s+/g, '').length > 0) {
                await addNPMPackage(d, dependencies);
            }
        }
    }

    const devDeps = await console.read('Add devDependencies separated by space eg. <react svelte>: ');

    if (deps.length > 0) {
        for (const d of devDeps.split(' ')) {
            if (d.length > 0 && d.replace(/\s+/g, '').length > 0) {
                await addNPMPackage(d, devDependencies);
            }
        }
    }

    packageJson.dependencies = dependencies;
    packageJson.devDependencies = devDependencies;
    packageJson.scripts = scripts;

    await writeFile('package.json', JSON.stringify(packageJson, null, '\t'));
}

async function addNPMPackages(packages: string[], dependencyObject: Dependencies): Promise<void> {
    packages = packages.sort();
    for (const p of packages) {
        await addNPMPackage(p, dependencyObject);
    }
}

async function addNPMPackage(name: string, dependencyObject: Dependencies): Promise<void> {
    try {
        const request = await axios.get(`https://registry.npmjs.org/${name}`);
        const data = request.data;
        dependencyObject[data.name] = `^${data['dist-tags'].latest}`;
        console.log(chalk.green(`${data.name} found adding version: ${data['dist-tags'].latest} to package.json...`))
    } catch (e) {
        console.log(chalk.red(`${name} was not found.`));
    }
}

async function main() {
    await createPackageJson();
    console.log(chalk.blue('package.json created...'));
    await createTSConfig();
    console.log(chalk.blue('tsconfig.json created...'));
    await setupProjectFiles();
    console.log(chalk.blue('Project structure created...'));
    console.log(chalk.green('completed, run yarn!'));
    console.close();
}

main();
