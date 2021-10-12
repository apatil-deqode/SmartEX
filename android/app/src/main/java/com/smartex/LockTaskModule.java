package com.smartex;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.os.Build;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

class LockTaskModule extends ReactContextBaseJavaModule {

    LockTaskModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "LockTask";
    }

    @ReactMethod
    public void isLocked(Promise promise) {
        boolean isLocked = false;
        Activity mActivity = getCurrentActivity();
        if (mActivity != null) {
            ActivityManager manager = (ActivityManager)
                    mActivity.getSystemService(Context.ACTIVITY_SERVICE);
            if (manager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    isLocked = manager.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
                } else {
                    isLocked = manager.isInLockTaskMode();
                }
            }
        }
        promise.resolve(isLocked);
    }

    @ReactMethod
    public void startLockTask() {
        try {
            Activity mActivity = getCurrentActivity();
            if (mActivity != null) {
                DevicePolicyManager myDevicePolicyManager = (DevicePolicyManager) mActivity.getSystemService(Context.DEVICE_POLICY_SERVICE);
                ComponentName mDPM = new ComponentName(mActivity, MyAdmin.class);
                if (myDevicePolicyManager != null && myDevicePolicyManager.isDeviceOwnerApp(mActivity.getPackageName())) {
                    String[] packages = {mActivity.getPackageName()};
                    myDevicePolicyManager.setLockTaskPackages(mDPM, packages);
                    mActivity.startLockTask();
                }
            }
        } catch (Exception ignored) {
        }
    }

    @ReactMethod
    public void stopLockTask() {
        try {
            Activity mActivity = getCurrentActivity();
            if (mActivity != null) {
                DevicePolicyManager myDevicePolicyManager = (DevicePolicyManager) mActivity.getSystemService(Context.DEVICE_POLICY_SERVICE);
                if (myDevicePolicyManager != null) {
                    myDevicePolicyManager.clearDeviceOwnerApp(mActivity.getPackageName());
                }
                mActivity.stopLockTask();
            }
        } catch (Exception ignored) {
        }
    }
}
