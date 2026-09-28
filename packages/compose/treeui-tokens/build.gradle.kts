plugins {
    alias(libs.plugins.kotlin.jvm)
}

// A plain Kotlin/JVM module on purpose. The token layer is the one piece of
// TreeUI every ecosystem shares, so it may not depend on Android or on Compose:
// that keeps it consumable from a Compose Multiplatform target, from a plain
// JVM tool that needs the palette, and from this repository's own test suite
// without an emulator.
kotlin {
    explicitApi()
    jvmToolchain(17)
}

dependencies {
    testImplementation(libs.kotlin.test)
}

tasks.test {
    useJUnitPlatform()
}
