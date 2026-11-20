package com.classtechstar.hspcb;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.text.TextUtils;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * MiniFileProvider — 最小 content:// 提供器（零 androidx 依赖）。
 *
 * 用途：Android 7+ 安装器不再接受 file:// Uri，更新 APK 下载到应用外部私有
 * 目录后，经本 Provider 以 content://com.classtechstar.hspcb.apk/updates/<name>
 * 交给系统安装器（配合 FLAG_GRANT_READ_URI_PERMISSION 临时授权）。
 * 仅暴露 getExternalFilesDir("updates") 下的文件，且 Provider 不可导出。
 */
public class MiniFileProvider extends ContentProvider {

    public static final String AUTHORITY = "com.classtechstar.hspcb.apk";
    private static final String SEGMENT = "updates";

    /** 把更新目录下的文件转成可交给安装器的 content:// Uri。 */
    public static Uri uriFor(Context ctx, File apk) {
        return Uri.parse("content://" + AUTHORITY + "/" + SEGMENT + "/" + apk.getName());
    }

    private File updatesDir() {
        Context ctx = getContext();
        File base = ctx != null ? ctx.getExternalFilesDir(null) : null;
        if (base == null) base = ctx.getFilesDir();
        File dir = new File(base, "updates");
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        String name = uri.getLastPathSegment();
        if (TextUtils.isEmpty(name) || name.contains("..") || name.contains("/")) {
            throw new FileNotFoundException("invalid name");
        }
        File f = new File(updatesDir(), name);
        if (!f.exists()) throw new FileNotFoundException(name);
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection,
                        String[] selectionArgs, String sortOrder) {
        return null;
    }

    @Override
    public String getType(Uri uri) {
        return "application/vnd.android.package-archive";
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
