plugins {
    id("com.android.application")
}

android {
    namespace = "com.classtechstar.hspcb"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.classtechstar.hspcb"
        minSdk = 24
        targetSdk = 34
        versionCode = 7
        versionName = "1.7.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))
}

// 纯静态资产来自仓库根 1.2/：构建前同步（与 build-apk.sh 第 0 步一致）
val syncWebAssets by tasks.registering(Copy::class) {
    from(rootDir.resolve("../1.2"))
    into(layout.buildDirectory.dir("generated/webAssets"))
}
tasks.named("preBuild") { dependsOn(syncWebAssets) }

// 零第三方运行时依赖：仅 android.jar
