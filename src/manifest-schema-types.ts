/**
 * The minecraft manifest schema.
 */
export type ManifestSchema = ManifestV1Schema | ManifestV2Schema;
/**
 * This defines the current version of the manifest. Don't change this unless you have a good reason to
 */
export type V1FormatVersion = 1;
/**
 * This is the name of the pack as it appears within Minecraft.
 */
export type Name = Name1 & Name2;
export type Name1 = number;
export type Name2 = string;
/**
 * This is a short description of the pack. It will appear in the game below the name of the pack. We recommend keeping it to 1-2 lines.
 */
export type Description = Description1 & Description2;
export type Description1 = number;
export type Description2 = string;
/**
 * This is a special type of identifier that uniquely identifies this pack from any other pack. UUIDs are written in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx where each x is a hexadecimal value (0-9 or a-f). We recommend using an online service to generate this and guarantee their uniqueness (just bing UUID Generator to find some)
 */
export type UUID = string;
/**
 * This is the version of your pack in the format [majorVersion, minorVersion, revision].
 */
export type Version = VersionNumbering | SemanticVersion;
/**
 * A version made of 3 numbers.
 */
export type VersionNumbering = [] | [number] | [number, Major] | [number, Major, Minor];
export type Major = number;
export type Minor = number;
/**
 * A semver.org compliant version number.
 */
export type SemanticVersion = string;
/**
 * A version made of 3 numbers.
 */
export type VersionNumbering1 = [] | [number] | [number, Major] | [number, Major, Minor];
/**
 * This is the scope of the pack. This is only for resource packs
 */
export type PackScope = "global" | "world" | "any";
/**
 * UNDOCUMENTED: lock template options.
 */
export type LockTemplateOptions = boolean;
/**
 * A version made of 3 numbers.
 */
export type VersionNumbering2 = [] | [number] | [number, Major] | [number, Major, Minor];
/**
 * This is the type of the module. Can be any of the following: resources, data, client_data, interface, world_template
 */
export type Type = "resources" | "data" | "client_data" | "interface" | "world_template" | "skin_pack";
/**
 * This is a short description of the module. This is not user-facing at the moment but is a good place to remind yourself why the module is defined
 */
export type Description3 = string;
/**
 * This is a unique identifier for the module in the same format as the pack's UUID in the header. This should be different from the pack's UUID, and different for every module
 */
export type UUID1 = string;
/**
 * This is the version of the module in the same format as the pack's version in the header. This can be used to further identify changes in your pack
 */
export type Version1 = VersionNumbering | SemanticVersion;
/**
 * UNDOCUMENTED: modules.
 */
export type Modules = Modules1[];
/**
 * This is the unique identifier of the pack that this pack depends on. It needs to be the exact same UUID that the pack has defined in the header section of it's manifest file
 */
export type UUID2 = string;
/**
 * This is the specific version of the pack that your pack depends on. Should match the version the other pack has in its manifest file
 */
export type Version2 = VersionNumbering | SemanticVersion;
/**
 * These are the different features that the pack makes use of that aren't necessarily enabled by default.
 */
export type Dependencies = Dependencies1[];
/**
 * Allows HTML files in the pack to be used for custom UI, and scripts in the pack to call and manipulate custom UI.
 */
export type ExperimentalCustomUi = boolean;
/**
 * Allows the pack to add, change or replace Chemistry functionality.
 */
export type Chemistry = boolean;
/**
 * This defines the current version of the manifest. Don't change this unless you have a good reason to
 */
export type V2FormatVersion = 2;
/**
 * These are the different features that the pack makes use of that aren't necessarily enabled by default.
 */
export type Capabilities1 =
    | [
          "raytraced" | "pbr" | "script_eval" | "editorExtension" | "experimental_custom_ui" | "chemistry",
          ...("raytraced" | "pbr" | "script_eval" | "editorExtension" | "experimental_custom_ui" | "chemistry")[]
      ]
    | {
          chemistry?: Chemistry1;
          editorExtension?: EditorExtension;
          experimental_custom_ui?: ExperimentalCustomUi1;
          raytraced?: Raytraced;
          [k: string]: unknown;
      };
