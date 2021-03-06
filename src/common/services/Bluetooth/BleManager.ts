import { MacAddress } from '~common/types/common';
import {
  BleManager as BlePlxManager,
  Subscription,
  Characteristic,
  BleError,
  Device,
  ScanOptions,
} from 'react-native-ble-plx';
import { BluetoothDevice } from '~common/services/Bluetooth/types';

export declare class BluetoothManager {
  connectToDevice(macAddress: MacAddress): Promise<BluetoothDevice>;
  isDeviceConnected(macAddress: MacAddress): Promise<boolean>;
  cancelDeviceConnection(macAddress: MacAddress): Promise<BluetoothDevice>;
  discoverAllServicesAndCharacteristicsForDevice(macAddress: MacAddress): Promise<BluetoothDevice>;
  stopDeviceScan(): void;
  startDeviceScan(
    UUIDs: string[] | null,
    options: ScanOptions | null,
    listener: (error: BleError | null, scannedDevice: Device | null) => void
  ): void;
  writeCharacteristicWithoutResponseForDevice(
    deviceIdentifier: string,
    serviceUUID: string,
    characteristicUUID: string,
    base64Value: string,
    transactionId?: string
  ): Promise<Characteristic>;
  monitorCharacteristicForDevice(
    deviceIdentifier: string,
    serviceUUID: string,
    characteristicUUID: string,
    listener: (error: BleError | null, characteristic: Characteristic | null) => void,
    transactionId?: string
  ): Subscription;
}

export const BleManager = (BlePlxManager as unknown) as typeof BluetoothManager;
