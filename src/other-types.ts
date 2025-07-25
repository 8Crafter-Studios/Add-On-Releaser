export interface NPMPackageLatestVersionResponse {
    name: string;
    version: string;
    description: string;
    homepage: string;
    bugs: { url: string };
    repository: { type: string; url: string };
    license: string;
    author: { name: string };
    type: string;
    main: string;
    bin: { "add-on-releaser": string };
    scripts: { test: string };
    dependencies: { chalk: string; "comment-json": string };
    devDependencies: { "@types/node": string };
    engines: { node: string };
    keywords: string[];
    preferGlobal: boolean;
    contributors: { name: string }[];
    _id: string;
    gitHead: string;
    types: string;
    _nodeVersion: string;
    _npmVersion: string;
    dist: { integrity: string; shasum: string; tarball: string; fileCount: number; unpackedSize: number; signatures: { keyid: string; sig: string }[] };
    _npmUser: { name: string; email: string };
    directories: {};
    maintainers: { name: string; email: string }[];
    _npmOperationalInternal: { host: string; tmp: string };
    _hasShrinkwrap: boolean;
}