/**
 * Allows the pack to add, change or replace Chemistry functionality.
 */
export type Chemistry1 = boolean;
/**
 * Indicates that this pack contains extensions for editing.
 */
export type EditorExtension = boolean;
/**
 * Allows HTML files in the pack to be used for custom UI, and scripts in the pack to call and manipulate custom UI.
 */
export type ExperimentalCustomUi1 = boolean;
/**
 * Indicates that this pack contains Raytracing Enhanced or Physical Based Materials for rendering.
 */
export type Raytraced = boolean;
/**
 * This is the unique identifier of the pack that this pack depends on. It needs to be the exact same UUID that the pack has defined in the header section of it's manifest file
 */
export type Uuid = string;
/**
 * This is the specific version of the pack that your pack depends on. Should match the version the other pack has in its manifest file
 */
export type Version3 = VersionNumbering | FormatVersion2;
/**
 * A version that tells minecraft what type of data format can be expected when reading this file.
 */
export type FormatVersion2 = string;
/**
 * This is the name of the module that this pack depends on.
 */
export type ModuleName = string;
/**
 * A semver.org compliant version number.
 */
export type SemanticVersion1 = string;
/**
 * Section containing definitions for any other packs or modules that are required in order for this manifest.json file to work.
 */
export type Dependencies2 = (Dependency | Dependency1)[];
/**
 * This option is required for any world templates. This will allow the player to use a random seed when creating a new world from your template.
 */
export type AllowRandomSeed = boolean;
/**
 * A version made of 3 numbers.
 */
export type VersionNumbering3 = [] | [number] | [number, Major] | [number, Major, Minor];
/**
 * This is a short description of the pack. It will appear in the game below the name of the pack. We recommend keeping it to 1-2 lines.
 */
export type Description4 = string;
/**
 * This option is required for any world templates. This will lock the player from modifying the options of the world.
 */
export type LockTemplateOptions1 = boolean;
/**
 * A version made of 3 numbers.
 */
export type VersionNumbering4 = [] | [number] | [number, Major] | [number, Major, Minor];
/**
 * This is the name of the pack as it appears within Minecraft. This is a required field.
 */
export type Name3 = string;
/**
 * This is the scope of the pack. This is only for resource packs
 */
export type PackScope1 = "global" | "world" | "any";
/**
 * This is a special type of identifier that uniquely identifies this pack from any other pack. UUIDs are written in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx where each x is a hexadecimal value (0-9 or a-f). We recommend using an online service to generate this and guarantee their uniqueness (just bing UUID Generator to find some)
 */
export type UUID3 = string;
/**
 * This is the version of your pack in the format [majorVersion, minorVersion, revision].
 */
export type Version4 = VersionNumbering | SemanticVersion;
/**
 * This is a short description of the module. This is not user-facing at the moment but is a good place to remind yourself why the module is defined
 */
export type Description5 = string;
/**
 * This is the type of the module.
 */
export type Type1 = "resources" | "data" | "client_data" | "interface" | "world_template" | "javascript" | "script";
/**
 * The programming language to use.
 */
export type Language = "javascript" | "Javascript";
/**
 * This is a unique identifier for the module in the same format as the pack's UUID in the header. This should be different from the pack's UUID, and different for every module
 */
export type Uuid1 = string;
/**
 * This is the version of your pack in the format [majorVersion, minorVersion, revision]. The version number is used when importing a pack that has been imported before. The new pack will replace the old one if the version is higher, and ignored if it's the same or lower
 */
export type Version5 = VersionNumbering | SemanticVersion;
/**
 * The javascript entry point for tests, only works if types has been set to `javascript`.
 */
export type Entry = string;
/**
 * Section containing information regarding the type of content that is being brought in.
 */
export type Modules2 = Module[];
/**
 * Name of the author of the pack.
 */
export type Name4 = string;
/**
 * Name of the author(s) of the pack.
 */
export type Authors = Name4[];
/**
 * A semver.org compliant version number.
 */
export type SemanticVersion2 = string;
/**
 * The tool and the version used to modified this pack.
 */
export type Tool = SemanticVersion2[];
/**
 * The license of the pack.
 */
export type License = string;
/**
 * The type of product this pack is. This is used to determine how the pack is displayed in the store.
 */
