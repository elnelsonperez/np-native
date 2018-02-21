package com.nppms;

import android.app.Activity;
import android.app.ActivityManager;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.support.annotation.Nullable;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.github.douglasjunior.bluetoothclassiclibrary.BluetoothClassicService;
import com.github.douglasjunior.bluetoothclassiclibrary.BluetoothConfiguration;
import com.github.douglasjunior.bluetoothclassiclibrary.BluetoothService;
import com.github.douglasjunior.bluetoothclassiclibrary.BluetoothStatus;
import com.github.douglasjunior.bluetoothclassiclibrary.BluetoothWriter;
import com.google.gson.Gson;

import java.util.*;

public class BluetoothModule extends ReactContextBaseJavaModule {

    private static final Integer REQUEST_ENABLE_BT = 5;
    private static final UUID BT_UUID = UUID.fromString("7f3d94e2-7fdf-44c7-813a-131727f5faef");
    private Gson gson =  new Gson();
    private Promise bluetoothEnablePromise;
    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothService bluetoothServiceInstance;
    private BluetoothWriter btWriterInstance;
    private BluetoothStatus currentStatus;
    private Timer notConnectedTimer = new Timer();
    private boolean notConnectedTimerRunning =false;
    private Handler notConnectedTimeoutReachedHandler = new Handler(Looper.getMainLooper()) {
        public void handleMessage(Message msg){
            searchForNpModule();
        }};
    private int bluetoothConnectionRetryTimeout = 12000;
    private static final String BT_STATUS_CHANGED = "bluetooth_status_changed";
    private static final String STATUS_CHANGED = "status_changed";
    private static final String DATA_RECEIVED = "data_received";
    private static final String SEARCHING = "searching";
    private static final String CONNECTION_ATTEMP = "connection_attemp";

    private HashSet<String> hubWhitelist = new HashSet<>();

    private String parseBtAdapterStatus (int state) {
        switch (state) {
            case BluetoothAdapter.STATE_OFF:
                return "OFF";
            case BluetoothAdapter.STATE_TURNING_OFF:
                return "TURNING_OFF";
            case BluetoothAdapter.STATE_ON:
                return "ON";
            case BluetoothAdapter.STATE_TURNING_ON:
                return "TURNING_ON";
        }
        return null;
    }

    BluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
                if (requestCode == REQUEST_ENABLE_BT) {
                    if (resultCode == Activity.RESULT_OK) {
                        bluetoothEnablePromise.resolve("Bluetooth Activado");
                        searchForNpModule();
                    } else if (resultCode == Activity.RESULT_CANCELED) {
                        bluetoothEnablePromise.reject("0001", "Solicitud para activar Bluetooth cancelada");
                    }
                }
            }
        };
        reactContext.addActivityEventListener(mActivityEventListener);
        IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        System.out.print(getCurrentActivity());
        BroadcastReceiver mReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                final String action = intent.getAction();
                if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
                    final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE,
                            BluetoothAdapter.ERROR);
                    WritableMap params = Arguments.createMap();
                    String estado = parseBtAdapterStatus(state);
                    params.putString("status", estado);
                    sendEvent(BT_STATUS_CHANGED, params);
                    if (estado.equals("ON")) {
                        if (currentStatus != null && currentStatus == BluetoothStatus.NONE) {
                            searchForNpModule();
                        }
                    }
                }
            }
        };
        getReactApplicationContext().registerReceiver(mReceiver, filter);

    }

    @Override
    public String getName() {
        return "BluetoothModule";
    }

    private void sendEvent(
            String eventName,
            @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private void sendEventWithStringData (
            String eventName,
            String data) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
    }


    private void parseIncomingMessage (String msg) {
        sendEventWithStringData(DATA_RECEIVED, msg);
    }

