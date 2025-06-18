# v0.1.0

## Additions

-   Added `Changelog.md`.
-   Added support for generating `mcpack` files instead of a single `mcaddon` file.
-   The CLI now tells you when a new update is available.
-   Added the `--version` option to the CLI to get the current version.
-   Added the `--update` option to the CLI to update the current version (Note: If your system does not support `child_process`, you will need to run `npm update add-on-releaser` to update manually).
-   Added an error message when the config file is not found, instead of it just throwing the long error.

## Changes

-   When using the `find_and_replace_in_file` modification type, any occurrences of `${version}` in the `replace` string will be replaced with the detected version number of the pack (To put `${version}` in the `replace` string, use `${version\\}`).
-   Specifying the UUID of the pack to get the version number from is no longer required, if not specified, the version of the first pack in the `packs` array will be used.

## Removals

-   Deleted the `.d.ts.map` and `.js.map` files to reduce the package size.

# v0.0.3

## Fixes

-   Fixed a few typos in `README.md`.

# v0.0.2

## Additions

-   Added a `README.md` file.
-   Added the following information to `package.json`:
    -   `engines`
    -   `keywords`
    -   `preferGlobal`
    -   `contributors`

## Fixes

-   Fixed a bug where the version was incorrectly set to `1.0.0` instead of `0.0.1` in the script.

# v0.0.1

-   Initial release
