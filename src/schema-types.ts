/**
 * 8Crafter's MCBE Add-On Releaser Configuration
 */
export type AddOnReleaserConfiguration = {
    /**
     * The current working directory to use to resolve relative paths.
     *
     * @default "./"
     */
    cwd?: string;
    /**
     * The directory to write the release files to.
     *
     * @default "./Release Files"
     */
    destination: string;
    /**
     * The list of packs to include in the release files. If multiple packs have the same UUID, an error will be thrown.
     *
     * @default []
     */
    packs: Pack[];
    /**
     * The type of the release files, if it is mcpack, all packs will be outputted as individual mcpack files, if it is mcaddon, all packs will be included in a single mcaddon file.
     *
     * @default "mcaddon"
     */
    file_type?: "mcaddon" | "mcpack";
    /**
     * The format of the release version, either tuple, semver, or current.
     * If tuple, the version will be an array of three numbers, between -65537 and 65536.
     * If semver, the version will be a valid semver string.
     * If current, the version format will be the same as the version format of the original pack.
     * Defaults to tuple.
     *
     * Note: If you use semver, the pack will not be able to be uploaded to realms due to a bug.
     *
     * @default "tuple"
     */
    release_version_format?: "tuple" | "semver" | "current";
} & (
    | {
          file_type?: "mcaddon";
          /**
           * The name of the mcaddon file, should not include the `.mcaddon` extension. Put `${version}` in the name to have it be replaced with the version of the pack. The version will be formatted like `1-2-3-preview-20`.
           *
           * @default "myaddon-v${version}"
           */
          file_name: string;
          /**
           * An object containing the format of the version number to be used in the file name of the release files.
           *
           * @default
           * ```json
           * {
           *     "format": "dashed",
           *     "sourcePack": ""
           * }
           * ```
           */
          file_name_version: {
              /**
               * The format of the version number to be used in the file name of the release files.
               * - `dashed`: The version number will be formatted like `1-2-3-preview-20`. Release candidates will capitalize RC (1.2.3-rc.1 -> 1-2-3-RC-1)
               * - `current`: The version number will be the same as the version number of the pack.
               * - `JavaScript`: The semver version will be passed into the provided JavaScript function. The function should accept a semver version as a string and return a string.
               *
               * @default "dashed"
               */
              format?: "dashed" | "current" | "JavaScript";
              /**
               * The pack to get the version number from, should be the UUID of a pack in the `packs` array.
               * 
               * It must match the following regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/`
               */
              sourcePack: string;
          } & ({
              format?: "dashed" | "current";
          } | {
              format: "JavaScript";
              /**
               * "The JavaScript callback function to be used to format the version number. The function should accept a semver version as a string and return a string. Type: (version: string) => string
               *
               * @default
               * ```javascript
               * "(version) => version.replace('rc', 'RC').split('+')[0].replaceAll('.', '-')""
               * ```
               */
              JavaScript_callback: string;
          });
      }
    | {
          file_type: "mcpack";
      }
) & (
    | {
          release_version_format?: "tuple" | "current";
      }
    | {
          release_version_format: "semver";
          /**
           * If the build version should be stripped from the release version.
           * ex. v1.2.3-preview.20+BUILD.1 -> v1.2.3-preview.20
           *
           * @default true
           */
          strip_build_version?: true;
          /**
           * If the preview version should be stripped from the release version, requires strip_build_version to be true.
           * ex. v1.2.3-preview.20+BUILD.1 -> v1.2.3
           *
           * @default false
           */
          strip_preview_version?: boolean;
      }
    | {
          release_version_format: "semver";
          /**
           * If the build version should be stripped from the release version.
           * ex. v1.2.3-preview.20+BUILD.1 -> v1.2.3-preview.20
           *
           * @default true
           */
          strip_build_version: false;
          /**
           * If the preview version should be stripped from the release version, requires strip_build_version to be true.
           * ex. v1.2.3-preview.20+BUILD.1 -> v1.2.3
           *
           * @default false
           */
          strip_preview_version?: false;
      }
);

/**
 * A pack to be included in the release files.
 *
 * @default
 * ```json
 * {
 *     "path": "./",
 *     "release_name": "",
 *     "modifications": []
 * }
 * ```
 */
export type Pack = {
    /**
     * The path to the pack.
     *
     * @default "./"
     */
    path: string;
    /**
     * If the {@link AddOnReleaserConfiguration.file_type | file type} is mcaddon, the name of the folder in the mcaddon file.
     * If the {@link AddOnReleaserConfiguration.file_type | file type} is mcpack, the name of the mcpack file. Defaults to the name of the pack's folder.
     */
    release_name?: string;
    /**
     * The list of modifications to include in the release files, the will be executed in the order they are listed.
     */
    modifications: Modification[];
};

/**
 * The base type of a modification to be included in the release files.
 */
export interface ModificationBase {
    /**
     * The type of the modification.
     *
     * - `add_file`: Add a file into the release files from a location on your computer or a URI.
     * - `add_folder`: Add a folder into the release files from a location on your computer, does not support URIs.
     * - `rename_file`: Rename a file in the release files.
     * - `rename_folder`: Rename a folder in the release files.
     * - `move_file`: Move a file in the release files.
     * - `move_folder`: Move a folder in the release files.
     * - `delete_files`: Delete a set of files from the release files.
     * - `delete_folders`: Delete a set of folders from the release files.
     * - `find_and_replace_in_file`: Find and replace a string in a file.
     * - `find_and_replace_in_file`: Find and replace using a regex in a file.
     */
    type:
        | "add_file"
        | "add_folder"
        | "rename_file"
        | "rename_folder"
        | "move_file"
        | "move_folder"
        | "delete_files"
        | "delete_folders"
        | "find_and_replace_in_file";
}