export type ProductType = "" | "addon";
/**
 * The home website of your pack.
 */
export type Url = string;
/**
 * This represents the folder name located in "subpacks" folder. When user select this resolution Minecraft loads the content inside the folder.
 */
export type FolderName = string;
/**
 * This is the name of the pack resolution. This lets user know what resolution they are choosing.
 */
export type Name5 = string;
/**
 * This creates a requirement on the capacity of memory needed to select the resolution. Each tier increases memory requirement by 256 MB.
 */
export type MemoryTier = number;
/**
 * A list of subpacks that are applied per memory tier.
 */
export type Subpacks = Subpacks1[];

/**
 * The manifest file contains all the basic information about the pack that Minecraft needs to identify it. The tables below contain all the components of the manifest, their individual properties, and what they mean.
 */
export interface ManifestV1Schema {
    format_version: V1FormatVersion;
    header: Header;
    modules?: Modules;
    dependencies?: Dependencies;
    capabilities?: Capabilities;
    metadata?: Metadata;
}
/**
 * UNDOCUMENTED: header.
 */
export interface Header {
    name: Name;
    description?: Description;
    uuid: UUID;
    version: Version;
    min_engine_version?: VersionNumbering1;
    pack_scope?: PackScope;
    lock_template_options?: LockTemplateOptions;
    base_game_version?: VersionNumbering2;
    [k: string]: unknown;
}
/**
 * UNDOCUMENTED: modules.
 */
export interface Modules1 {
    type: Type;
    description?: Description3;
    uuid: UUID1;
    version: Version1;
}
/**
 * UNDOCUMENTED: dependencies.
 */
export interface Dependencies1 {
    uuid?: UUID2;
    version?: Version2;
}
/**
 * These are the different features that the pack makes use of that aren't necessarily enabled by default.
 */
export interface Capabilities {
    experimental_custom_ui?: ExperimentalCustomUi;
    chemistry?: Chemistry;
    [k: string]: unknown;
}
/**
 * UNDOCUMENTED: metadata.
 */
export interface Metadata {
    [k: string]: unknown;
}
/**
 * The manifest file contains all the basic information about the pack that Minecraft needs to identify it. The tables below contain all the components of the manifest, their individual properties, and what they mean.
 */
export interface ManifestV2Schema {
    format_version: V2FormatVersion;
    capabilities?: Capabilities1;
    dependencies?: Dependencies2;
    header: Header1;
    modules?: Modules2;
    metadata?: Metadata1;
    subpacks?: Subpacks;
}
/**
 * Section containing definitions for any other packs that are required in order for this manifest.json file to work.
 */
export interface Dependency {
    uuid?: Uuid;
    version?: Version3;
}
/**
 * Section containing definitions for any other packs or modules that are required in order for this manifest.json file to work.
 */
export interface Dependency1 {
    module_name?: ModuleName;
    version?: SemanticVersion1;
}
/**
 * Section containing information regarding the name of the pack, description, and other features that are public facing.
 */
export interface Header1 {
    allow_random_seed?: AllowRandomSeed;
    base_game_version?: VersionNumbering3;
    description: Description4;
    lock_template_options?: LockTemplateOptions1;
    min_engine_version?: VersionNumbering4;
    name: Name3;
    pack_scope?: PackScope1;
    uuid: UUID3;
    version: Version4;
    [k: string]: unknown;
}
/**
 * Section containing information regarding the type of content that is being brought in.
 */
export interface Module {
    description?: Description5;
    type: Type1;
    language?: Language;
    uuid: Uuid1;
    version: Version5;
    entry?: Entry;
}
/**
 * Section containing the metadata about the file such as authors and licensing information.
 */
export interface Metadata1 {
    authors?: Authors;
    generated_with?: GeneratedWith;
    license?: License;
    product_type?: ProductType;
    url?: Url;
}
/**
 * A list of tools and their version that have modified this pack.
 */
export interface GeneratedWith {
    [k: string]: Tool;
}
/**
 * A single definition of a subpack.
 */
export interface Subpacks1 {
    folder_name: FolderName;
    name: Name5;
    memory_tier: MemoryTier;
}
