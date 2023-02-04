export interface PackageJson {
    name: string,
    description: string,
    version: string,
    author: string,
    main: string,
    license: string,
    scripts?: Scripts,
    dependencies: Dependencies,
    devDependencies: Dependencies
}

export interface Scripts {
    [script: string]: string
}

export interface Dependencies {
    [dep: string]: string
}

export interface TSConfig {
    compilerOptions: Partial<CompilerOptions>
}

export interface CompilerOptions {
    target: string,
    module: string,
    rootDir: string,
    outDir: string,
    esModuleInterop: boolean,
    forceConsistentCasingInFileNames: boolean,
    strict: boolean
}
