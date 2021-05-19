import Axios, { AxiosResponse } from 'axios';
import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';

import {
  SensorSyncOut,
  SyncOut,
  SyncResponse,
  TemperatureBreachSyncOut,
  TemperatureLogSyncOut,
} from '~features/Sync/types';

class SyncOutManager {
  axios: typeof Axios;

  constructor(axios = Axios) {
    this.axios = axios;
  }

  getAuthenticationBody = (username: string, password: string): string =>
    JSON.stringify({ username, password });

  getSyncBody = (logs: SyncOut[]): string => {
    return JSON.stringify(logs);
  };

  mapSensors = (sensors: Sensor[]): SensorSyncOut[] => {
    return sensors.map((sensor: Sensor) => {
      const {
        id,
        logInterval,
        name,
        macAddress,
        batteryLevel,
        logDelay,
        programmedDate,
        isActive,
      } = sensor;

      return {
        id,
        logInterval,
        name,
        macAddress,
        batteryLevel,
        logDelay,
        programmedDate,
        isActive,
      };
    });
  };

  mapTemperatureLogs = (temperatureLogs: TemperatureLog[]): TemperatureLogSyncOut[] => {
    return temperatureLogs.map((log: TemperatureLog) => {
      const { id, logInterval, sensorId, temperatureBreachId, timestamp, temperature } = log;
      return { id, logInterval, sensorId, temperatureBreachId, timestamp, temperature };
    });
  };

  mapBreaches = (breaches: TemperatureBreach[]): TemperatureBreachSyncOut[] => {
    return breaches.map((breach: TemperatureBreach) => {
      const {
        id,
        temperatureBreachConfiguration,
        sensorId,
        startTimestamp,
        endTimestamp,
        acknowledged,
      } = breach;

      const {
        minimumTemperature,
        maximumTemperature,
        duration,
        id: configId,
      } = temperatureBreachConfiguration;

      const type = configId.includes('HOT') ? 'HOT_CONSECUTIVE' : 'COLD_CONSECUTIVE';
      const thresholdMinimumTemperature = minimumTemperature;
      const thresholdMaximumTemperature = maximumTemperature;
      const thresholdDuration = duration;

      const mapped: TemperatureBreachSyncOut = {
        type,
        thresholdMinimumTemperature,
        thresholdMaximumTemperature,
        thresholdDuration,
        id,
        sensorId,
        startTimestamp,
        acknowledged,
      };

      if (endTimestamp != null) {
        mapped.endTimestamp = endTimestamp;
      }

      return mapped;
    });
  };

  public login = async (
    loginUrl: string,
    username: string,
    password: string
  ): Promise<AxiosResponse<''>> =>
    this.axios.post(loginUrl, this.getAuthenticationBody(username, password), {
      withCredentials: true,
    });

  public syncSensors = async (
    sensorUrl: string,
    logs: Sensor[]
  ): Promise<AxiosResponse<SyncResponse>> =>
    this.axios.put(sensorUrl, this.getSyncBody(this.mapSensors(logs)), {
      withCredentials: true,
    });

  public syncTemperatureLogs = async (
    temperatureLogUrl: string,
    logs: TemperatureLog[]
  ): Promise<AxiosResponse<SyncResponse>> =>
    this.axios.put(temperatureLogUrl, this.getSyncBody(this.mapTemperatureLogs(logs)), {
      withCredentials: true,
    });

  public syncTemperatureBreaches = async (
    temperatureBreachUrl: string,
    logs: TemperatureBreach[]
  ): Promise<AxiosResponse<SyncResponse>> =>
    this.axios.put(temperatureBreachUrl, this.getSyncBody(this.mapBreaches(logs)), {
      withCredentials: true,
    });
}

export { SyncOutManager };
