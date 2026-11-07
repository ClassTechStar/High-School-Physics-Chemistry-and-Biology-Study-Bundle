plugins {
    id("com.android.application") version "7.4.2"
}

android {
    // AGP 7.4.x：与 AndroidManifest.xml 保留的 package= 属性兼容
    //（build-apk.sh 的 aapt2 路径同样依赖该属性；升级 AGP 8 需改用 namespace 并同步两处）
    namespace = "com.classtechstar.hspcb"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.classtechstar.hspcb"
        minSdk = 24
        targetSdk = 34
        versionCode = 8
        versionName = "1.7.1"
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

    // 本工程目录为扁平布局（app/java、app/res、app/assets、app/AndroidManifest.xml），
    // 与 AS 默认的 app/src/main/* 不同 —— 显式挂载
    sourceSets["main"].apply {
        manifest.srcFile("AndroidManifest.xml")
        java.srcDirs("java")
        res.srcDirs("res")
        assets.srcDirs("assets")                                        // 已入库的 1.2/ 同源拷贝
        assets.srcDir(layout.buildDirectory.dir("generated/webAssets")) // 构建时刷新
    }
}

// 构建前用仓库根 1.2/ 刷新生成目录（与 build-apk.sh 第 0 步一致）
val syncWebAssets by tasks.registering(Copy::class) {
    from(rootDir.resolve("../1.2"))
    into(layout.buildDirectory.dir("generated/webAssets"))
}
tasks.named("preBuild") { dependsOn(syncWebAssets) }

// 零第三方运行时依赖：仅 android.jar