/**
 * A modification to add a file into the release files from a location on your computer or a URI.
 */
export interface AddFileModification extends ModificationBase {
    type: "add_file";
    /**
     * The path to the source file, relative to the CWD, or a URI.
     */
    source: string;
    /**
     * The path to where the file should be placed, relative to the pack folder, any missing directories in the path will be created.
     */
    destination: string;
    /**
     * If the file should be overwritten if it already exists.
     *
     * @default false
     */
    overwrite?: boolean;
}

/**
 * A modification to add a folder into the release files from a location on your computer.
 */
export interface AddFolderModification extends ModificationBase {
    type: "add_folder";
    /**
     * The path to the source folder, relative to the CWD.
     */
    source: string;
    /**
     * The path to where the folder should be placed, relative to the pack folder, any missing directories in the path will be created.
     */
    destination: string;
    /**
     * What to do if the folder already exists in the release files.
     *
     * @default "merge"
     */
    conflict_resolution?: "overwrite" | "skip" | "merge";
}

/**
 * A modification to rename a file in the release files.
 */
export interface RenameFileModification extends ModificationBase {
    type: "rename_file";
    /**
     * The path to the target file to be renamed, relative to the pack folder.
     */
    target: string;
    /**
     * The new name of the file.
     */
    new_name: string;
    /**
     * If the file should be overwritten if it already exists.
     *
     * @default false
     */
    overwrite?: boolean;
}

/**
 * A modification to rename a folder in the release files.
 */
export interface RenameFolderModification extends ModificationBase {
    type: "rename_folder";
    /**
     * The path to the target folder to be renamed, relative to the pack folder.
     */
    target: string;
    /**
     * The new name of the folder.
     */
    new_name: string;
    /**
     * What to do if a folder with the chosen name already exists in the release files.
     *
     * @default "merge"
     */
    conflict_resolution?: "overwrite" | "skip" | "merge";
}

/**
 * A modification to move a file in the release files.
 */
export interface MoveFileModification extends ModificationBase {
    type: "move_file";
    /**
     * The path to the target file to be moved, relative to the pack folder.
     */
    target: string;
    /**
     * The path to where the file should be moved, relative to the pack folder, any missing directories in the path will be created.
     */
    destination: string;
    /**
     * If the file should be overwritten if it already exists.
     *
     * @default false
     */
    overwrite?: boolean;
}

/**
 * A modification to move a folder in the release files.
 */
export interface MoveFolderModification extends ModificationBase {
    type: "move_folder";
    /**
     * The path to the target folder to be moved, relative to the pack folder.
     */
    target: string;
    /**
     * The path to where the folder should be moved, relative to the pack folder, any missing directories in the path will be created.
     */
    destination: string;
    /**
     * What to do if a folder with the same name already exists at the destination location in the release files.
     *
     * @default "merge"
     */
    conflict_resolution?: "overwrite" | "skip" | "merge";
}

/**
 * A modification to delete a set of files from the release files.
 */
export interface DeleteFilesModification extends ModificationBase {
    type: "delete_files";
    /**
     * The paths to the target files to be deleted, relative to the pack folder. Supports glob patterns.
     */
    targets: string[];
}

/**
 * A modification to delete a set of folders from the release files.
 */
export interface DeleteFoldersModification extends ModificationBase {
    type: "delete_folders";
    /**
     * The paths to the target folders to be deleted, relative to the pack folder. Supports glob patterns.
     */
    targets: string[];
}

/**
 * A modification to find and replace text in a file.
 */
export interface StringFindAndReplaceInFileModification extends ModificationBase {
    type: "find_and_replace_in_file";
    /**
     * The path to the target file, relative to the pack folder. Supports glob patterns.
     */
    target: string;
    /**
     * If the find string should be treated as a regex.
     *
     * @default false
     */
    regex: false;
    /**
     * The string to find in the file.
     */
    find: string;
    /**
     * The string to replace the find string with.
     */
    replace: string;
}

/**
 * A modification to find and replace text using a regex in a file.
 */
export interface RegexFindAndReplaceInFileModification extends ModificationBase {
    type: "find_and_replace_in_file";
    /**
     * The path to the target file, relative to the pack folder. Supports glob patterns.
     */
    target: string;
    /**
     * If the find string should be treated as a regex.
     */
    regex: true;
    /**
     * The regex to find in the file, should not include the beginning and end `/` or flags.
     */
    find: string;
    /**
     * The regex flags to use.
     *
     * @default ""
     */
    flags?: string;
    /**
     * The string to replace the find regex with, can use things like `$1`, `$2`, etc.
     */
    replace: string;
}

/**
 * A modification to find and replace text using a string or a regex in a file.
 */
export type FindAndReplaceInFileModification = StringFindAndReplaceInFileModification | RegexFindAndReplaceInFileModification;

/**
 * A modification to be included in the release files.
 */
export type Modification =
    | AddFileModification
    | AddFolderModification
    | RenameFileModification
    | RenameFolderModification
    | MoveFileModification
    | MoveFolderModification
    | DeleteFilesModification
    | DeleteFoldersModification
    | FindAndReplaceInFileModification;