//    private void parseIncomingMessage (String msg) {
//        try {
//            BtMessage mensaje =  gson.fromJson(msg, BtMessage.class);
//            WritableMap params = Arguments.createMap();
//            params.putString("type", mensaje.getType());
//            params.putDouble("corr_id", mensaje.getCorr_id());
//            params.putMap("payload", Arguments.makeNativeMap(mensaje.getPayload()));
//            sendEvent(DATA_RECEIVED, params);
//            System.out.println(mensaje);
//        } catch (Exception e) {
//            System.out.println(e.getMessage());
//            System.out.println("Invalid Message Received");
//        }
//    }

    private void initializeBluetoothService() {
        BluetoothConfiguration config = new BluetoothConfiguration();
        config.context = getReactApplicationContext();
        config.bluetoothServiceClass = BluetoothClassicService.class;
        config.bufferSize = 99999;
        config.characterDelimiter = '\n';
        config.deviceName = "PMS Client";
        config.callListenersInMainThread = true;
        config.uuid = BT_UUID;
        BluetoothService.init(config);
        final BluetoothService service = BluetoothService.getDefaultInstance();
        bluetoothServiceInstance = service;
        btWriterInstance = new BluetoothWriter(bluetoothServiceInstance);

        bluetoothServiceInstance.setOnEventCallback(new BluetoothService.OnBluetoothEventCallback() {
            @Override
            public void onDataRead(byte[] buffer, int length) {
                parseIncomingMessage(new String(buffer));
                System.out.println(new String(buffer));
            }

            @Override
            public void onStatusChange(BluetoothStatus status) {
                currentStatus = status;
                if (status == BluetoothStatus.NONE && !notConnectedTimerRunning) {
                    notConnectedTimerRunning = true;
                    notConnectedTimer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            if (currentStatus == BluetoothStatus.NONE) {
                                notConnectedTimeoutReachedHandler.sendEmptyMessage(0);
                            }
                            notConnectedTimerRunning = false;
                        }
                    }, bluetoothConnectionRetryTimeout);
                }

                WritableMap params = Arguments.createMap();
                params.putString("status",status.toString());
                sendEvent( STATUS_CHANGED, params);

                System.out.println("*********** "+status.toString());
            }

            @Override
            public void onDeviceName(String deviceName) {
            }

            @Override
            public void onToast(String message) {
            }

            @Override
            public void onDataWrite(byte[] buffer) {
                System.out.println("***** Sending");
            }
        });

        bluetoothServiceInstance.setOnScanCallback(new BluetoothService.OnBluetoothScanCallback() {
            @Override
            public void onDeviceDiscovered(BluetoothDevice device, int rssi) {
                System.out.println("****** DEVICE DISCOVERED");
                System.out.println(device.getAddress());
                if (getNpHubsMacAddresses().contains(device.getAddress())) {
                    bluetoothServiceInstance.stopScan();
                    bluetoothServiceInstance.connect(device);
                }
            }
            @Override
            public void onStartScan() {}
            @Override
            public void onStopScan() {}
        });

    }

    @ReactMethod
    private void searchForNpModule() {
        if (!isServiceRunning(BluetoothClassicService.class)) {
            initializeBluetoothService();
        }
        sendEvent(SEARCHING, null);
        //Searching paired devices
        Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
        Boolean found = false;
        if (pairedDevices.size() > 0) {
            // There are paired devices. Get the name and address of each paired device.
            for (BluetoothDevice device : pairedDevices) {
                if (getNpHubsMacAddresses().contains(device.getAddress())) {
                    found = true;
                    connectToNpModule(device);
                    break;
                }
            }
            if (!found) {
                discoverNpModuleBtDevice();
            }
        } else {
            discoverNpModuleBtDevice();
        }
    }

    private void connectToNpModule(BluetoothDevice device) {
        sendEvent(CONNECTION_ATTEMP, null);
        bluetoothServiceInstance.connect(device);


    }


    private void discoverNpModuleBtDevice() {
        bluetoothServiceInstance.startScan();
    }

    @ReactMethod
    public void send (String data) {
        btWriterInstance.write(data);
    }


    @ReactMethod
    public void initialize (String HubMacAddress, Promise promise) {
        hubWhitelist.add(HubMacAddress);

        bluetoothEnablePromise = promise;
        //Check if bluetooth is supported
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (mBluetoothAdapter == null) {
            promise.reject("0000","El dispositivo no soporta Bluetooth");
        } else {
            if (!mBluetoothAdapter.isEnabled()) {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                getCurrentActivity().startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            }
        }

        String res = parseBtAdapterStatus(mBluetoothAdapter.getState());
        if (res != null && res.equals("ON")) {
            this.searchForNpModule();
        }
    }

    private HashSet getNpHubsMacAddresses() {
        return hubWhitelist;
    }

    private boolean isServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) getCurrentActivity().getSystemService(
                Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    @ReactMethod
    public void setBluetoothConnectionRetryTimeout(int bluetoothConnectionRetryTimeout) {
        this.bluetoothConnectionRetryTimeout = bluetoothConnectionRetryTimeout;
    }
}