import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import "./zip.js";
import * as CommentJSON from "comment-json";
import chalk from "chalk";
/**
 * The version of the Add-on Releaser.
 */
export const format_version = "0.1.0";
/**
 * The arguments passed to the CLI.
 */
const args = process.argv.slice(2);
// The command to get the version of the Add-on Releaser.
if (args[0] === "--version" || args[0] === "-v") {
    /**
     * The current version of the Add-on Releaser.
     */
    let currentVersion;
    try {
        /**
         * The package.json file.
         */
        const packageJSONData = CommentJSON.parse(readFileSync(path.join(import.meta.dirname, "../package.json")).toString());
        /**
         * Use the version from the package.json file, just in case the one in the file is not correct for some reason.
         */
        currentVersion = packageJSONData.version;
    }
    catch (e) {
        /**
         * If the package.json file is not found, use the defined {@link format_version} instead.
         */
        currentVersion = format_version;
    }
    console.log(chalk.magenta(`8Crafter's MCBE Add-on Releaser v${currentVersion}\n\n${chalk.cyanBright("https://www.8crafter.com")}`));
    process.exit(0);
}
// The command to update Add-on Releaser.
if (args[0] === "--update" || args[0] === "-u") {
    try {
        /**
         * The latest version of the Add-on Releaser.
         */
        const latestVersion = (await (await fetch(new Request("https://registry.npmjs.org/add-on-releaser/latest"))).json());
        /**
         * The current version of the Add-on Releaser.
         */
        let currentVersion;
        try {
            /**
             * The package.json file.
             */
            const packageJSONData = CommentJSON.parse(readFileSync(path.join(import.meta.dirname, "../package.json")).toString());
            /**
             * Use the version from the package.json file, just in case the one in the file is not correct for some reason.
             */
            currentVersion = packageJSONData.version;
        }
        catch (e) {
            /**
             * If the package.json file is not found, use the defined {@link format_version} instead.
             */
            currentVersion = format_version;
        }
        if (latestVersion.version !== currentVersion) {
            try {
                const { exec } = await import("child_process");
                exec("npm update add-on-releaser");
                console.log(chalk.green(`Add-on Releaser has been updated to version ${latestVersion.version}!`));
            }
            catch (e) {
                console.error(chalk.red(`Could not automatically update Add-on Releaser to version ${latestVersion.version}. This may be due to your system not supporting child_process. You can run "npm update add-on-releaser" to update manually. The following error was thrown: ${e}${e?.stack}`));
            }
        }
        else {
            console.log(chalk.greenBright(`Add-on Releaser is already up to date!`));
        }
    }
    catch (e) {
        console.error(chalk.red(`Could not automatically update Add-on Releaser. The following error was thrown: ${e}${e?.stack}`));
    }
    process.exit(0);
}
// Check if a new version of Add-on Releaser is available.
try {
    /**
     * The latest version of the Add-on Releaser.
     */
    const latestVersion = (await (await fetch(new Request("https://registry.npmjs.org/add-on-releaser/latest"))).json());
    /**
     * The current version of the Add-on Releaser.
     */
    let currentVersion;
    try {
        /**
         * The package.json file.
         */
        const packageJSONData = CommentJSON.parse(readFileSync(path.join(import.meta.dirname, "../package.json")).toString());
        /**
         * Use the version from the package.json file, just in case the one in the file is not correct for some reason.
         */
        currentVersion = packageJSONData.version;
    }
    catch (e) {
        /**
         * If the package.json file is not found, use the defined {@link format_version} instead.
         */
        currentVersion = format_version;
    }
    if (latestVersion.version !== currentVersion) {
        console.log(chalk.cyanBright(`A new version of Add-On Releaser is available! Version ${latestVersion.version} is available at https://www.npmjs.com/package/add-on-releaser. You can run "npm i -g add-on-releaser@${latestVersion.version}" to get the latest version.`));
    }
}
catch (e) { }
const configPath = args[0] || "./add-on-releaser-config.json";
let rawConfig;
try {
    rawConfig = readFileSync(configPath).toString();
}
catch (e) {
    console.error(chalk.red(`Could not find configuration file "${path.resolve(process.cwd(), configPath)}".`));
    process.exit(1);
}
let config = CommentJSON.parse(rawConfig);
const cwd = path.resolve(process.cwd(), config.cwd || "./");
/**
 * @todo Make the {@link config.generation_mode} option functional.
 */
