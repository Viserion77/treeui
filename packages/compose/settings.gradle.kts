// TreeUI for Kotlin — the Android port.
//
// Two modules, mirroring the split the TypeScript side has had since the start:
// `treeui-tokens` is the design contract as plain Kotlin with no Android or
// Compose dependency at all, and `treeui-compose` is the one module that knows
// what a composable is. `sample` is the port's Storybook: a runnable gallery.
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "treeui"

include(":treeui-tokens")
include(":treeui-compose")
