import { isNone } from "./utils";

export interface Settings {
    preload: number;
    scaling: "fit" | "fill";
    [key: string]: any;
}

const defaultsSettings: Settings = {
    preload: 3,
    scaling: "fill",
};

function verifySettingsContent(settings: any): [any, boolean] {
    let changed = false;
    if (typeof settings !== "object") {
        return [defaultsSettings, changed];
    }
    if (isNone(settings.preload)) {
        changed = true;
        settings.preload = defaultsSettings.preload;
    }
    if (!["fit", "fill"].includes(settings.scaling)) {
        changed = true;
        settings.scaling = defaultsSettings.scaling;
    }
    const validKeys = Object.keys(defaultsSettings);
    const addedKeys = Object.keys(settings).filter((e) => validKeys.includes(e));
    const newMapping = {};
    addedKeys.forEach((key) => {
        newMapping[key] = settings[key] || defaultsSettings[key] || null;
    });
    return [newMapping, changed];
}

export function getSettings(storage: Storage) {
    if (typeof storage === "undefined") {
        return defaultsSettings;
    }

    const read = storage.getItem("settings.reader");
    if (isNone(read)) {
        storage.setItem("settings.reader", JSON.stringify(defaultsSettings));
        return defaultsSettings;
    }
    const parsedSettings = JSON.parse(read);
    const [reparsedSettings, isChanged] = verifySettingsContent(parsedSettings);
    if (isChanged) {
        storage.setItem("settings.reader", JSON.stringify(reparsedSettings));
    }
    return reparsedSettings as Settings;
}

export function saveSettings(newSettings: Settings, storage: Storage) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reparsedSettings, _] = verifySettingsContent(newSettings);
    storage.setItem("settings.reader", JSON.stringify(reparsedSettings));
}
