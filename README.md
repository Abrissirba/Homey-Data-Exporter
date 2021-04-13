# Homey Data Exporter

Data export app for Athom Homey. Listens for new values from devices and sends them to a specified web api.

## Settings

The app is configured in the app settings. There is one section for the connection to the web api and one section where you set which devices and capabiltities that should be synced.

### Connection

The api is opinionated in the format and how it authenticates against the web api. More flexibility and authenticateion methods can be developed if needed.

_BaseUrl_: The base url of the web api
_Devices Endpoint_: The endpoint to which information about the devices should be sent
_Values Endpoint_: The endpoint to which the values should be sent to
_Api Key_: An api key that can be used to authenticate against the web api.

### Devices

A list that shows all the devices and their capabilities. You check all the capabiltities you want to sync. When save is clicked, the devices and capabilitites that are checked will be sent to the devices endpoint

## Local cache

In case the web api can't be reached for some reason, the values will be saved locally on Homey. It will then try to send all values from the locla storage to the web api every 5 minutes.

When the number of values exc eed a certain number (currently 2000), a notification will be created.

## Web Api Models

The objects sent to the web api looks like this. Both devices and values are sent as an array even though e.g. only one value is sent.

### Device endpoint

````{
    id: string;
    name: string;
    zone: string;
    capabilities: {
        id: string;
        decimals: number;
        units: string;
        title: string;
        type: string;
        lastUpdated: Date | string;
        isActivatedForSync?: boolean;
    }[]
}[]```

### Values endpoint
```{
    value: number;
    timestamp: Date | string;
    deviceId: string;
    capabilityId: string;
}[]```
````
