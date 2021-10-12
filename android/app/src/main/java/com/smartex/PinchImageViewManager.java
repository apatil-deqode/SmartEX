package com.smartex;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Objects;

public class PinchImageViewManager extends SimpleViewManager<SubsamplingScaleImageView> {
    private static final String BASE64_PREFIX = "data:image/jpg;base64,";

    @NonNull
    @Override
    public String getName() {
        return "PinchImageView";
    }

    @NonNull
    @Override
    protected SubsamplingScaleImageView createViewInstance(@NonNull ThemedReactContext reactContext) {
        SubsamplingScaleImageView view = new SubsamplingScaleImageView(reactContext);
        view.setMinimumDpi(60);
        return view;
    }

    @ReactProp(name = "source")
    public void setSrc(SubsamplingScaleImageView view, @Nullable ReadableMap source) {
        if (source == null || !source.hasKey("uri") || isNullOrEmpty(source.getString("uri"))) {
            Log.e("tag", "source removed");
            view.recycle();
        } else {
            String uri = Objects.requireNonNull(source.getString("uri"));
            if (uri.startsWith(BASE64_PREFIX)) {
                Log.e("tag", "setting base64 image");
                String base64 = uri.substring(uri.indexOf(",") + 1);
                byte[] decoded = Base64.decode(base64, Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                view.setImage(ImageSource.bitmap(bitmap));
            } else {
                view.setImage(ImageSource.uri(uri));
            }
        }
    }

    private boolean isNullOrEmpty(final String url) {
        return url == null || url.trim().isEmpty();
    }
}