if (config.file_type === "mcaddon") {
    const manifests = {};
    const generatedManifests = {};
    const zipFs = new zip.fs.FS();
    let index = 0;
    for (const pack of config.packs) {
        const manifest = CommentJSON.parse(readFileSync(path.resolve(cwd, pack.path, "manifest.json")).toString());
        if (manifest.header.uuid in manifests) {
            throw new Error(`Pack "${pack.path}" (packs[${index}]) has the same UUID as "${manifests[manifest.header.uuid].pack.path}" (packs[${manifests[manifest.header.uuid].index}]), which is not allowed.`);
        }
        manifests[manifest.header.uuid] = {
            pack,
            manifest,
            index,
        };
        const directory = pack.release_name || path.parse(pack.path).name;
        const directoryEntry = zipFs.addDirectory(directory, {
            comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.`,
        });
        const manifestJSONFindAndReplaceModifications = pack.modifications.filter((modification) => modification.type === "find_and_replace_in_file" && path.matchesGlob("manifest.json", modification.target));
        const newManifest = CommentJSON.parse(readFileSync(path.resolve(cwd, pack.path, "manifest.json")).toString());
        if (config.release_version_format !== "current") {
            if (typeof newManifest.header.version === "string") {
                if (!config.release_version_format || config.release_version_format === "tuple") {
                    const version = newManifest.header.version
                        .split(/[-+]/g)[0]
                        .split(".")
                        .slice(0, 3)
                        .map((v) => Number(v));
                    newManifest.header.name = newManifest.header.name.replace(newManifest.header.version, newManifest.header.version.split(/[-+]/g)[0]);
                    newManifest.header.description = newManifest.header.description?.replace(newManifest.header.version, newManifest.header.version.split(/[-+]/g)[0]);
                    newManifest.header.version = version;
                    /* text = text.replace(
                                        new RegExp(`"version"([\\s\\n]*):([\\s\\n]*)"${manifest.header.version}"`),
                                        `"version"$1:$2\\[${version[0]}, ${version[1]}, ${version[2]}\\]`
                                    ); */
                }
            }
            else if (newManifest.header.version instanceof Array) {
                if (config.release_version_format === "semver") {
                    const version = newManifest.header.version;
                    newManifest.header.version = `${version[0] ?? 0}.${version[1] ?? 0}.${version[2] ?? 0}`;
                    /* text = text.replace(
                                        new RegExp(
                                            version.length === 3
                                                ? `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*,[\\s\\n]*${version[1]}[\\s\\n]*,[\\s\\n]*${version[2]}[\\s\\n]*\\]`
                                                : version.length === 2
                                                ? `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*,[\\s\\n]*${version[1]}[\\s\\n]*\\]`
                                                : `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*\\]`,
                                            `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*\\]`
                                        ),
                                        `"version"$1:$2"${version.join(".")}"`
                                    ); */
                }
            }
            if (newManifest.modules) {
                for (const module of newManifest.modules) {
                    if (typeof module.version === "string") {
                        if (!config.release_version_format || config.release_version_format === "tuple") {
                            module.version = module.version
                                .split(/[-+]/g)[0]
                                .split(".")
                                .slice(0, 3)
                                .map((v) => Number(v));
                        }
                    }
                    else if (module.version instanceof Array) {
                        if (config.release_version_format === "semver") {
                            module.version = `${module.version[0] ?? 0}.${module.version[1] ?? 0}.${module.version[2] ?? 0}`;
                        }
                    }
                }
            }
            if (newManifest.dependencies) {
                for (const dependency of newManifest.dependencies) {
                    if ("uuid" in dependency) {
                        if (config.release_version_format === "semver" && dependency.version instanceof Array) {
                            dependency.version = `${dependency.version[0] ?? 0}.${dependency.version[1] ?? 0}.${dependency.version[2] ?? 0}`;
                            /* text = text
                                                .replace(
                                                    new RegExp(
                                                        dependency.version.length === 3
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*,[\\s\\n]*${dependency.version[2]}[\\s\\n]*\\]`
                                                            : dependency.version.length === 2
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*\\]`
                                                            : dependency.version.length === 1
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*\\]`
                                                            : `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*\\]`
                                                    ),
                                                    `$1"${dependency.version.join(".")}"`
                                                )
                                                .replace(
                                                    new RegExp(
                                                        dependency.version.length === 3
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*,[\\s\\n]*${dependency.version[2]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : dependency.version.length === 2
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : dependency.version.length === 1
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                    ),
                                                    `$1"${dependency.version.join(".")}"$2`
                                                ); */
                        }
                        else if (config.release_version_format === "tuple" && typeof dependency.version === "string") {
                            dependency.version = dependency.version
                                .split(/[-+]/g)[0]
                                .split(".")
                                .slice(0, 3)
                                .map((v) => Number(v));
                            /* text = text.replace(
                                                new RegExp(
                                                    `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}","version"[\\s\\n]*:[\\s\\n]*)"${dependency.version}"`
                                                ),
                                                `$1\\[${dependency.version.split(/[-+]/g)[0].split(".").join(", ")}\\]`
                                            ); */
                        }
                    }
                }
            }
        }
        newManifest.metadata ??= {};
        newManifest.metadata.generated_with ??= {};
        if (!newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"]) {
            newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"] = [format_version];
        }
        else if (newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"] &&
            !newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"].includes(format_version)) {
            newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"].push(format_version);
        }
        let newManifestText = CommentJSON.stringify(newManifest, null, 4);
        newManifestText =
            manifestJSONFindAndReplaceModifications.length > 0
                ? manifestJSONFindAndReplaceModifications.reduce((text, modification) => text.replace(modification.regex ? new RegExp(modification.find, modification.flags) : modification.find, modification.replace.replaceAll("${version}", typeof newManifest.header.version === "string" ? newManifest.header.version : newManifest.header.version.join("."))), newManifestText)
                : newManifestText;
        let newManifestData;
        try {
            newManifestData = CommentJSON.parse(newManifestText);
        }
        catch (e) {
            throw new SyntaxError(`Failed to parse generated manifest "manifest.json" in pack "${pack.path}": ${e}${e && (typeof e === "object" || typeof e === "function") && "stack" in e ? e.stack : ""}`);
        }
        generatedManifests[newManifestData.header.uuid] = {
            index,
            manifest: newManifestData,
            pack,
        };
        function addFolderContents(directoryEntry, folder = "", currentPath = "", packPath = pack.path) {
            const folderContents = readdirSync(path.resolve(cwd, packPath, currentPath, folder), { withFileTypes: true });
            for (const item of folderContents) {
                if (item.isFile() && item.name !== "add-on-releaser-config.json") {
                    if (pack.modifications.some((modification) => modification.type === "delete_files" &&
                        modification.targets.some((target) => path.matchesGlob(path.join(currentPath, folder, item.name), target)))) {
                        continue;
                    } /*
                    const renameFileModification: RenameFileModification | undefined = pack.modifications.find(
                        (modification) =>
                            modification.type === "rename_file" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target)
                    ) as RenameFileModification | undefined; */
                    let name = /* renameFileModification?.new_name ??  */ item.name; /*
                    if (
                        renameFileModification &&
                        !renameFileModification.overwrite &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isFile())
                    ) {
                        name = item.name;
                    } else if (
                        renameFileModification &&
                        renameFileModification.overwrite &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isFile())
                    ) {
                        folderContents.splice(
                            folderContents.findIndex((otherItem) => otherItem.name === name && otherItem.isFile()),
                            1
                        );
                    } */
                    const findAndReplaceModifications = pack.modifications.filter((modification) => modification.type === "find_and_replace_in_file" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target));
                    if (item.name === "manifest.json" && currentPath === "" && folder === "") {
                        directoryEntry.addText(name, newManifestText);
                    }
                    else if (findAndReplaceModifications.length > 0) {
                        directoryEntry.addText(name, findAndReplaceModifications.reduce((text, modification) => text.replace(modification.regex ? new RegExp(modification.find, modification.flags) : modification.find, modification.replace.replaceAll("${version}", typeof newManifest.header.version === "string" ? newManifest.header.version : newManifest.header.version.join("."))), readFileSync(path.resolve(cwd, packPath, currentPath, folder, item.name)).toString()));
                    }
                    else {
                        directoryEntry.addBlob(item.name, new Blob([readFileSync(path.resolve(cwd, packPath, currentPath, folder, item.name))]), {
                            comment: `File added by 8Crafter's Add-on Releaser v${format_version}.`,
                        });
                    }
                }
                else if (item.isDirectory()) {
                    if (pack.modifications.some((modification) => modification.type === "delete_folders" &&
                        modification.targets.some((target) => path.matchesGlob(path.join(currentPath, folder, item.name), target)))) {
                        continue;
                    } /*
                    const renameFolderModification: RenameFolderModification | undefined = pack.modifications.find(
                        (modification) =>
                            modification.type === "rename_folder" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target)
                    ) as RenameFolderModification | undefined; */
                    let name = /* renameFolderModification?.new_name ??  */ item.name; /*
                    if (
                        renameFolderModification &&
                        renameFolderModification.conflict_resolution === "overwrite" &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isDirectory())
                    ) {
                        name = item.name;
                    } else if (
                        renameFolderModification &&
                        renameFolderModification.conflict_resolution === "skip" &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isDirectory())
                    ) {
                        folderContents.splice(
                            folderContents.findIndex((otherItem) => otherItem.name === name && otherItem.isDirectory()),
                            1
                        );
                    } */
                    addFolderContents(
                    /* renameFolderModification && renameFolderModification.conflict_resolution === "merge"
                        ? (directoryEntry.getChildByName(name) as zip.ZipDirectoryEntry)
                        :  */ directoryEntry.addDirectory(name), item.name, path.join(currentPath, folder), packPath);
                }
            }
        }
        addFolderContents(directoryEntry);
        let modificationIndex = 0;
        for (const modification of pack.modifications) {
            switch (modification.type) {
                case "move_file": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipFileEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a file in the pack "${pack.path}".`);
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        zipFs.move(sourceEntry, destinationEntry);
                    }
                    break;
                }
                case "move_folder": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipDirectoryEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a directory in the pack "${pack.path}".`);
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        zipFs.move(sourceEntry, destinationEntry);
                    }
                    break;
                }
                case "add_file": {
                    const file = /^[^:\/\\]+:\/\//.test(modification.source)
                        ? await (await fetch(modification.source)).blob()
                        : new Blob([readFileSync(modification.source)]);
                    const destination = path.parse(modification.destination);
                    if (modification.overwrite !== true && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        continue;
                    }
                    const destinationEntry = directoryEntry.getChildByName(destination.dir) ??
                        directoryEntry.addDirectory(destination.dir, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        destinationEntry.addBlob(destination.base, file, { comment: `File added by 8Crafter's Add-on Releaser v${format_version}.` });
                    }
                    else {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${destination.dir}" is not a directory in the pack "${pack.path}".`);
                    }
                    break;
                }
                case "add_folder": {
                    if (modification.conflict_resolution === "skip" && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        continue;
                    }
                    if (modification.conflict_resolution === "overwrite" && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        zipFs.remove(directoryEntry.getChildByName(modification.destination));
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        addFolderContents(destinationEntry, "", "", path.resolve(cwd, modification.source));
                    }
                    break;
                }
                case "rename_file": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipFileEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a file in the pack "${pack.path}".`);
                    }
                    if (modification.overwrite !== true &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        continue;
                    }
                    sourceEntry.rename(modification.new_name);
                    break;
                }
                case "rename_folder": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipDirectoryEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a directory in the pack "${pack.path}".`);
                    }
                    if (modification.conflict_resolution === "skip" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        continue;
                    }
                    if (modification.conflict_resolution === "overwrite" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        zipFs.remove(directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)));
                    }
                    else if (modification.conflict_resolution === "merge" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        const destinationEntry = directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name));
                        if (!(destinationEntry instanceof zip.ZipDirectoryEntry)) {
                            zipFs.remove(destinationEntry);
                        }
                        else {
                            for (const child of directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name))
                                .children) {
                                zipFs.move(child, destinationEntry);
                            }
                            zipFs.remove(sourceEntry);
                            continue;
                        }
                    }
                    sourceEntry.rename(modification.new_name);
                    break;
                }
            }
            modificationIndex++;
        }
        directoryEntry.addText("Release file generated with 8Crafter's Add-On Releaser.txt", `This release of the pack was compiled into a .mcaddon file by 8Crafter's Add-on Releaser v${format_version}.
https://www.youtube.com/@8Crafter
https://www.8crafter.com
https://discord.gg/8crafter-studios`);
        index++;
    }
    const versionSourcePack = config.file_name_version.sourcePack
        ? generatedManifests[config.file_name_version.sourcePack]
        : Object.values(generatedManifests).find((m) => m.pack === config.packs[0]);
    const originalVersion = versionSourcePack?.manifest.header.version;
    if (originalVersion === undefined) {
        throw new Error(`The pack with UUID ${config.file_name_version.sourcePack} could not be found.`);
    }
    let version = originalVersion instanceof Array
        ? originalVersion.join((config.file_name_version.format ?? "dashed") === "dashed" ? "-" : ".")
        : config.file_name_version.format === "dashed"
            ? originalVersion.replaceAll(".", "-")
            : originalVersion;
    if (config.file_name_version.format === "JavaScript") {
        version = eval(config.file_name_version.JavaScript_callback)(originalVersion, versionSourcePack?.pack);
    }
    if (typeof version !== "string") {
        throw new Error("Version must be a string.");
    }
    const fileName = `${config.file_name.replaceAll("${version}", version)}.mcaddon`;
    mkdirSync(path.resolve(cwd, config.destination), { recursive: true });
    writeFileSync(path.resolve(cwd, config.destination, fileName), await (await zipFs.exportBlob({})).bytes());
    console.log(`Add-on generated: ${path.relative(process.cwd(), path.resolve(cwd, config.destination, fileName))}`);
}
else if (config.file_type === "mcpack") {
    const manifests = {};
    const generatedManifests = {};
    const mcpacks = [];
    let index = 0;
    for (const pack of config.packs) {
        const zipFs = new zip.fs.FS();
        const manifest = CommentJSON.parse(readFileSync(path.resolve(cwd, pack.path, "manifest.json")).toString());
        if (manifest.header.uuid in manifests) {
            throw new Error(`Pack "${pack.path}" (packs[${index}]) has the same UUID as "${manifests[manifest.header.uuid].pack.path}" (packs[${manifests[manifest.header.uuid].index}]), which is not allowed.`);
        }
        manifests[manifest.header.uuid] = {
            pack,
            manifest,
            index,
        };
        const directory = pack.release_name || path.parse(pack.path).name;
        const directoryEntry = zipFs;
        const manifestJSONFindAndReplaceModifications = pack.modifications.filter((modification) => modification.type === "find_and_replace_in_file" && path.matchesGlob("manifest.json", modification.target));
        const newManifest = CommentJSON.parse(readFileSync(path.resolve(cwd, pack.path, "manifest.json")).toString());
        if (config.release_version_format !== "current") {
            if (typeof newManifest.header.version === "string") {
                if (!config.release_version_format || config.release_version_format === "tuple") {
                    const version = newManifest.header.version
                        .split(/[-+]/g)[0]
                        .split(".")
                        .slice(0, 3)
                        .map((v) => Number(v));
                    newManifest.header.name = newManifest.header.name.replace(newManifest.header.version, newManifest.header.version.split(/[-+]/g)[0]);
                    newManifest.header.description = newManifest.header.description?.replace(newManifest.header.version, newManifest.header.version.split(/[-+]/g)[0]);
                    newManifest.header.version = version;
                    /* text = text.replace(
                                        new RegExp(`"version"([\\s\\n]*):([\\s\\n]*)"${manifest.header.version}"`),
                                        `"version"$1:$2\\[${version[0]}, ${version[1]}, ${version[2]}\\]`
                                    ); */
                }
            }
            else if (newManifest.header.version instanceof Array) {
                if (config.release_version_format === "semver") {
                    const version = newManifest.header.version;
                    newManifest.header.version = `${version[0] ?? 0}.${version[1] ?? 0}.${version[2] ?? 0}`;
                    /* text = text.replace(
                                        new RegExp(
                                            version.length === 3
                                                ? `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*,[\\s\\n]*${version[1]}[\\s\\n]*,[\\s\\n]*${version[2]}[\\s\\n]*\\]`
                                                : version.length === 2
                                                ? `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*,[\\s\\n]*${version[1]}[\\s\\n]*\\]`
                                                : `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*${version[0]}[\\s\\n]*\\]`,
                                            `"version"([\\s\\n]*):([\\s\\n]*)\\[[\\s\\n]*\\]`
                                        ),
                                        `"version"$1:$2"${version.join(".")}"`
                                    ); */
                }
            }
            if (newManifest.modules) {
                for (const module of newManifest.modules) {
                    if (typeof module.version === "string") {
                        if (!config.release_version_format || config.release_version_format === "tuple") {
                            module.version = module.version
                                .split(/[-+]/g)[0]
                                .split(".")
                                .slice(0, 3)
                                .map((v) => Number(v));
                        }
                    }
                    else if (module.version instanceof Array) {
                        if (config.release_version_format === "semver") {
                            module.version = `${module.version[0] ?? 0}.${module.version[1] ?? 0}.${module.version[2] ?? 0}`;
                        }
                    }
                }
            }
            if (newManifest.dependencies) {
                for (const dependency of newManifest.dependencies) {
                    if ("uuid" in dependency) {
                        if (config.release_version_format === "semver" && dependency.version instanceof Array) {
                            dependency.version = `${dependency.version[0] ?? 0}.${dependency.version[1] ?? 0}.${dependency.version[2] ?? 0}`;
                            /* text = text
                                                .replace(
                                                    new RegExp(
                                                        dependency.version.length === 3
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*,[\\s\\n]*${dependency.version[2]}[\\s\\n]*\\]`
                                                            : dependency.version.length === 2
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*\\]`
                                                            : dependency.version.length === 1
                                                            ? `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*\\]`
                                                            : `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}"[\\s\\n]*,[\\s\\n]*"version"[\\s\\n]*:[\\s\\n]*)\\[[\\s\\n]*\\]`
                                                    ),
                                                    `$1"${dependency.version.join(".")}"`
                                                )
                                                .replace(
                                                    new RegExp(
                                                        dependency.version.length === 3
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*,[\\s\\n]*${dependency.version[2]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : dependency.version.length === 2
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*,[\\s\\n]*${dependency.version[1]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : dependency.version.length === 1
                                                            ? `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*${dependency.version[0]}[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                            : `("version"([\\s\\n]*):([\\s\\n]*))\\[[\\s\\n]*\\]([\\s\\n]*,[\\s\\n]*"uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}")`
                                                    ),
                                                    `$1"${dependency.version.join(".")}"$2`
                                                ); */
                        }
                        else if (config.release_version_format === "tuple" && typeof dependency.version === "string") {
                            dependency.version = dependency.version
                                .split(/[-+]/g)[0]
                                .split(".")
                                .slice(0, 3)
                                .map((v) => Number(v));
                            /* text = text.replace(
                                                new RegExp(
                                                    `("uuid"[\\s\\n]*:[\\s\\n]*"${dependency.uuid}","version"[\\s\\n]*:[\\s\\n]*)"${dependency.version}"`
                                                ),
                                                `$1\\[${dependency.version.split(/[-+]/g)[0].split(".").join(", ")}\\]`
                                            ); */
                        }
                    }
                }
            }
        }
        newManifest.metadata ??= {};
        newManifest.metadata.generated_with ??= {};
        if (!newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"]) {
            newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"] = [format_version];
        }
        else if (newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"] &&
            !newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"].includes(format_version)) {
            newManifest.metadata.generated_with["8Crafters_Add-On_Releaser"].push(format_version);
        }
        let newManifestText = CommentJSON.stringify(newManifest, null, 4);
        newManifestText =
            manifestJSONFindAndReplaceModifications.length > 0
                ? manifestJSONFindAndReplaceModifications.reduce((text, modification) => text.replace(modification.regex ? new RegExp(modification.find, modification.flags) : modification.find, modification.replace.replaceAll("${version}", typeof newManifest.header.version === "string" ? newManifest.header.version : newManifest.header.version.join("."))), newManifestText)
                : newManifestText;
        let newManifestData;
        try {
            newManifestData = CommentJSON.parse(newManifestText);
        }
        catch (e) {
            throw new SyntaxError(`Failed to parse generated manifest "manifest.json" in pack "${pack.path}": ${e}${e && (typeof e === "object" || typeof e === "function") && "stack" in e ? e.stack : ""}`);
        }
        generatedManifests[newManifestData.header.uuid] = {
            index,
            manifest: newManifestData,
            pack,
        };
        function addFolderContents(directoryEntry, folder = "", currentPath = "", packPath = pack.path) {
            const folderContents = readdirSync(path.resolve(cwd, packPath, currentPath, folder), { withFileTypes: true });
            for (const item of folderContents) {
                if (item.isFile() && item.name !== "add-on-releaser-config.json") {
                    if (pack.modifications.some((modification) => modification.type === "delete_files" &&
                        modification.targets.some((target) => path.matchesGlob(path.join(currentPath, folder, item.name), target)))) {
                        continue;
                    } /*
                    const renameFileModification: RenameFileModification | undefined = pack.modifications.find(
                        (modification) =>
                            modification.type === "rename_file" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target)
                    ) as RenameFileModification | undefined; */
                    let name = /* renameFileModification?.new_name ??  */ item.name; /*
                    if (
                        renameFileModification &&
                        !renameFileModification.overwrite &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isFile())
                    ) {
                        name = item.name;
                    } else if (
                        renameFileModification &&
                        renameFileModification.overwrite &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isFile())
                    ) {
                        folderContents.splice(
                            folderContents.findIndex((otherItem) => otherItem.name === name && otherItem.isFile()),
                            1
                        );
                    } */
                    const findAndReplaceModifications = pack.modifications.filter((modification) => modification.type === "find_and_replace_in_file" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target));
                    if (item.name === "manifest.json" && currentPath === "" && folder === "") {
                        directoryEntry.addText(name, newManifestText);
                    }
                    else if (findAndReplaceModifications.length > 0) {
                        directoryEntry.addText(name, findAndReplaceModifications.reduce((text, modification) => text.replace(modification.regex ? new RegExp(modification.find, modification.flags) : modification.find, modification.replace.replaceAll("${version}", typeof newManifest.header.version === "string" ? newManifest.header.version : newManifest.header.version.join("."))), readFileSync(path.resolve(cwd, packPath, currentPath, folder, item.name)).toString()));
                    }
                    else {
                        directoryEntry.addBlob(item.name, new Blob([readFileSync(path.resolve(cwd, packPath, currentPath, folder, item.name))]), {
                            comment: `File added by 8Crafter's Add-on Releaser v${format_version}.`,
                        });
                    }
                }
                else if (item.isDirectory()) {
                    if (pack.modifications.some((modification) => modification.type === "delete_folders" &&
                        modification.targets.some((target) => path.matchesGlob(path.join(currentPath, folder, item.name), target)))) {
                        continue;
                    } /*
                    const renameFolderModification: RenameFolderModification | undefined = pack.modifications.find(
                        (modification) =>
                            modification.type === "rename_folder" && path.matchesGlob(path.join(currentPath, folder, item.name), modification.target)
                    ) as RenameFolderModification | undefined; */
                    let name = /* renameFolderModification?.new_name ??  */ item.name; /*
                    if (
                        renameFolderModification &&
                        renameFolderModification.conflict_resolution === "overwrite" &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isDirectory())
                    ) {
                        name = item.name;
                    } else if (
                        renameFolderModification &&
                        renameFolderModification.conflict_resolution === "skip" &&
                        folderContents.some((otherItem) => otherItem.name === name && otherItem.isDirectory())
                    ) {
                        folderContents.splice(
                            folderContents.findIndex((otherItem) => otherItem.name === name && otherItem.isDirectory()),
                            1
                        );
                    } */
                    addFolderContents(
                    /* renameFolderModification && renameFolderModification.conflict_resolution === "merge"
                        ? (directoryEntry.getChildByName(name) as zip.ZipDirectoryEntry)
                        :  */ directoryEntry.addDirectory(name), item.name, path.join(currentPath, folder), packPath);
                }
            }
        }
        addFolderContents(directoryEntry);
        let modificationIndex = 0;
        for (const modification of pack.modifications) {
            switch (modification.type) {
                case "move_file": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipFileEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a file in the pack "${pack.path}".`);
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        zipFs.move(sourceEntry, destinationEntry);
                    }
                    break;
                }
                case "move_folder": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipDirectoryEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a directory in the pack "${pack.path}".`);
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        zipFs.move(sourceEntry, destinationEntry);
                    }
                    break;
                }
                case "add_file": {
                    const file = /^[^:\/\\]+:\/\//.test(modification.source)
                        ? await (await fetch(modification.source)).blob()
                        : new Blob([readFileSync(modification.source)]);
                    const destination = path.parse(modification.destination);
                    if (modification.overwrite !== true && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        continue;
                    }
                    const destinationEntry = directoryEntry.getChildByName(destination.dir) ??
                        directoryEntry.addDirectory(destination.dir, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        destinationEntry.addBlob(destination.base, file, { comment: `File added by 8Crafter's Add-on Releaser v${format_version}.` });
                    }
                    else {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${destination.dir}" is not a directory in the pack "${pack.path}".`);
                    }
                    break;
                }
                case "add_folder": {
                    if (modification.conflict_resolution === "skip" && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        continue;
                    }
                    if (modification.conflict_resolution === "overwrite" && directoryEntry.getChildByName(modification.destination) !== undefined) {
                        zipFs.remove(directoryEntry.getChildByName(modification.destination));
                    }
                    const destinationEntry = directoryEntry.getChildByName(modification.destination) ??
                        directoryEntry.addDirectory(modification.destination, { comment: `Directory added by 8Crafter's Add-on Releaser v${format_version}.` });
                    if (destinationEntry instanceof zip.ZipDirectoryEntry) {
                        addFolderContents(destinationEntry, "", "", path.resolve(cwd, modification.source));
                    }
                    break;
                }
                case "rename_file": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipFileEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a file in the pack "${pack.path}".`);
                    }
                    if (modification.overwrite !== true &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        continue;
                    }
                    sourceEntry.rename(modification.new_name);
                    break;
                }
                case "rename_folder": {
                    const sourceEntry = directoryEntry.getChildByName(modification.target);
                    if (sourceEntry === undefined) {
                        throw new ReferenceError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" could not be found in the pack "${pack.path}".`);
                    }
                    if (!(sourceEntry instanceof zip.ZipDirectoryEntry)) {
                        throw new TypeError(`packs[${index}].modifications[${modificationIndex}]: "${modification.target}" is not a directory in the pack "${pack.path}".`);
                    }
                    if (modification.conflict_resolution === "skip" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        continue;
                    }
                    if (modification.conflict_resolution === "overwrite" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        zipFs.remove(directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)));
                    }
                    else if (modification.conflict_resolution === "merge" &&
                        directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name)) !== undefined) {
                        const destinationEntry = directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name));
                        if (!(destinationEntry instanceof zip.ZipDirectoryEntry)) {
                            zipFs.remove(destinationEntry);
                        }
                        else {
                            for (const child of directoryEntry.getChildByName(path.join(path.parse(modification.target).dir, modification.new_name))
                                .children) {
                                zipFs.move(child, destinationEntry);
                            }
                            zipFs.remove(sourceEntry);
                            continue;
                        }
                    }
                    sourceEntry.rename(modification.new_name);
                    break;
                }
            }
            modificationIndex++;
        }
        directoryEntry.addText("Release file generated with 8Crafter's Add-On Releaser.txt", `This release of the pack was compiled into a .mcaddon file by 8Crafter's Add-on Releaser v${format_version}.
https://www.youtube.com/@8Crafter
https://www.8crafter.com
https://discord.gg/8crafter-studios`);
        index++;
        const originalVersion = newManifest.header.version;
        let version = originalVersion instanceof Array
            ? originalVersion.join((config.file_name_version.format ?? "dashed") === "dashed" ? "-" : ".")
            : config.file_name_version.format === "dashed"
                ? originalVersion.replaceAll(".", "-")
                : originalVersion;
        if (config.file_name_version.format === "JavaScript") {
            version = eval(config.file_name_version.JavaScript_callback)(originalVersion, pack);
        }
        if (typeof version !== "string") {
            throw new Error("Version must be a string.");
        }
        const fileName = `${(pack.release_name ?? (path.basename(path.parse(pack.path).dir) + "-v${version}"))?.replaceAll("${version}", version)}.mcpack`;
        mcpacks.push({
            fileName,
            zip: await (await zipFs.exportBlob({})).bytes(),
        });
    }
    mkdirSync(path.resolve(cwd, config.destination), { recursive: true });
    for (const mcpack of mcpacks) {
        writeFileSync(path.resolve(cwd, config.destination, mcpack.fileName), mcpack.zip);
        console.log(`Add-on generated: ${path.relative(process.cwd(), path.resolve(cwd, config.destination, mcpack.fileName))}`);
    }
}
