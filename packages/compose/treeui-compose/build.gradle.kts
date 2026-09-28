plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

// Foundation, not Material. Taking Material's defaults would mean taking its
// colour roles, its shapes and its ripple — and a design system that inherits
// another design system's decisions is not a design system. Everything visual
// here comes from `treeui-tokens`.
android {
    namespace = "treeui.compose"
    compileSdk = libs.versions.compile.sdk.get().toInt()

    defaultConfig {
        minSdk = libs.versions.min.sdk.get().toInt()
        consumerProguardFiles("consumer-rules.pro")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }

    // Lets the colour-resolution tests run as plain JVM tests. The composables
    // themselves need an instrumented or Robolectric host; what these cover is
    // the part where a wrong token would actually ship.
    testOptions {
        unitTests.isIncludeAndroidResources = true
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
        }
    }
}

kotlin {
    explicitApi()
    jvmToolchain(17)
}

dependencies {
    // `api`, not `implementation`: a consumer writing `TButton(tone = TreeTone.Danger)`
    // needs the vocabulary types on its own compile classpath.
    api(project(":treeui-tokens"))

    implementation(platform(libs.compose.bom))
    implementation(libs.compose.foundation)
    implementation(libs.compose.ui)
    implementation(libs.androidx.core.ktx)

    debugImplementation(libs.compose.ui.tooling)
    implementation(libs.compose.ui.tooling.preview)

    testImplementation(libs.kotlin.test)
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}
